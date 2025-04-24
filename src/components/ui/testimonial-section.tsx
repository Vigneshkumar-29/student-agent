import React from "react";
import { TestimonialCard } from "./testimonial-card";
import { motion } from "framer-motion";

export function TestimonialSection() {
  const testimonials = [
    {
      quote:
        "This quiz generator has transformed how I study. The questions are relevant and challenging!",
      author: "Sarah Johnson",
      role: "Student",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    },
    {
      quote:
        "I use this tool to create quizzes for my classroom. It saves me hours of preparation time.",
      author: "Michael Chen",
      role: "Teacher",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
    },
    {
      quote:
        "The instant feedback feature helps me identify knowledge gaps immediately. Highly recommended!",
      author: "Emily Rodriguez",
      role: "Researcher",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            What Our Users Say
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Discover how QuizGen is helping people learn more effectively
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <TestimonialCard
                quote={testimonial.quote}
                author={testimonial.author}
                role={testimonial.role}
                avatarUrl={testimonial.avatarUrl}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
