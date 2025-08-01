"use client"

import MusicPlayer from "@/components/music-player"
import { useAudio } from "@/components/audio-provider"

export default function MusicPlayerWrapper() {
  const { currentTrack, isPlaying, currentTime, volume, togglePlayPause, nextTrack, previousTrack, seekTo, setVolume } =
    useAudio()

  return (
    <MusicPlayer
      currentTrack={currentTrack}
      isPlaying={isPlaying}
      onPlayPause={togglePlayPause}
      onNext={nextTrack}
      onPrevious={previousTrack}
      onSeek={seekTo}
      currentTime={currentTime}
      volume={volume}
      onVolumeChange={setVolume}
    />
  )
}
