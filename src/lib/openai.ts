const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
// Use the notes API key for quiz generation too
const API_KEY = import.meta.env.VITE_NOTES_OPENROUTER_API_KEY;

// Log key availability for debugging (remove in production)
console.log('Quiz API Key loaded:', API_KEY ? 'Yes' : 'No');

const callOpenRouter = async (
  messages: Array<{ role: string; content: string }>,
) => {
  if (!API_KEY) {
    throw new Error("OpenRouter API key is not configured");
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "HTTP-Referer": window.location.origin,
      "X-Title": "Article Quiz Generator",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct:free",
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error("OpenRouter API Error:", error);
    if (response.status === 401) {
      throw new Error(
        "Authentication failed: Invalid API key. Please check your OpenRouter API key.",
      );
    }
    throw new Error(
      error.message || `API call failed with status: ${response.status}`,
    );
  }

  return response.json();
};

export interface QuizQuestion {
  id: string;
  text: string;
  options: Array<{
    id: string;
    text: string;
  }>;
  correctAnswerId: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000,
): Promise<T> {
  let retries = 0;
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      if (retries >= maxRetries || !error?.message?.includes("429")) {
        throw error;
      }
      const delayTime = initialDelay * Math.pow(2, retries);
      console.log(`Rate limited. Retrying in ${delayTime}ms...`);
      await delay(delayTime);
      retries++;
    }
  }
}

// Helper function to extract valid JSON from text that might contain extra content
function extractJsonFromText(text: string): string {
  // Try to find the JSON object in the text
  let trimmedText = text.trim();
  
  // If it already looks like JSON, return it
  if ((trimmedText.startsWith('{') && trimmedText.endsWith('}')) || 
      (trimmedText.startsWith('[') && trimmedText.endsWith(']'))) {
    return trimmedText;
  }
  
  // More advanced extraction for nested structures
  // Look for balanced object - count opening and closing braces
  if (trimmedText.includes('{')) {
    let openBraces = 0;
    let startIdx = trimmedText.indexOf('{');
    let endIdx = -1;
    
    for (let i = startIdx; i < trimmedText.length; i++) {
      if (trimmedText[i] === '{') openBraces++;
      if (trimmedText[i] === '}') openBraces--;
      
      if (openBraces === 0 && startIdx !== -1) {
        endIdx = i + 1;
        break;
      }
    }
    
    if (startIdx !== -1 && endIdx !== -1) {
      return trimmedText.slice(startIdx, endIdx);
    }
    
    // If we got here, we have an incomplete JSON object
    // Attempt to complete the JSON by adding missing closing braces/brackets
    if (startIdx !== -1 && openBraces > 0) {
      console.log(`Attempting to complete incomplete JSON object (missing ${openBraces} closing braces)`);
      let completedJson = trimmedText.slice(startIdx);
      
      // Add the required number of closing braces
      for (let i = 0; i < openBraces; i++) {
        completedJson += '}';
      }
      
      // Try to validate the completed JSON
      try {
        JSON.parse(completedJson);
        console.log("Successfully completed and validated JSON object");
        return completedJson;
      } catch (error) {
        console.warn("Completed JSON is still invalid:", error);
      }
    }
  }
  
  // Look for balanced array - count opening and closing brackets
  if (trimmedText.includes('[')) {
    let openBrackets = 0;
    let startIdx = trimmedText.indexOf('[');
    let endIdx = -1;
    
    for (let i = startIdx; i < trimmedText.length; i++) {
      if (trimmedText[i] === '[') openBrackets++;
      if (trimmedText[i] === ']') openBrackets--;
      
      if (openBrackets === 0 && startIdx !== -1) {
        endIdx = i + 1;
        break;
      }
    }
    
    if (startIdx !== -1 && endIdx !== -1) {
      return trimmedText.slice(startIdx, endIdx);
    }
    
    // If we got here, we have an incomplete JSON array
    // Attempt to complete the JSON by adding missing closing brackets
    if (startIdx !== -1 && openBrackets > 0) {
      console.log(`Attempting to complete incomplete JSON array (missing ${openBrackets} closing brackets)`);
      let completedJson = trimmedText.slice(startIdx);
      
      // Add the required number of closing brackets
      for (let i = 0; i < openBrackets; i++) {
        completedJson += ']';
      }
      
      // Try to validate the completed JSON
      try {
        JSON.parse(completedJson);
        console.log("Successfully completed and validated JSON array");
        return completedJson;
      } catch (error) {
        console.warn("Completed JSON is still invalid:", error);
      }
    }
  }
  
  // Fallback regex approach - try to find any JSON object or array
  let matches;
  
  // Try to match a complete JSON object
  matches = trimmedText.match(/\{(?:[^{}]|(\{(?:[^{}]|{[^{}]*})*\}))*\}/);
  if (matches && matches[0]) {
    return matches[0];
  }
  
  // Try to match a complete JSON array
  matches = trimmedText.match(/\[(?:[^\[\]]|(\[(?:[^\[\]]|\[[^\[\]]*\])*\]))*\]/);
  if (matches && matches[0]) {
    return matches[0];
  }
  
  // No JSON found
  throw new Error("No valid JSON found in response");
}

// Function to create fallback questions when all parsing fails
function createFallbackQuestions(articleText: string, numQuestions: number = 3): QuizQuestion[] {
  console.log("Creating fallback questions as last resort");
  
  // Create generic questions based on the article
  const fallbackQuestions = [];
  
  // Try to extract some words from the article to make the questions somewhat relevant
  const words = articleText
    .split(/\s+/)
    .filter(word => word.length > 5)
    .filter(word => !['about', 'these', 'their', 'there', 'which', 'would'].includes(word.toLowerCase()));
  
  // Get some meaningful words if possible
  const keywords = [...new Set(words)].slice(0, 10);
  
  for (let i = 0; i < numQuestions; i++) {
    let questionText = "";
    let options = [];
    
    // Try to create somewhat meaningful questions if we have keywords
    if (keywords.length > i) {
      const keyword = keywords[i];
      switch (i % 4) {
        case 0:
          questionText = `What is the significance of "${keyword}" in the article?`;
          options = [
            { id: "1", text: `${keyword} plays a central role in the main topic` },
            { id: "2", text: `${keyword} is mentioned but not significant` },
            { id: "3", text: `${keyword} is only referenced in passing` },
            { id: "4", text: `${keyword} is not related to the main topic` }
          ];
          break;
        case 1:
          questionText = `How does the article describe "${keyword}"?`;
          options = [
            { id: "1", text: `As an essential component` },
            { id: "2", text: `As a minor detail` },
            { id: "3", text: `As a potential concern` },
            { id: "4", text: `As an unrelated element` }
          ];
          break;
        case 2:
          questionText = `What is mentioned about "${keyword}" in the article?`;
          options = [
            { id: "1", text: `It is a key concept discussed in detail` },
            { id: "2", text: `It is briefly mentioned` },
            { id: "3", text: `It is compared to other elements` },
            { id: "4", text: `It is used as an example` }
          ];
          break;
        case 3:
          questionText = `Which of the following best describes "${keyword}" according to the article?`;
          options = [
            { id: "1", text: `A fundamental aspect of the topic` },
            { id: "2", text: `A secondary consideration` },
            { id: "3", text: `A related concept` },
            { id: "4", text: `A contrasting element` }
          ];
          break;
      }
    } else {
      // Generic but meaningful fallback questions
      questionText = `What is the main focus of this article?`;
      options = [
        { id: "1", text: "The central theme and key concepts" },
        { id: "2", text: "Background information only" },
        { id: "3", text: "Supporting examples" },
        { id: "4", text: "Related topics" }
      ];
    }
    
    fallbackQuestions.push({
      id: String(i + 1),
      text: questionText,
      options: options,
      correctAnswerId: "1" // Default to first option being correct
    });
  }
  
  return fallbackQuestions;
}

export async function generateQuizQuestions(
  articleText: string,
  numQuestions: number = 5,
): Promise<QuizQuestion[]> {
  if (!API_KEY) {
    throw new Error("OpenRouter API key is not configured");
  }

  if (!articleText.trim()) {
    throw new Error("Article text is required");
  }

  const prompt = `Generate a multiple choice quiz with exactly ${numQuestions} questions based on this article.
Your response must be a valid JSON object containing only a "questions" array.

Article: ${articleText.substring(0, 8000)}

Requirements:
1. Response must be ONLY valid JSON, no other text or explanations allowed.
2. Each question must have exactly 4 meaningful and distinct options that are directly related to the article content
3. Options must be complete sentences or phrases that make sense as answers
4. One option must be clearly correct based on the article content
5. The other three options should be plausible but incorrect based on the article
6. Format must match this exact structure:
{
  "questions": [
    {
      "text": "Question text here?",
      "options": [
        { "id": "1", "text": "First meaningful option based on article" },
        { "id": "2", "text": "Second meaningful option based on article" },
        { "id": "3", "text": "Third meaningful option based on article" },
        { "id": "4", "text": "Fourth meaningful option based on article" }
      ],
      "correctAnswerId": "1"
    }
  ]
}`;

  try {
    console.log(`Article length: ${articleText.length} characters`);
    
    const response = await retryWithExponentialBackoff(async () => {
      return await callOpenRouter([
        { 
          role: "system", 
          content: "You are a quiz generator that must output only valid JSON matching the exact format specified. No other text or explanations allowed." 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ]);
    });

    console.log("API Response received");
    let content = response.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error("Empty content in API response:", response);
      throw new Error("No content in API response");
    }

    // Log the raw content for debugging
    console.log("Raw API response content:", content);

    // Clean up the response content
    content = content
      .replace(/[\u201C\u201D]/g, '"') // Replace curly quotes
      .replace(/[\u2018\u2019]/g, "'") // Replace curly apostrophes
      .replace(/\n/g, ' ') // Remove newlines
      .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
      .trim();

    // Try to extract JSON if the response contains markdown or extra text
    if (content.includes('```json')) {
      content = content.match(/```json\s*([\s\S]*?)\s*```/)?.[1] || content;
    }
    if (content.includes('{')) {
      content = content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1);
    }

    console.log("Cleaned content:", content);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      console.error("Initial JSON parsing failed:", parseError);
      
      // Try to fix common JSON issues
      content = content
        .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3') // Quote unquoted keys
        .replace(/'/g, '"') // Replace single quotes with double quotes
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/\\n/g, ' ') // Remove escaped newlines
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/([a-zA-Z0-9]+):/g, '"$1":') // Add quotes to unquoted keys
        .replace(/:\s*"([^"]*?)"([,}])/g, ':"$1"$2') // Fix string values
        .replace(/([}\]])\s*([,}])/g, '$1$2'); // Fix nested object/array closing
      
      try {
        parsedResponse = JSON.parse(content);
      } catch (error) {
        console.error("JSON repair failed, creating fallback questions");
        return createFallbackQuestions(articleText, numQuestions);
      }
    }

    // Handle different response formats
    let questions = parsedResponse?.questions;
    if (!questions && typeof parsedResponse === 'object') {
      // Try to find an array in the response
      const arrays = Object.values(parsedResponse).filter(Array.isArray);
      if (arrays.length > 0) {
        questions = arrays[0];
      }
    }

    if (!Array.isArray(questions)) {
      console.error("No valid questions array found, using fallback");
      return createFallbackQuestions(articleText, numQuestions);
    }

    // Transform and validate questions
    return questions.map((q: any, index: number) => {
      // Ensure question has required fields
      if (!q?.text || !Array.isArray(q?.options)) {
        return {
          id: String(index + 1),
          text: q?.text || `Question ${index + 1} about the article`,
          options: Array(4).fill(null).map((_, i) => ({
            id: String(i + 1),
            text: `Option ${i + 1}`
          })),
          correctAnswerId: "1"
        };
      }

      // Ensure exactly 4 options with proper format
      const options = q.options
        .slice(0, 4)
        .map((opt: any, i: number) => ({
          id: String(i + 1),
          text: typeof opt === 'string' ? opt : opt?.text || `Option ${i + 1}`
        }));

      // Add more options if needed
      while (options.length < 4) {
        options.push({
          id: String(options.length + 1),
          text: `Option ${options.length + 1}`
        });
      }

      return {
        id: String(index + 1),
        text: q.text,
        options,
        correctAnswerId: q.correctAnswerId || "1"
      };
    }).slice(0, numQuestions); // Ensure we return exactly the requested number of questions
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    // Return fallback questions instead of throwing
    return createFallbackQuestions(articleText, numQuestions);
  }
}

export async function analyzeImage(
  imageBase64: string,
  question: string
): Promise<string> {
  if (!API_KEY) {
    throw new Error("ImageQA API key is not configured");
  }

  if (!imageBase64) {
    throw new Error("No image provided");
  }

  if (!question.trim()) {
    throw new Error("No question provided");
  }

  try {
    console.log("Making API request to analyze image...");
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Image Analysis Assistant",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-lite-001",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: question
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter API Error:", errorData);
      
      if (response.status === 401 || response.status === 403) {
        throw new Error("API key is invalid or has expired. Please check your configuration.");
      } else if (response.status === 413) {
        throw new Error("Image size is too large. Please use a smaller image.");
      } else if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a few moments.");
      }
      
      throw new Error(
        errorData.message || 
        errorData.error?.message || 
        `API call failed with status: ${response.status}`
      );
    }

    const result = await response.json();
    console.log("API Response:", result);

    if (!result.choices?.[0]?.message?.content) {
      throw new Error("Invalid response format from API");
    }

    return result.choices[0].message.content;
  } catch (error) {
    console.error("Error in analyzeImage:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred while analyzing the image.");
  }
}
