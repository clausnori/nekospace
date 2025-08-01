"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Heart, MessageCircle, MoreHorizontal, Send, Flag, Edit, Trash2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { formatDistanceToNow } from "date-fns"

interface Comment {
  _id: string
  songId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  timestamp: number
  likes: string[]
  replies: Comment[]
  parentId?: string
  createdAt: string
  updatedAt: string
}

interface CommentSectionProps {
  songId: string
  currentTime?: number
}

export default function CommentSection({ songId, currentTime = 0 }: CommentSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  useEffect(() => {
    fetchComments()
  }, [songId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?songId=${songId}&limit=50`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments)
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setLoading(false)
    }
  }

  const postComment = async () => {
    if (!user || !newComment.trim()) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          songId,
          content: newComment.trim(),
          timestamp: Math.floor(currentTime),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments([data.comment, ...comments])
        setNewComment("")
      }
    } catch (error) {
      console.error("Error posting comment:", error)
    }
  }

  const postReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          songId,
          content: replyContent.trim(),
          timestamp: Math.floor(currentTime),
          parentId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments(
          comments.map((comment) =>
            comment._id === parentId ? { ...comment, replies: [...comment.replies, data.comment] } : comment,
          ),
        )
        setReplyContent("")
        setReplyingTo(null)
      }
    } catch (error) {
      console.error("Error posting reply:", error)
    }
  }

  const toggleLike = async (commentId: string) => {
    if (!user) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setComments(comments.map((comment) => (comment._id === commentId ? data.comment : comment)))
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const editComment = async (commentId: string) => {
    if (!user || !editContent.trim()) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: editContent.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments(comments.map((comment) => (comment._id === commentId ? data.comment : comment)))
        setEditingComment(null)
        setEditContent("")
      }
    } catch (error) {
      console.error("Error editing comment:", error)
    }
  }

  const deleteComment = async (commentId: string) => {
    if (!user || !confirm("Are you sure you want to delete this comment?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setComments(comments.filter((comment) => comment._id !== commentId))
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  const reportComment = async (commentId: string, reason: string) => {
    if (!user) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetType: "comment",
          targetId: commentId,
          reason,
        }),
      })

      if (response.ok) {
        alert("Comment reported successfully")
      }
    } catch (error) {
      console.error("Error reporting comment:", error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-1/4"></div>
                  <div className="h-3 bg-gray-700 rounded animate-pulse w-3/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Comments ({comments.length})</h3>
      </div>

      {/* New Comment */}
      {user && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder={`Add a comment at ${formatTime(Math.floor(currentTime))}...`}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white resize-none"
                  rows={3}
                  maxLength={500}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{newComment.length}/500 characters</span>
                  <Button
                    onClick={postComment}
                    disabled={!newComment.trim()}
                    size="sm"
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment._id} className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={comment.userAvatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {comment.userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{comment.userName}</span>
                    <Badge variant="outline" className="text-xs">
                      {formatTime(comment.timestamp)}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                    {comment.createdAt !== comment.updatedAt && <span className="text-xs text-gray-500">(edited)</span>}
                  </div>

                  {editingComment === comment._id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white resize-none"
                        rows={2}
                        maxLength={500}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => editComment(comment._id)}
                          size="sm"
                          className="bg-white text-black hover:bg-gray-200"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingComment(null)
                            setEditContent("")
                          }}
                          size="sm"
                          variant="ghost"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-300 mb-3">{comment.content}</p>
                  )}

                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLike(comment._id)}
                      className={`text-gray-400 hover:text-white ${
                        user && comment.likes.includes(user._id!) ? "text-red-500" : ""
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 mr-1 ${user && comment.likes.includes(user._id!) ? "fill-current" : ""}`}
                      />
                      {comment.likes.length}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(comment._id)}
                      className="text-gray-400 hover:text-white"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Reply
                    </Button>

                    {user && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-800 border-gray-700">
                          {comment.userId === user._id && (
                            <>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingComment(comment._id)
                                  setEditContent(comment.content)
                                }}
                                className="text-white hover:bg-gray-700"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteComment(comment._id)}
                                className="text-red-400 hover:bg-gray-700"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                          {comment.userId !== user._id && (
                            <DropdownMenuItem
                              onClick={() => reportComment(comment._id, "Inappropriate content")}
                              className="text-yellow-400 hover:bg-gray-700"
                            >
                              <Flag className="w-4 h-4 mr-2" />
                              Report
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment._id && user && (
                    <div className="mt-4 ml-4 border-l-2 border-gray-700 pl-4">
                      <div className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {user.firstName?.[0]}
                            {user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                          <Textarea
                            placeholder="Write a reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white resize-none"
                            rows={2}
                            maxLength={500}
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => postReply(comment._id)}
                              disabled={!replyContent.trim()}
                              size="sm"
                              className="bg-white text-black hover:bg-gray-200"
                            >
                              Reply
                            </Button>
                            <Button
                              onClick={() => {
                                setReplyingTo(null)
                                setReplyContent("")
                              }}
                              size="sm"
                              variant="ghost"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="mt-4 ml-4 border-l-2 border-gray-700 pl-4 space-y-3">
                      {comment.replies.map((reply) => (
                        <div key={reply._id} className="flex gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={reply.userAvatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {reply.userName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{reply.userName}</span>
                              <span className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-gray-300 text-sm">{reply.content}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleLike(reply._id)}
                                className={`text-gray-400 hover:text-white text-xs ${
                                  user && reply.likes.includes(user._id!) ? "text-red-500" : ""
                                }`}
                              >
                                <Heart
                                  className={`w-3 h-3 mr-1 ${
                                    user && reply.likes.includes(user._id!) ? "fill-current" : ""
                                  }`}
                                />
                                {reply.likes.length}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold mb-2">No Comments Yet</h3>
            <p className="text-gray-400">Be the first to comment on this track!</p>
          </div>
        )}
      </div>
    </div>
  )
}
