"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Flag } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { REPORT_REASONS } from "@/lib/models/Report"

interface ReportDialogProps {
  targetType: "song" | "user" | "comment" | "playlist"
  targetId: string
  targetTitle?: string
  children?: React.ReactNode
}

export default function ReportDialog({ targetType, targetId, targetTitle, children }: ReportDialogProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!user || !reason) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetType,
          targetId,
          targetTitle,
          reason,
          description: description.trim() || undefined,
        }),
      })

      if (response.ok) {
        alert("Report submitted successfully. Thank you for helping keep our community safe.")
        setOpen(false)
        setReason("")
        setDescription("")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to submit report")
      }
    } catch (error) {
      console.error("Error submitting report:", error)
      alert("Failed to submit report")
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) return null

  const reasons = REPORT_REASONS[targetType] || []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Flag className="w-4 h-4 mr-2" />
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Report {targetType}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Help us keep the community safe by reporting inappropriate content.
            {targetTitle && ` Reporting: "${targetTitle}"`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-white">Reason for reporting *</Label>
            <RadioGroup value={reason} onValueChange={setReason} className="mt-2">
              {reasons.map((reasonOption) => (
                <div key={reasonOption} className="flex items-center space-x-2">
                  <RadioGroupItem value={reasonOption} id={reasonOption} />
                  <Label htmlFor={reasonOption} className="text-sm text-gray-300">
                    {reasonOption}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="description" className="text-white">
              Additional details (optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Provide more context about why you're reporting this..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white mt-2"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1">{description.length}/500 characters</p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={!reason || submitting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </Button>
            <Button onClick={() => setOpen(false)} variant="ghost" className="flex-1 text-gray-400 hover:text-white">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
