import { Card, CardContent } from "@/components/ui/card"

export default function PlaylistLoading() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Skeleton */}
      <header className="border-b border-gray-800 bg-black/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-32 bg-gray-700 rounded animate-pulse"></div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-20 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-8 w-20 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button Skeleton */}
        <div className="mb-6">
          <div className="h-8 w-40 bg-gray-700 rounded animate-pulse"></div>
        </div>

        {/* Playlist Hero Skeleton */}
        <div className="flex flex-col md:flex-row items-start gap-8 mb-12">
          <div className="w-96 h-96 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="flex-1 space-y-4">
            <div className="h-6 w-32 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-12 w-96 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-6 w-48 bg-gray-700 rounded animate-pulse"></div>
            <div className="flex gap-6">
              <div className="h-4 w-24 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-20 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-16 bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="h-20 w-full max-w-2xl bg-gray-700 rounded animate-pulse"></div>
            <div className="flex gap-4">
              <div className="h-10 w-32 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-10 w-20 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Track List Header Skeleton */}
        <div className="mb-6">
          <div className="flex items-center gap-4 text-gray-400 text-sm border-b border-gray-800 pb-2">
            <div className="w-8 h-4 bg-gray-700 rounded animate-pulse"></div>
            <div className="flex-1 h-4 bg-gray-700 rounded animate-pulse"></div>
            <div className="w-16 h-4 bg-gray-700 rounded animate-pulse hidden sm:block"></div>
            <div className="w-16 h-4 bg-gray-700 rounded animate-pulse"></div>
            <div className="w-12 h-4 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Track List Skeleton */}
        <div className="space-y-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="bg-transparent border-transparent">
              <CardContent className="p-3">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-4 bg-gray-700 rounded animate-pulse"></div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-700 rounded animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-3 w-32 bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="w-16 h-4 bg-gray-700 rounded animate-pulse hidden sm:block"></div>
                  <div className="w-16 h-4 bg-gray-700 rounded animate-pulse"></div>
                  <div className="w-12 h-4 bg-gray-700 rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
