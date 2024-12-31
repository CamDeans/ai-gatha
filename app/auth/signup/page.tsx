import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SignUpButtons } from "@/components/auth/SignUpButtons"

export const metadata: Metadata = {
  title: 'Sign Up - AI-Gatha',
  description: 'Create your AI-Gatha account',
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="w-full border-b">
        <div className="flex h-14 items-center justify-end px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Already have an account?
            </span>
            <Button 
              asChild
              className="bg-primary text-primary-foreground shadow hover:bg-primary/90"
            >
              <Link href="/auth/signin">
                Sign in
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Create an account
            </h1>
            <p className="text-muted-foreground">
              Start creating stunning AI art in minutes
            </p>
          </div>

          <div className="space-y-6">
            <SignUpButtons />

            <div className="text-center text-xs text-muted-foreground">
              By creating an account, you agree to our{" "}
              <Link 
                href="/terms" 
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link 
                href="/privacy" 
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 