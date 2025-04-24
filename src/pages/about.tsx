import React from "react";
import { Container } from "@/components/ui/container";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, BookOpen, Brain, Globe, Users, Lightbulb, Award, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PurpleButton } from "@/components/ui/purple-button";

const AboutPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Learning",
      description: "Our advanced AI algorithms create personalized quizzes tailored to each student's learning style and pace."
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "PDF Analysis",
      description: "Transform any PDF document into interactive quizzes and study materials with our intelligent analysis system."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Community",
      description: "Join educators and students from over 150 countries in revolutionizing the way we learn and teach."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Feedback",
      description: "Get real-time insights and detailed analytics to track progress and identify areas for improvement."
    }
  ];

  const team = [
    {
      name: "Dr. Sarah Chen",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      bio: "Former EdTech researcher with 15+ years of experience in AI and education."
    },
    {
      name: "Michael Rodriguez",
      role: "Chief Technology Officer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      bio: "AI specialist with a passion for creating accessible educational tools."
    },
    {
      name: "Dr. Emily Thompson",
      role: "Head of Education",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      bio: "20+ years of experience in curriculum development and educational psychology."
    }
  ];

  const values = [
    {
      title: "Education for All",
      description:
        "We believe in making quality educational tools accessible to everyone.",
      icon: BookOpen,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Innovation",
      description:
        "We continuously explore new technologies to enhance the learning experience.",
      icon: Lightbulb,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Community",
      description:
        "We foster a supportive community of educators and learners.",
      icon: Users,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Excellence",
      description:
        "We strive for excellence in everything we do, from code to customer support.",
      icon: Award,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-purple-50 to-white py-24 mt-16">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Revolutionizing Education Through AI
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              We're on a mission to make learning more engaging, effective, and accessible for everyone through the power of artificial intelligence.
            </p>
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              Join Our Community <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </Container>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute -top-40 -left-32 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        </div>
      </div>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose QuizGen?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI technology with proven educational methodologies to create an unparalleled learning experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 text-purple-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-gray-50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Led by experts in education, technology, and artificial intelligence, our team is dedicated to transforming the future of learning.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative mb-6 inline-block">
                  <div className="w-48 h-48 mx-auto rounded-full overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600/20 to-transparent" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-purple-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Learning Experience?</h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Join thousands of educators and students who are already using QuizGen to revolutionize their learning journey.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-purple-50">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Schedule Demo
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
