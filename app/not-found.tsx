"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Search, Music, Users, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              NekoSpaces
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/discover" className="text-gray-300 hover:text-white transition-colors">
                Discover
              </Link>
              <Link href="/artists" className="text-gray-300 hover:text-white transition-colors">
                Artists
              </Link>
              <Link href="/albums" className="text-gray-300 hover:text-white transition-colors">
                Albums
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-white hover:bg-gray-800">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-white text-black hover:bg-gray-200">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 404 Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Hero */}
          <div className="mb-12">
            <h1 className="text-8xl md:text-9xl font-bold text-gray-800 mb-4">404</h1>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Page Not Found</h2>
            <p className="text-xl text-gray-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            <Link href="/">
              <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Home className="w-8 h-8 mx-auto mb-3 text-blue-500" />
                  <h3 className="font-semibold mb-2">Go Home</h3>
                  <p className="text-sm text-gray-400">Return to the homepage</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/discover">
              <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Search className="w-8 h-8 mx-auto mb-3 text-green-500" />
                  <h3 className="font-semibold mb-2">Discover Music</h3>
                  <p className="text-sm text-gray-400">Find new songs and artists</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/artists">
              <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 mx-auto mb-3 text-purple-500" />
                  <h3 className="font-semibold mb-2">Browse Artists</h3>
                  <p className="text-sm text-gray-400">Explore talented musicians</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/albums">
              <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Music className="w-8 h-8 mx-auto mb-3 text-red-500" />
                  <h3 className="font-semibold mb-2">View Albums</h3>
                  <p className="text-sm text-gray-400">Check out latest releases</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Back Button */}
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="border-gray-700 text-white hover:bg-gray-800 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 NekoSpaces. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
