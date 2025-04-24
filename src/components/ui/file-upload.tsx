import React from "react";
import { Upload, FileText } from "lucide-react";

interface FileUploadProps {
  onDrop: (acceptedFiles: File[]) => void;
  isDragActive?: boolean;
  fileName?: string;
  error?: string;
}

export function FileUpload({
  onDrop,
  isDragActive = false,
  fileName = "",
  error = "",
}: FileUploadProps) {
  // We're using the props passed from ArticleInput which already has the dropzone setup
  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragActive
            ? "border-purple-500 bg-purple-50/50"
            : error
              ? "border-red-300 bg-red-50/50"
              : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
            <Upload className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">
              {isDragActive
                ? "Drop your file here"
                : "Drag & drop your file here, or click to select"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supported formats: TXT and PDF (max 5MB)
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {fileName && (
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
          <FileText className="h-4 w-4 text-purple-500" />
          <span className="font-medium">{fileName}</span>
        </div>
      )}
    </div>
  );
}
