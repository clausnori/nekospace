import { Card, CardContent } from "@/components/ui/card"

export default function AlbumsLoading() {
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
        {/* Page Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-48 bg-gray-700 rounded animate-pulse mb-4"></div>
          <div className="h-4 w-96 bg-gray-700 rounded animate-pulse mb-6"></div>

          {/* Filters Skeleton */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="h-10 flex-1 max-w-md bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-full md:w-48 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Albums Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="w-full aspect-square bg-gray-700 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-5 w-16 bg-gray-700 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
