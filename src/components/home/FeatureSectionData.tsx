import React from "react";
import {
  BookOpen,
  FileQuestion,
  Image,
  Brain,
  Zap,
  CheckCircle,
  StickyNote,
  Sparkles
} from "lucide-react";

export const getQuizGeneratorData = () => {
  return {
    title: "Transform Any Text into",
    gradientText: "Interactive Quizzes",
    description: "Simply paste your text or upload content, and our AI will generate engaging quizzes tailored to your learning needs. Perfect for students, teachers, and self-learners.",
    buttonText: "Create Quiz Now",
    buttonLink: "/quiz-generator",
    badgeIcon: <BookOpen className="h-5 w-5 mr-2" />,
    badgeText: "AI-Powered Quiz Creation",
    badgeColor: "bg-purple-100 text-purple-700",
    bgGradient: "bg-gradient-to-r from-indigo-50 to-purple-50",
    buttonGradient: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700",
    features: [
      {
        icon: <Zap className="h-5 w-5 text-purple-600" />,
        title: "Instant Generation",
        description: "Create comprehensive quizzes in seconds"
      },
      {
        icon: <Brain className="h-5 w-5 text-indigo-600" />,
        title: "Smart Questions",
        description: "AI generates relevant and challenging questions"
      },
      {
        icon: <CheckCircle className="h-5 w-5 text-purple-600" />,
        title: "Customizable Format",
        description: "Multiple choice, true/false, and more"
      }
    ],
    mockupContent: {
      uploadZone: {
        title: "Generate Quiz From Text",
        description: "Paste your text or upload document",
        icon: "file-text",
        supportedFormats: "TXT, PDF, DOCX, MD",
        maxSize: "Up to 5MB"
      },
      imageDemo: {
        src: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
        alt: "Quiz generation interface",
        tools: ["customize", "preview", "export"],
        overlayText: "AI has generated 15 questions from your content"
      },
      sampleQuestions: [
        "Generate multiple-choice questions",
        "Create true/false questions",
        "Include short answer questions"
      ]
    }
  };
};

export const getPDFAssistantData = () => {
  return {
    title: "Get Instant Answers from",
    gradientText: "Your PDF Documents",
    description: "Upload your PDF documents and get immediate answers to any question. Our AI assistant makes studying and research efficient and interactive.",
    buttonText: "Try PDF Assistant",
    buttonLink: "/pdf-qa",
    badgeIcon: <FileQuestion className="h-5 w-5 mr-2" />,
    badgeText: "Smart PDF Assistant",
    badgeColor: "bg-blue-100 text-blue-700",
    bgGradient: "bg-gradient-to-r from-blue-50 to-indigo-50",
    buttonGradient: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
    features: [
      {
        icon: <FileQuestion className="h-5 w-5 text-blue-600" />,
        title: "Smart Document Analysis",
        description: "AI understands and processes your PDFs instantly"
      },
      {
        icon: <Brain className="h-5 w-5 text-indigo-600" />,
        title: "Contextual Understanding",
        description: "Get accurate answers based on document context"
      },
      {
        icon: <CheckCircle className="h-5 w-5 text-blue-600" />,
        title: "Quick References",
        description: "Find specific information in large documents"
      }
    ],
    mockupContent: {
      uploadZone: {
        title: "Chat with your PDF",
        description: "Upload your document to begin",
        icon: "file-text",
        supportedFormats: "PDF files",
        maxSize: "Up to 20MB"
      },
      imageDemo: {
        src: "https://images.unsplash.com/photo-1586772002130-b0f3bea86b1a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
        alt: "PDF chat interface",
        tools: ["search", "highlight", "bookmark"],
        overlayText: "References found on pages 3, 15, and 42"
      },
      sampleQuestions: [
        "Summarize the key findings in this paper",
        "What does the author say about climate impact?",
        "Find statistical data on population growth"
      ]
    }
  };
};

export const getImageQAData = () => {
  return {
    title: "Understand Images with",
    gradientText: "AI-Powered Analysis",
    description: "Upload any image - diagrams, charts, graphs, or visual content - and ask questions to get instant, accurate explanations powered by advanced AI. Perfect for visual learners and researchers.",
    buttonText: "Try Image Analysis",
    buttonLink: "/image-qa",
    badgeIcon: <Image className="h-5 w-5 mr-2" />,
    badgeText: "Visual Learning Made Easy",
    badgeColor: "bg-emerald-100 text-emerald-700",
    bgGradient: "bg-gradient-to-r from-emerald-50 to-teal-50",
    buttonGradient: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700",
    features: [
      {
        icon: <Image className="h-5 w-5 text-emerald-600" />,
        title: "Advanced Visual Recognition",
        description: "AI precisely analyzes charts, diagrams, and complex visuals"
      },
      {
        icon: <Brain className="h-5 w-5 text-teal-600" />,
        title: "Context-Aware Understanding",
        description: "Understands relationships between visual elements"
      },
      {
        icon: <CheckCircle className="h-5 w-5 text-emerald-600" />,
        title: "Interactive Visual Learning",
        description: "Ask follow-up questions about specific image details"
      }
    ],
    mockupContent: {
      uploadZone: {
        title: "Analyze Any Visual Content",
        description: "Upload your image to get started",
        icon: "upload-cloud",
        supportedFormats: "Supports PNG, JPG, JPEG, GIF",
        maxSize: "Up to 10MB"
      },
      imageDemo: {
        src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&h=400&auto=format&fit=crop",
        alt: "Data visualization chart for analysis",
        tools: ["zoom", "rotate", "annotate"],
        overlayText: "AI can explain the key trends in this visualization"
      },
      sampleQuestions: [
        "What does this diagram show?",
        "Explain the relationship in this chart",
        "What are the key elements in this image?"
      ]
    }
  };
};

export const getSmartNotesData = () => {
  return {
    title: "Enhance Your Learning with",
    gradientText: "Smart AI Notes",
    description: "Create, organize, and transform your notes with the power of AI. Smart Notes helps you visualize concepts, create flashcards, and get comprehensive summaries of your study materials.",
    buttonText: "Try Smart Notes",
    buttonLink: "/notes",
    badgeIcon: <StickyNote className="h-5 w-5 mr-2" />,
    badgeText: "AI-Powered Study Assistant",
    badgeColor: "bg-amber-100 text-amber-700",
    bgGradient: "bg-gradient-to-r from-amber-50 to-orange-50",
    buttonGradient: "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700",
    features: [
      {
        icon: <Sparkles className="h-5 w-5 text-amber-600" />,
        title: "AI Content Analysis",
        description: "Get key concepts and summaries automatically"
      },
      {
        icon: <Brain className="h-5 w-5 text-orange-600" />,
        title: "Interactive Mindmaps",
        description: "Visualize concepts and connections"
      },
      {
        icon: <CheckCircle className="h-5 w-5 text-amber-600" />,
        title: "Flashcard Generation",
        description: "Convert notes to study flashcards instantly"
      }
    ],
    mockupContent: {
      uploadZone: {
        title: "Smart Notes Workspace",
        description: "Create or import your notes",
        icon: "sticky-note",
        supportedFormats: "Text, Images, Audio",
        maxSize: "No limits"
      },
      imageDemo: {
        src: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
        alt: "Smart notes with mind map",
        tools: ["mindmap", "flashcards", "summarize"],
        overlayText: "AI has created a visual mind map from your notes"
      },
      sampleQuestions: [
        "Summarize my notes into key points",
        "Create a concept map of these ideas",
        "Generate flashcards from this material"
      ]
    }
  };
}; 