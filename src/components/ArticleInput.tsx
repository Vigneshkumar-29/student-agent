import React, { useState, useCallback, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Loader2, Upload, FileText, FileType } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { FileUpload } from "./ui/file-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import * as pdfjsLib from "pdfjs-dist";

interface ArticleInputProps {
  onSubmit?: (text: string, numQuestions: number) => void;
  isLoading?: boolean;
}

const ArticleInput = ({
  onSubmit = () => {},
  isLoading = false,
}: ArticleInputProps) => {
  const [articleText, setArticleText] = useState("");
  const [fileName, setFileName] = useState("");
  const [numQuestions, setNumQuestions] = useState("5");
  const [error, setError] = useState("");
  const [processingFile, setProcessingFile] = useState(false);

  // Set up PDF.js worker
  useEffect(() => {
    const workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
  }, []);

  // Function to extract text from PDF
  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument(arrayBuffer);
      const pdf = await loadingTask.promise;
      let fullText = "";

      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n\n";
      }

      return fullText;
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      throw new Error("Failed to extract text from PDF");
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const file = acceptedFiles[0];
      if (!file) return;

      setFileName(file.name);
      setError("");

      // Handle text files
      if (file.type === "text/plain") {
        const text = await file.text();
        setArticleText(text);
        return;
      }

      // Handle PDF files
      if (file.type === "application/pdf") {
        setProcessingFile(true);
        try {
          const text = await extractTextFromPDF(file);
          setArticleText(text);
          setProcessingFile(false);
          return;
        } catch (pdfError) {
          setError(
            pdfError instanceof Error
              ? pdfError.message
              : "Error processing PDF",
          );
          setFileName("");
          setArticleText("");
          setProcessingFile(false);
          return;
        }
      }

      // Unsupported file type
      setError("Currently only .txt and .pdf files are supported");
      setFileName("");
      setArticleText("");
    } catch (err) {
      console.error("Error reading file:", err);
      setError(err instanceof Error ? err.message : "Error reading file");
      setFileName("");
      setArticleText("");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
    },
    multiple: false,
    maxSize: 5 * 1024 * 1024, // 5MB max file size
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (articleText.trim()) {
      setError("");
      onSubmit(articleText, parseInt(numQuestions));
    } else {
      setError("Please enter some text or upload a file");
    }
  };

  return (
    <Card
      className="w-full max-w-2xl mx-auto p-8 bg-white/90 backdrop-blur-md shadow-lg border border-white/30 rounded-xl transition-all hover:shadow-xl"
      style={{ boxShadow: "0 8px 32px rgba(138, 63, 252, 0.2)" }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Article to Quiz Generator
          </h2>
          <p className="text-gray-500">
            Upload a text or PDF file, or paste your text below
          </p>
        </div>

        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <FileUpload
            onDrop={onDrop}
            isDragActive={isDragActive}
            fileName={fileName}
            error={error}
          />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 py-1 bg-white text-gray-500 rounded-full border border-gray-100 shadow-sm">
              Or paste your text
            </span>
          </div>
        </div>

        <Textarea
          placeholder="Paste your article text here..."
          className="min-h-[200px] p-4 border-gray-200 focus:border-purple-300 focus:ring-purple-300 transition-all"
          value={articleText}
          onChange={(e) => {
            setArticleText(e.target.value);
            setError("");
          }}
          disabled={isLoading || processingFile}
        />

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Select value={numQuestions} onValueChange={setNumQuestions}>
              <SelectTrigger>
                <SelectValue placeholder="Number of questions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Questions</SelectItem>
                <SelectItem value="5">5 Questions</SelectItem>
                <SelectItem value="7">7 Questions</SelectItem>
                <SelectItem value="10">10 Questions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="flex-[2] bg-purple-600 hover:bg-purple-700 text-white"
            disabled={isLoading || processingFile || !articleText.trim()}
          >
            {isLoading || processingFile ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isLoading ? "Generating Quiz..." : "Processing File..."}
              </>
            ) : (
              "Generate Quiz"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ArticleInput;
