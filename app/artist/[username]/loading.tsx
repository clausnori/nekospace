import { Card, CardContent } from "@/components/ui/card"

export default function ArtistLoading() {
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
          <div className="h-8 w-32 bg-gray-700 rounded animate-pulse"></div>
        </div>

        {/* Artist Hero Skeleton */}
        <div className="flex flex-col md:flex-row items-start gap-8 mb-12">
          <div className="w-72 h-72 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="flex-1 space-y-4">
            <div className="h-6 w-24 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-12 w-96 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-6 w-32 bg-gray-700 rounded animate-pulse"></div>
            <div className="flex gap-6">
              <div className="h-4 w-24 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="h-20 w-full max-w-2xl bg-gray-700 rounded animate-pulse"></div>
            <div className="flex gap-4">
              <div className="h-10 w-24 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-10 w-20 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-10 w-20 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Popular Tracks Skeleton */}
        <div className="mb-12">
          <div className="h-8 w-48 bg-gray-700 rounded animate-pulse mb-6"></div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-4 bg-gray-700 rounded animate-pulse"></div>
                    <div className="w-12 h-12 bg-gray-700 rounded animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-3 w-32 bg-gray-700 rounded animate-pulse"></div>
                    </div>
                    <div className="h-4 w-16 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-12 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Albums Skeleton */}
        <div>
          <div className="h-8 w-32 bg-gray-700 rounded animate-pulse mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="w-full aspect-square bg-gray-700 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
