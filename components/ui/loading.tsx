import { Loader } from "lucide-react"
import { cn } from "@/lib/utils"

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className="flex items-center justify-center">
      <Loader className={cn("h-6 w-6 animate-spin", className)} />
    </div>
  )
} 