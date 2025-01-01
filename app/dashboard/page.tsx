import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { PromptEngineer } from '@/lib/prompts/engineer'
import { PromptRefiner } from '@/lib/prompts/refiner'
import { ImageCard } from '@/components/ImageCard'
import { getAllImages } from '@/lib/services/imageService'
import type { GeneratedImage } from '@/types/image'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/signin')
  }

  const userImages = await getAllImages(session.user.id)

  return (
    <div className="flex-1 flex flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Dashboard</h1>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <h2 className="text-lg font-semibold">Generate Image</h2>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <form action="/api/generate" method="POST" className="grid gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="prompt">Prompt</label>
                    <textarea
                      id="prompt"
                      name="prompt"
                      placeholder="Enter your prompt here..."
                      className="h-20 resize-none border rounded-md p-2"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <button
                      type="submit"
                      className="bg-black text-white rounded-md px-4 py-2 hover:bg-gray-800"
                    >
                      Generate
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <h2 className="text-lg font-semibold">Recent Images</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {userImages.map((image) => (
                <ImageCard 
                  key={image._id} 
                  imageUrl={image.imageUrl} 
                  prompt={image.prompt}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
