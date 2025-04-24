import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Upload, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as pdfjs from 'pdfjs-dist';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface ArticleInputProps {
  onSubmit: (text: string, questionCount: number) => void;
  isLoading: boolean;
}

const ArticleInput: React.FC<ArticleInputProps> = ({ onSubmit, isLoading }) => {
  const [articleText, setArticleText] = useState("");
  const [questionCount, setQuestionCount] = useState("5");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (articleText.trim()) {
      onSubmit(articleText, parseInt(questionCount));
    }
  };

  const processFile = async (file: File) => {
    setIsProcessingFile(true);
    setError(null);
    try {
      let text = '';
      
      if (file.type === 'application/pdf') {
        // Handle PDF files
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const textContent = [];
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items
            .map((item: any) => item.str)
            .join(' ');
          textContent.push(pageText);
        }
        
        text = textContent.join('\n\n');
      } else if (file.type === 'text/plain') {
        // Handle text files
        text = await file.text();
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                file.type === 'application/msword') {
        // For Word documents, we'll need to inform the user to copy-paste the content
        throw new Error('Word documents are not directly supported. Please copy and paste the content into the text area.');
      } else {
        throw new Error('Please upload a PDF or text file. For Word documents, please copy and paste the content.');
      }

      setArticleText(text.trim());
    } catch (error) {
      console.error('Error processing file:', error);
      setError(error instanceof Error ? error.message : 'Error processing file');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Article Text</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Number of Questions:</label>
                <Select
                  value={questionCount}
                  onValueChange={setQuestionCount}
                  disabled={isLoading || isProcessingFile}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="7">7</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  className="hidden"
                  onChange={handleFileInput}
                  disabled={isLoading || isProcessingFile}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading || isProcessingFile}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload File
                </Button>
              </label>
            </div>
          </div>

          <div
            className={`relative min-h-[200px] rounded-lg border-2 border-dashed transition-colors ${
              isDragging
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <textarea
              value={articleText}
              onChange={(e) => {
                setArticleText(e.target.value);
                setError(null);
              }}
              placeholder="Paste your article text here or drag & drop a PDF/text file..."
              className="w-full h-full min-h-[200px] p-4 bg-transparent resize-y rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isLoading || isProcessingFile}
            />
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center bg-purple-50 bg-opacity-90 rounded-lg">
                <p className="text-purple-600 font-medium">Drop your file here</p>
              </div>
            )}
            {isProcessingFile && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing file...</span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!articleText.trim() || isLoading || isProcessingFile}
              className="min-w-[150px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Quiz"
              )}
            </Button>
          </div>
        </div>
      </Card>
    </form>
  );
};

export default ArticleInput;
