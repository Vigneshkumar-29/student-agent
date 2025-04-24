import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Share, Download, Copy, Twitter, Facebook, LinkedIn, Mail } from "lucide-react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "@/components/ui/use-toast";

interface QuizExportProps {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  onClose: () => void;
}

const QuizExport = ({
  score,
  correctAnswers,
  totalQuestions,
  timeSpent,
  onClose,
}: QuizExportProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const resultRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Generate a shareable URL with quiz results
    const params = new URLSearchParams({
      score: score.toString(),
      correct: correctAnswers.toString(),
      total: totalQuestions.toString(),
      time: timeSpent.toString(),
    });
    setShareUrl(`${window.location.origin}${window.location.pathname}?${params.toString()}`);
  }, [score, correctAnswers, totalQuestions, timeSpent]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share your results with friends",
        duration: 3000,
      });
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const handleDownloadPDF = async () => {
    if (!resultRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(resultRef.current);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("quiz-results.pdf");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const shareButtons = [
    {
      name: "Twitter",
      icon: <Twitter className="w-5 h-5" />,
      color: "bg-[#1DA1F2] hover:bg-[#1a8cd8]",
      onClick: () => {
        const text = `I scored ${score}% (${correctAnswers}/${totalQuestions}) on the quiz! Try it yourself:`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`);
      },
    },
    {
      name: "Facebook",
      icon: <Facebook className="w-5 h-5" />,
      color: "bg-[#1877F2] hover:bg-[#166fe5]",
      onClick: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
      },
    },
    {
      name: "LinkedIn",
      icon: <LinkedIn className="w-5 h-5" />,
      color: "bg-[#0A66C2] hover:bg-[#094d92]",
      onClick: () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`);
      },
    },
    {
      name: "Email",
      icon: <Mail className="w-5 h-5" />,
      color: "bg-gray-600 hover:bg-gray-700",
      onClick: () => {
        const subject = "Check out my quiz results!";
        const body = `I scored ${score}% (${correctAnswers}/${totalQuestions}) on the quiz! Try it yourself: ${shareUrl}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md bg-white p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">Share Your Results</h3>
          
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 bg-transparent border-none text-sm text-gray-600 focus:outline-none"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              className="shrink-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {shareButtons.map((button) => (
              <Button
                key={button.name}
                onClick={button.onClick}
                className={`${button.color} text-white w-full flex items-center justify-center gap-2`}
              >
                {button.icon}
                {button.name}
              </Button>
            ))}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <Button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Download className="w-5 h-5 mr-2" />
            {isGenerating ? "Generating PDF..." : "Download as PDF"}
          </Button>
        </div>

        <div ref={resultRef} className="hidden">
          {/* This div will be used for PDF generation */}
          <div className="p-6 bg-white space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Quiz Results</h2>
            <div className="space-y-2">
              <p className="text-gray-600">Score: {score}%</p>
              <p className="text-gray-600">
                Correct Answers: {correctAnswers}/{totalQuestions}
              </p>
              <p className="text-gray-600">
                Time Spent: {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
              </p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default QuizExport; 