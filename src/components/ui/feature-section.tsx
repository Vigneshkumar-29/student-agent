import { Brain, FileText, History, Download, Zap, Trophy } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    name: "Easy Text Input",
    description:
      "Upload text files or paste content directly to generate quizzes",
    icon: FileText,
    color: "bg-blue-500",
  },
  {
    name: "AI-Powered Generation",
    description:
      "Advanced AI algorithms create relevant and engaging questions from your content",
    icon: Brain,
    color: "bg-indigo-500",
  },
  {
    name: "Quiz History",
    description:
      "Access your previously generated quizzes and track your learning progress",
    icon: History,
    color: "bg-purple-500",
  },
  {
    name: "Interactive Feedback",
    description:
      "Get immediate feedback with visual cues and celebratory animations",
    icon: Zap,
    color: "bg-pink-500",
  },
  {
    name: "Performance Analytics",
    description: "Track your progress with detailed performance insights",
    icon: Trophy,
    color: "bg-yellow-500",
  },
  {
    name: "Export Results",
    description: "Download your quiz results for offline reference",
    icon: Download,
    color: "bg-green-500",
  },
];

export function FeatureSection() {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">
            Powerful Features
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need for interactive learning
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Generate quizzes, track progress, and enhance your learning
            experience
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-7xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`absolute top-8 right-8 p-2 ${feature.color} rounded-lg text-white`}
                >
                  <feature.icon className="h-5 w-5" />
                </div>
                <div className="max-w-xl">
                  <h3 className="text-xl font-semibold leading-7 text-gray-900">
                    {feature.name}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
