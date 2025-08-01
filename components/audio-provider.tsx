"use client"

import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from "react"

interface Track {
  id: number
  title: string
  artist: string
  album: string
  duration: number
  audioUrl: string
  image: string
}

interface AudioContextType {
  currentTrack: Track | null
  isPlaying: boolean
  currentTime: number
  volume: number
  playlist: Track[]
  currentIndex: number
  playTrack: (track: Track) => void
  playPlaylist: (tracks: Track[], startIndex?: number) => void
  togglePlayPause: () => void
  nextTrack: () => void
  previousTrack: () => void
  seekTo: (time: number) => void
  setVolume: (volume: number) => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function useAudio() {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider")
  }
  return context
}

interface AudioProviderProps {
  children: ReactNode
}

export function AudioProvider({ children }: AudioProviderProps) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolumeState] = useState(75)
  const [playlist, setPlaylist] = useState<Track[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio()
      audioRef.current.volume = volume / 100

      const audio = audioRef.current

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime)
      }

      const handleEnded = () => {
        nextTrack()
      }

      const handleLoadedMetadata = () => {
        setCurrentTime(0)
      }

      audio.addEventListener("timeupdate", handleTimeUpdate)
      audio.addEventListener("ended", handleEnded)
      audio.addEventListener("loadedmetadata", handleLoadedMetadata)

      return () => {
        audio.removeEventListener("timeupdate", handleTimeUpdate)
        audio.removeEventListener("ended", handleEnded)
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      }
    }
  }, [])

  const playTrack = (track: Track) => {
    if (audioRef.current) {
      setCurrentTrack(track)
      audioRef.current.src = track.audioUrl
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const playPlaylist = (tracks: Track[], startIndex = 0) => {
    setPlaylist(tracks)
    setCurrentIndex(startIndex)
    if (tracks[startIndex]) {
      playTrack(tracks[startIndex])
    }
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const nextTrack = () => {
    if (playlist.length > 0) {
      const nextIndex = (currentIndex + 1) % playlist.length
      setCurrentIndex(nextIndex)
      playTrack(playlist[nextIndex])
    }
  }

  const previousTrack = () => {
    if (playlist.length > 0) {
      const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1
      setCurrentIndex(prevIndex)
      playTrack(playlist[prevIndex])
    }
  }

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100
    }
  }

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        volume,
        playlist,
        currentIndex,
        playTrack,
        playPlaylist,
        togglePlayPause,
        nextTrack,
        previousTrack,
        seekTo,
        setVolume,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}
