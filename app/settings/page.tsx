"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Settings, User, Bell, Volume2, Palette, Shield, Save, Upload, Camera, ArrowLeft, Check, X } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import SearchBar from "@/components/search-bar"

interface UserSettings {
  profilePublic: boolean
  showActivity: boolean
  showPlaylists: boolean
  allowFollows: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  newFollowers: boolean
  playlistUpdates: boolean
  newReleases: boolean
  audioQuality: "low" | "normal" | "high"
  crossfade: boolean
  normalizeVolume: boolean
  theme: "dark" | "light" | "auto"
  language: string
}

interface ProfileData {
  firstName: string
  lastName: string
  username: string
  email: string
  bio: string
  profileImage?: string
}

export default function SettingsPage() {
  const { user, logout, refreshUser } = useAuth()
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    bio: "",
    profileImage: "",
  })
  const [settings, setSettings] = useState<UserSettings>({
    profilePublic: true,
    showActivity: true,
    showPlaylists: true,
    allowFollows: true,
    emailNotifications: true,
    pushNotifications: true,
    newFollowers: true,
    playlistUpdates: true,
    newReleases: true,
    audioQuality: "high",
    crossfade: true,
    normalizeVolume: true,
    theme: "dark",
    language: "en",
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        profileImage: user.profileImage || "",
      })

      if (user.settings) {
        setSettings(user.settings)
      }
    }
  }, [user])

  const handleProfileChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSettingChange = (field: keyof UserSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (imageFile: File): Promise<string | null> => {
  const formData = new FormData()
  formData.append("imageFile", imageFile)

  try {
    const response = await fetch("/api/upload/image", {
      method: "POST",
      body: formData,
    })

    if (response.ok) {
      const data = await response.json()
      return data.imageUrl
    }
  } catch (error) {
    console.error("Error uploading image:", error)
  }

  return null
}

  const saveProfile = async () => {
    if (!user) return

    setSaving(true)
    setMessage("")

    try {
      let imageUrl = profileData.profileImage

      // Upload new image if selected
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        }
      }

      const response = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...profileData,
          profileImage: imageUrl,
          settings,
        }),
      })

      if (response.ok) {
        setMessage("Profile updated successfully!")
        setImageFile(null)
        setImagePreview("")
        await refreshUser()
        setTimeout(() => setMessage(""), 3000)
      } else {
        const error = await response.json()
        setMessage(error.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      setMessage("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access settings</h1>
          <Link href="/login">
            <Button className="bg-white text-black hover:bg-gray-200">Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="text-xl md:text-2xl font-bold">
              NekoSpaces
            </Link>
            <div className="hidden md:block">
              <SearchBar />
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/profile">
                <Button variant="ghost" className="text-white hover:bg-gray-800">
                  Profile
                </Button>
              </Link>
              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
          <div className="md:hidden mt-4">
            <SearchBar />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/profile">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Settings className="w-8 h-8" />
              Settings
            </h1>
            <p className="text-gray-400 mt-2">Manage your account and preferences</p>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.includes("success")
                ? "bg-green-900/50 border border-green-700 text-green-300"
                : "bg-red-900/50 border border-red-700 text-red-300"
            }`}
          >
            {message.includes("success") ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {message}
          </div>
        )}

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-gray-900 border-gray-800">
            <TabsTrigger value="profile" className="data-[state=active]:bg-gray-800">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-gray-800">
              <Shield className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-gray-800">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="audio" className="data-[state=active]:bg-gray-800">
              <Volume2 className="w-4 h-4 mr-2" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-gray-800">
              <Palette className="w-4 h-4 mr-2" />
              Appearance
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Image */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Image
                      src={
                        imagePreview ||
                        profileData.profileImage ||
                        `/placeholder.svg?height=100&width=100&text=${encodeURIComponent(user.firstName + " " + user.lastName)}`
                      }
                      alt="Profile"
                      width={100}
                      height={100}
                      className="rounded-full aspect-square object-cover"
                    />
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 bg-gray-800 hover:bg-gray-700 border-2 border-gray-600"
                      onClick={() => document.getElementById("profile-image")?.click()}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Profile Picture</h3>
                    <p className="text-sm text-gray-400 mb-2">JPG, PNG or GIF. Max size 5MB.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                      onClick={() => document.getElementById("profile-image")?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload New
                    </Button>
                  </div>
                </div>

                <Separator className="bg-gray-800" />

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => handleProfileChange("firstName", e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => handleProfileChange("lastName", e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={(e) => handleProfileChange("username", e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleProfileChange("email", e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => handleProfileChange("bio", e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                  />
                </div>

                {/* Account Type */}
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-semibold">Account Type</h3>
                    <p className="text-sm text-gray-400">Your current account type</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`${
                        user.userType === "author"
                          ? "bg-green-600"
                          : user.userType === "admin"
                            ? "bg-red-600"
                            : "bg-blue-600"
                      } text-white`}
                    >
                      {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                    </Badge>
                    {user.verified && <Badge className="bg-blue-600 text-white">Verified</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Public Profile</h3>
                    <p className="text-sm text-gray-400">Make your profile visible to everyone</p>
                  </div>
                  <Switch
                    checked={settings.profilePublic}
                    onCheckedChange={(checked) => handleSettingChange("profilePublic", checked)}
                  />
                </div>

                <Separator className="bg-gray-800" />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Show Activity</h3>
                    <p className="text-sm text-gray-400">Display your listening activity</p>
                  </div>
                  <Switch
                    checked={settings.showActivity}
                    onCheckedChange={(checked) => handleSettingChange("showActivity", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Show Playlists</h3>
                    <p className="text-sm text-gray-400">Make your playlists visible to others</p>
                  </div>
                  <Switch
                    checked={settings.showPlaylists}
                    onCheckedChange={(checked) => handleSettingChange("showPlaylists", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Allow Follows</h3>
                    <p className="text-sm text-gray-400">Let other users follow you</p>
                  </div>
                  <Switch
                    checked={settings.allowFollows}
                    onCheckedChange={(checked) => handleSettingChange("allowFollows", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Email Notifications</h3>
                    <p className="text-sm text-gray-400">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Push Notifications</h3>
                    <p className="text-sm text-gray-400">Receive push notifications</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                  />
                </div>

                <Separator className="bg-gray-800" />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">New Followers</h3>
                    <p className="text-sm text-gray-400">When someone follows you</p>
                  </div>
                  <Switch
                    checked={settings.newFollowers}
                    onCheckedChange={(checked) => handleSettingChange("newFollowers", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Playlist Updates</h3>
                    <p className="text-sm text-gray-400">When playlists you follow are updated</p>
                  </div>
                  <Switch
                    checked={settings.playlistUpdates}
                    onCheckedChange={(checked) => handleSettingChange("playlistUpdates", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">New Releases</h3>
                    <p className="text-sm text-gray-400">When artists you follow release new music</p>
                  </div>
                  <Switch
                    checked={settings.newReleases}
                    onCheckedChange={(checked) => handleSettingChange("newReleases", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audio Tab */}
          <TabsContent value="audio" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Audio Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="audioQuality">Audio Quality</Label>
                  <Select
                    value={settings.audioQuality}
                    onValueChange={(value: "low" | "normal" | "high") => handleSettingChange("audioQuality", value)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="low">Low (96 kbps)</SelectItem>
                      <SelectItem value="normal">Normal (160 kbps)</SelectItem>
                      <SelectItem value="high">High (320 kbps)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="bg-gray-800" />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Crossfade</h3>
                    <p className="text-sm text-gray-400">Smooth transitions between tracks</p>
                  </div>
                  <Switch
                    checked={settings.crossfade}
                    onCheckedChange={(checked) => handleSettingChange("crossfade", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Normalize Volume</h3>
                    <p className="text-sm text-gray-400">Keep volume consistent across tracks</p>
                  </div>
                  <Switch
                    checked={settings.normalizeVolume}
                    onCheckedChange={(checked) => handleSettingChange("normalizeVolume", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Appearance Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={settings.theme}
                    onValueChange={(value: "dark" | "light" | "auto") => handleSettingChange("theme", value)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ru">Русский</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end pt-6">
          <Button onClick={saveProfile} disabled={saving} className="bg-white text-black hover:bg-gray-200">
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
