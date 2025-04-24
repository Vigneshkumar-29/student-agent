import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { getTestimonialsData } from "@/components/home/TestimonialsData";

function AnimatedTestimonialsDemo() {
  // Get the existing testimonial data
  const existingTestimonials = getTestimonialsData();
  
  // Transform the data to match the expected Testimonial format
  const testimonials = [
    {
      quote: existingTestimonials[0].text,
      name: existingTestimonials[0].author.name,
      designation: existingTestimonials[0].author.handle,
      src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote: existingTestimonials[1].text,
      name: existingTestimonials[1].author.name,
      designation: existingTestimonials[1].author.handle,
      src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote: existingTestimonials[2].text,
      name: existingTestimonials[2].author.name,
      designation: existingTestimonials[2].author.handle,
      src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2022&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote: existingTestimonials[3].text,
      name: existingTestimonials[3].author.name,
      designation: existingTestimonials[3].author.handle,
      src: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote: existingTestimonials[4].text,
      name: existingTestimonials[4].author.name,
      designation: existingTestimonials[4].author.handle,
      src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2187&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote: existingTestimonials[5].text,
      name: existingTestimonials[5].author.name,
      designation: existingTestimonials[5].author.handle,
      src: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote: existingTestimonials[6].text,
      name: existingTestimonials[6].author.name,
      designation: existingTestimonials[6].author.handle,
      src: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote: existingTestimonials[7].text,
      name: existingTestimonials[7].author.name,
      designation: existingTestimonials[7].author.handle,
      src: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];
  
  return (
    <div className="relative">
      {/* Gradient background for the testimonials section */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-50/50 to-white dark:from-gray-900/50 dark:to-gray-950 -z-10"></div>
      
      {/* Section header with the same styling as the original testimonials */}
      <div className="container mx-auto pt-16">
        <div className="flex flex-col items-center gap-6 text-center mb-8">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold">
            Testimonials
          </span>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 dark:from-purple-400 dark:via-indigo-300 dark:to-blue-400">
            Loved by Learners Worldwide
          </h2>
          
          <p className="text-lg max-w-[600px] text-gray-600 dark:text-gray-300 md:text-xl">
            Join thousands of satisfied users who have transformed their learning experience with QuizGen
          </p>
        </div>
      </div>
      
      {/* The animated testimonials component */}
      <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
    </div>
  );
}

export { AnimatedTestimonialsDemo }; 