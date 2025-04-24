import { cn } from "@/lib/utils"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Quote } from "lucide-react"

export interface TestimonialAuthor {
  name: string
  handle: string
  avatar: string
}

export interface TestimonialCardProps {
  author: TestimonialAuthor
  text: string
  href?: string
  className?: string
}

export function TestimonialCard({ 
  author,
  text,
  href,
  className
}: TestimonialCardProps) {
  const Card = href ? 'a' : 'div'
  
  return (
    <Card
      {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "relative flex flex-col rounded-2xl",
        "bg-white dark:bg-gray-800/90",
        "shadow-lg hover:shadow-xl",
        "p-8",
        "text-start",
        "max-w-[350px]",
        "transition-all duration-300 ease-in-out",
        "border border-gray-100 dark:border-gray-700",
        "group hover:-translate-y-1",
        className
      )}
    >
      {/* Decorative quote icon */}
      <Quote className="absolute top-6 right-6 h-8 w-8 text-purple-100 dark:text-purple-900/40 group-hover:text-purple-200 dark:group-hover:text-purple-800/40 transition-colors" />
      
      {/* Main content */}
      <p className="mb-6 text-gray-600 dark:text-gray-300 text-md leading-relaxed relative">
        <span className="font-serif text-3xl text-purple-400 dark:text-purple-500 absolute -left-2 -top-3">"</span>
        {text}
        <span className="font-serif text-3xl text-purple-400 dark:text-purple-500 absolute -right-1 -bottom-4">"</span>
      </p>
      
      {/* Divider */}
      <div className="w-16 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 mb-6 group-hover:w-20 transition-all"></div>
      
      {/* Author info */}
      <div className="flex items-center gap-3 mt-auto">
        <Avatar className="h-12 w-12 ring-2 ring-purple-100 dark:ring-purple-900 group-hover:ring-purple-200 dark:group-hover:ring-purple-800 transition-all">
          <AvatarImage src={author.avatar} alt={author.name} />
        </Avatar>
        <div className="flex flex-col items-start">
          <h3 className="text-md font-semibold leading-none text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
            {author.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {author.handle}
          </p>
        </div>
      </div>
    </Card>
  )
}
