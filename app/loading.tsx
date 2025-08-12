import { Leaf } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="bg-green-600 p-4 rounded-full mx-auto mb-4 animate-pulse">
          <Leaf className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
        <p className="text-gray-600">Please wait while we load your content</p>
      </div>
    </div>
  )
}
