import React, { Suspense, lazy } from "react";
import { Container } from "@/components/ui/container";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

// Lazy load the testimonials component
const TestimonialsSection = lazy(() => import("@/components/ui/testimonials-section").then(module => ({ 
  default: module.TestimonialsSection 
})));

interface TestimonialsSectionProps {
  containerVariants: any;
  itemVariants: any;
  testimonials: any[];
}

export const HomeTestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  containerVariants,
  itemVariants,
  testimonials,
}) => {
  return (
    <Container className="mb-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="relative"
      >
        <motion.div variants={itemVariants} className="text-center mb-12">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold mb-1">
            <Quote className="h-4 w-4 mr-2" />
            What Our Users Say
          </span>
          <Suspense fallback={<div className="p-6 text-center">Loading testimonials...</div>}>
            <TestimonialsSection 
              testimonials={testimonials}
              title="Loved by Learners Worldwide"
              description="Join thousands of satisfied users who have transformed their learning experience with QuizGen"
            />
          </Suspense>
        </motion.div>
      </motion.div>
    </Container>
  );
}; 