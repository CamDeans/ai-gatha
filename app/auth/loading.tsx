import { LoadingSpinner } from "@/components/ui/loading"

export default function AuthLoading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <LoadingSpinner />
    </div>
  )
} 