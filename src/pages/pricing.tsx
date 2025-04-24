import React from "react";
import { Container } from "@/components/ui/container";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PurpleButton } from "@/components/ui/purple-button";

const PricingPage = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for trying out our quiz generator",
      features: [
        "5 quizzes per month",
        "Up to 5 questions per quiz",
        "Basic analytics",
        "Text file uploads",
        "Download as PDF",
      ],
      notIncluded: [
        "Advanced analytics",
        "Unlimited quizzes",
        "Custom branding",
        "API access",
      ],
      buttonText: "Get Started",
      buttonVariant: "outline",
      popular: false,
    },
    {
      name: "Pro",
      price: "$12",
      period: "per month",
      description: "For educators and content creators",
      features: [
        "Unlimited quizzes",
        "Up to 20 questions per quiz",
        "Advanced analytics",
        "Multiple file formats",
        "Custom branding",
        "Priority support",
        "Quiz templates",
      ],
      notIncluded: ["API access"],
      buttonText: "Upgrade to Pro",
      buttonVariant: "purple",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$49",
      period: "per month",
      description: "For organizations and institutions",
      features: [
        "Everything in Pro",
        "Unlimited questions",
        "API access",
        "SSO integration",
        "Custom domain",
        "Dedicated support",
        "Team management",
        "Advanced security",
      ],
      notIncluded: [],
      buttonText: "Contact Sales",
      buttonVariant: "outline",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/30">
      <Header />
      <Container className="pt-20 pb-16">
        <div className="py-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="hover:bg-white/50 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that's right for you and start creating interactive
            quizzes today.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className={`p-8 h-full flex flex-col bg-white/90 backdrop-blur-md shadow-lg border transition-all hover:shadow-xl ${plan.popular ? "border-purple-300 relative" : "border-white/30"}`}
                style={
                  plan.popular
                    ? { boxShadow: "0 8px 32px rgba(138, 63, 252, 0.2)" }
                    : {}
                }
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {plan.name}
                  </h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-extrabold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="ml-1 text-xl font-medium text-gray-500">
                      /{plan.period}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-500">{plan.description}</p>
                </div>

                <div className="space-y-4 mb-8 flex-grow">
                  <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wider">
                    What's included
                  </h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.notIncluded.length > 0 && (
                    <>
                      <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wider mt-6">
                        Not included
                      </h4>
                      <ul className="space-y-3">
                        {plan.notIncluded.map((feature) => (
                          <li key={feature} className="flex items-start">
                            <X className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" />
                            <span className="text-gray-500">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                {plan.buttonVariant === "purple" ? (
                  <PurpleButton
                    className="w-full justify-center"
                    onClick={() =>
                      plan.name === "Enterprise" ? navigate("/contact") : {}
                    }
                  >
                    {plan.buttonText}
                  </PurpleButton>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full border-purple-200 hover:border-purple-300 hover:bg-purple-50/50"
                    onClick={() =>
                      plan.name === "Enterprise" ? navigate("/contact") : {}
                    }
                  >
                    {plan.buttonText}
                  </Button>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto bg-white/80 backdrop-blur-md rounded-xl p-8 border border-white/30 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Can I upgrade or downgrade my plan?
              </h3>
              <p className="mt-2 text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                will be reflected in your next billing cycle.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Do you offer discounts for educational institutions?
              </h3>
              <p className="mt-2 text-gray-600">
                Yes, we offer special pricing for schools and universities.
                Please contact our sales team for more information.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">
                What payment methods do you accept?
              </h3>
              <p className="mt-2 text-gray-600">
                We accept all major credit cards, PayPal, and bank transfers for
                Enterprise plans.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Is there a free trial for paid plans?
              </h3>
              <p className="mt-2 text-gray-600">
                Yes, we offer a 14-day free trial for our Pro plan so you can
                experience all the features before committing.
              </p>
            </div>
          </div>
        </div>
      </Container>
      <Footer />
    </div>
  );
};

export default PricingPage;
