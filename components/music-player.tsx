"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  VolumeX,
  Heart,
  MoreHorizontal,
  Maximize2,
  ChevronUp,
} from "lucide-react"

interface Track {
  id: number
  title: string
  artist: string
  album: string
  duration: number
  audioUrl: string
  image: string
}

interface MusicPlayerProps {
  currentTrack: Track | null
  isPlaying: boolean
  onPlayPause: () => void
  onNext: () => void
  onPrevious: () => void
  onSeek: (time: number) => void
  currentTime: number
  volume: number
  onVolumeChange: (volume: number) => void
}

export default function MusicPlayer({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  currentTime,
  volume,
  onVolumeChange,
}: MusicPlayerProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isShuffled, setIsShuffled] = useState(false)
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off")
  const [isExpanded, setIsExpanded] = useState(false)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleVolumeToggle = () => {
    if (isMuted) {
      setIsMuted(false)
      onVolumeChange(volume)
    } else {
      setIsMuted(true)
      onVolumeChange(0)
    }
  }

  const handleRepeatToggle = () => {
    const modes: ("off" | "all" | "one")[] = ["off", "all", "one"]
    const currentIndex = modes.indexOf(repeatMode)
    const nextMode = modes[(currentIndex + 1) % modes.length]
    setRepeatMode(nextMode)
  }

  if (!currentTrack) {
    return null
  }

  return (
    <>
      {/* Mobile Player */}
      <Card className="fixed bottom-0 left-0 right-0 bg-gray-900 border-gray-800 border-t border-l-0 border-r-0 border-b-0 rounded-none z-50 md:hidden">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <Image
              src={currentTrack.image || "/placeholder.svg"}
              alt={currentTrack.title}
              width={40}
              height={40}
              className="rounded flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white truncate text-sm">{currentTrack.title}</h3>
              <p className="text-xs text-gray-400 truncate">{currentTrack.artist}</p>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white w-8 h-8" onClick={onPrevious}>
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button size="icon" className="bg-white text-black hover:bg-gray-200 w-10 h-10" onClick={onPlayPause}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white w-8 h-8" onClick={onNext}>
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white w-8 h-8"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <ChevronUp className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-2">
            <Slider
              value={[currentTime]}
              max={currentTrack.duration}
              step={1}
              className="w-full"
              onValueChange={(value) => onSeek(value[0])}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(currentTrack.duration)}</span>
            </div>
          </div>

          {/* Expanded Controls */}
          {isExpanded && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`text-gray-400 hover:text-white w-8 h-8 ${isShuffled ? "text-green-500" : ""}`}
                  onClick={() => setIsShuffled(!isShuffled)}
                >
                  <Shuffle className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`text-gray-400 hover:text-white w-8 h-8 ${repeatMode !== "off" ? "text-green-500" : ""}`}
                  onClick={handleRepeatToggle}
                >
                  <Repeat className="w-4 h-4" />
                  {repeatMode === "one" && <span className="absolute text-xs font-bold">1</span>}
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white w-8 h-8">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white w-8 h-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white w-8 h-8"
                  onClick={handleVolumeToggle}
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  step={1}
                  className="flex-1"
                  onValueChange={(value) => {
                    setIsMuted(false)
                    onVolumeChange(value[0])
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Desktop Player */}
      <Card className="fixed bottom-0 left-0 right-0 bg-gray-900 border-gray-800 border-t border-l-0 border-r-0 border-b-0 rounded-none z-50 hidden md:block">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Track Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Image
                src={currentTrack.image || "/placeholder.svg"}
                alt={currentTrack.title}
                width={56}
                height={56}
                className="rounded flex-shrink-0"
              />
              <div className="min-w-0">
                <h3 className="font-medium text-white truncate">{currentTrack.title}</h3>
                <p className="text-sm text-gray-400 truncate">{currentTrack.artist}</p>
              </div>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Heart className="w-4 h-4" />
              </Button>
            </div>

            {/* Player Controls */}
            <div className="flex flex-col items-center gap-2 flex-1 max-w-md">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`text-gray-400 hover:text-white ${isShuffled ? "text-green-500" : ""}`}
                  onClick={() => setIsShuffled(!isShuffled)}
                >
                  <Shuffle className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={onPrevious}>
                  <SkipBack className="w-5 h-5" />
                </Button>
                <Button size="icon" className="bg-white text-black hover:bg-gray-200 w-10 h-10" onClick={onPlayPause}>
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={onNext}>
                  <SkipForward className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`text-gray-400 hover:text-white ${repeatMode !== "off" ? "text-green-500" : ""}`}
                  onClick={handleRepeatToggle}
                >
                  <Repeat className="w-4 h-4" />
                  {repeatMode === "one" && <span className="absolute text-xs font-bold">1</span>}
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-2 w-full">
                <span className="text-xs text-gray-400 w-10 text-right">{formatTime(currentTime)}</span>
                <Slider
                  value={[currentTime]}
                  max={currentTrack.duration}
                  step={1}
                  className="flex-1"
                  onValueChange={(value) => onSeek(value[0])}
                />
                <span className="text-xs text-gray-400 w-10">{formatTime(currentTrack.duration)}</span>
              </div>
            </div>

            {/* Volume and Actions */}
            <div className="flex items-center gap-2 flex-1 justify-end">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Maximize2 className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white"
                  onClick={handleVolumeToggle}
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  step={1}
                  className="w-24"
                  onValueChange={(value) => {
                    setIsMuted(false)
                    onVolumeChange(value[0])
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
