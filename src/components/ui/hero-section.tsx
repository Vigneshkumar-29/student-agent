import { Button } from "./button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnimatedButton } from "./animated-button";
import { GradientButton } from "./gradient-button";
import { PurpleButton } from "./purple-button";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden pt-32 pb-24">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 transform">
          <div className="h-[600px] w-[1000px] bg-gradient-to-br from-purple-500/30 to-indigo-500/30 blur-3xl opacity-30 rounded-full" />
        </div>
        <div className="absolute bottom-0 right-0">
          <div className="h-[400px] w-[400px] bg-gradient-to-tl from-blue-500/20 to-purple-500/20 blur-3xl opacity-20 rounded-full" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left space-y-8"
          >
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
              Transform Content into
              <span className="block bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mt-2">
                Interactive Quizzes
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
              Upload documents or paste text to create engaging quizzes
              instantly. Test your knowledge with AI-generated questions.
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <PurpleButton
                className="px-10 py-4 text-lg"
                onClick={() => navigate("/quiz-generator")}
              >
                Get Started
              </PurpleButton>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div
              className="backdrop-blur-md bg-white/80 p-8 rounded-2xl shadow-xl border border-white/30"
              style={{ boxShadow: "0 8px 32px rgba(138, 63, 252, 0.4)" }}
            >
              <div className="relative overflow-hidden rounded-xl p-8 text-center space-y-4">
                <div className="absolute inset-0 border-2 border-dashed animate-border-rotate opacity-50 rounded-xl"></div>
                <div className="relative z-10">
                  <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
                    <ArrowRight className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      Create interactive quizzes
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Generate questions from any text content
                    </p>
                  </div>
                  <GradientButton
                    variant="secondary"
                    className="mt-4"
                    onClick={() => navigate("/quiz-generator")}
                  >
                    Try It Now
                  </GradientButton>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
