import * as React from "react"
import { toast as sonnerToast } from "sonner"

export interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

export function toast({
  title,
  description,
  variant = "default",
  duration = 3000,
}: ToastProps) {
  sonnerToast[variant === "destructive" ? "error" : "success"](`${title}${description ? `\n${description}` : ""}`, {
    duration,
  })
}

export { toast } 