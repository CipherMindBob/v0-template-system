"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  MonitorUp,
  Users,
  MessageSquare,
  MoreVertical,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface CallParticipant {
  id: string
  name: string
  avatar?: string
  isMuted?: boolean
  isVideoOff?: boolean
  isScreenSharing?: boolean
}

interface CallComponentProps {
  callType: "audio" | "video"
  participants: CallParticipant[]
  currentUser: CallParticipant
  duration?: number
  isConnecting?: boolean
  isIncoming?: boolean
  callerName?: string
  callerAvatar?: string
  onAnswer?: () => void
  onDecline?: () => void
  onHangup?: () => void
  editMode?: boolean
}

export function CallComponent({
  callType = "video",
  participants = [],
  currentUser,
  duration = 0,
  isConnecting = false,
  isIncoming = false,
  callerName,
  callerAvatar,
  onAnswer,
  onDecline,
  onHangup,
  editMode = false,
}: CallComponentProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoDisabled, setIsVideoDisabled] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [callDuration, setCallDuration] = useState(duration)
  const [layout, setLayout] = useState<"grid" | "spotlight">("grid")
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Start timer when call is connected
  useEffect(() => {
    if (!isConnecting && !isIncoming) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isConnecting, isIncoming])

  // Format call duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted)
    toast({
      title: isMuted ? "Microphone unmuted" : "Microphone muted",
      description: isMuted ? "Others can now hear you" : "Others can't hear you",
    })
  }

  // Toggle video
  const toggleVideo = () => {
    setIsVideoDisabled(!isVideoDisabled)
    toast({
      title: isVideoDisabled ? "Camera turned on" : "Camera turned off",
      description: isVideoDisabled ? "Others can now see you" : "Others can't see you",
    })
  }

  // Toggle screen sharing
  const toggleScreenSharing = () => {
    setIsScreenSharing(!isScreenSharing)
    toast({
      title: isScreenSharing ? "Screen sharing stopped" : "Screen sharing started",
      description: isScreenSharing ? "You stopped sharing your screen" : "You are now sharing your screen",
    })
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true)
        })
        .catch((err) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`)
        })
    } else {
      document
        .exitFullscreen()
        .then(() => {
          setIsFullscreen(false)
        })
        .catch((err) => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`)
        })
    }
  }

  // Handle call actions
  const handleAnswer = () => {
    if (onAnswer) onAnswer()
    toast({
      title: "Call answered",
      description: `You joined the call with ${callerName}`,
    })
  }

  const handleDecline = () => {
    if (onDecline) onDecline()
    toast({
      title: "Call declined",
      description: `You declined the call from ${callerName}`,
    })
  }

  const handleHangup = () => {
    if (onHangup) onHangup()
    toast({
      title: "Call ended",
      description: `Call duration: ${formatDuration(callDuration)}`,
    })
  }

  // Render incoming call UI
  const renderIncomingCall = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <Avatar className="w-24 h-24 mb-4">
          <AvatarImage src={callerAvatar || "/placeholder.svg"} alt={callerName} />
          <AvatarFallback>{callerName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-bold mb-2">{callerName}</h2>
        <p className="text-muted-foreground mb-8">
          {callType === "video" ? "Incoming video call..." : "Incoming call..."}
        </p>
        <div className="flex space-x-4">
          <Button
            variant="destructive"
            size="lg"
            className="rounded-full h-16 w-16 flex items-center justify-center"
            onClick={handleDecline}
          >
            <PhoneOff className="h-8 w-8" />
          </Button>
          <Button
            variant="default"
            size="lg"
            className="rounded-full h-16 w-16 flex items-center justify-center bg-green-500 hover:bg-green-600"
            onClick={handleAnswer}
          >
            <Phone className="h-8 w-8" />
          </Button>
        </div>
      </div>
    )
  }

  // Render connecting UI
  const renderConnecting = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <div className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-primary opacity-75"></div>
          <div className="relative inline-flex rounded-full h-8 w-8 bg-primary"></div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Connecting...</h2>
        <p className="text-muted-foreground mb-8">{callType === "video" ? "Starting video call" : "Starting call"}</p>
        <Button variant="destructive" size="lg" className="rounded-full px-8" onClick={handleHangup}>
          Cancel
        </Button>
      </div>
    )
  }

  // Render active call UI
  const renderActiveCall = () => {
    const allParticipants = [...participants, { ...currentUser, isMuted, isVideoOff: isVideoDisabled, isScreenSharing }]

    return (
      <div className="flex flex-col h-full">
        {/* Call info bar */}
        <div className="bg-muted/50 p-2 flex items-center justify-between">
          <div className="flex items-center">
            <Badge variant="outline" className="mr-2">
              {callType === "video" ? "Video Call" : "Audio Call"}
            </Badge>
            <span className="text-sm">{formatDuration(callDuration)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className={layout === "grid" ? "bg-muted" : ""}
              onClick={() => setLayout("grid")}
            >
              <Users className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={layout === "spotlight" ? "bg-muted" : ""}
              onClick={() => setLayout("spotlight")}
            >
              <MonitorUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={showChat ? "bg-muted" : ""}
              onClick={() => setShowChat(!showChat)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Call content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Video grid */}
          <div className={`flex-1 p-2 ${showChat ? "hidden md:block md:w-2/3" : "w-full"}`}>
            <div
              className={`grid gap-2 h-full ${
                layout === "grid"
                  ? allParticipants.length <= 2
                    ? "grid-cols-1"
                    : allParticipants.length <= 4
                      ? "grid-cols-2"
                      : "grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {layout === "spotlight" && allParticipants.some((p) => p.isScreenSharing) ? (
                // Spotlight view with screen share
                <>
                  <div className="col-span-full row-span-3 bg-black rounded-lg relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src="/placeholder.svg?key=ujiy0"
                        alt="Screen share"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                      {allParticipants.find((p) => p.isScreenSharing)?.name}'s screen
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 w-48 h-36 bg-black rounded-lg shadow-lg overflow-hidden">
                    {currentUser.isVideoOff ? (
                      <div className="h-full flex items-center justify-center bg-muted">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                          <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                    ) : (
                      <img src="/placeholder.svg?key=rktnd" alt="Your video" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                      <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">You</span>
                      {currentUser.isMuted && (
                        <span className="bg-red-500 p-1 rounded-full">
                          <MicOff className="h-3 w-3 text-white" />
                        </span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                // Regular grid or spotlight view
                allParticipants.map((participant, index) => (
                  <div
                    key={participant.id}
                    className={`bg-black rounded-lg relative ${
                      layout === "spotlight" && index === 0 ? "col-span-full row-span-3" : ""
                    }`}
                  >
                    {participant.isVideoOff ? (
                      <div className="h-full flex items-center justify-center bg-muted">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={participant.avatar || "/placeholder.svg"} alt={participant.name} />
                          <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                    ) : (
                      <img
                        src={`/diverse-group.png?key=anto3&height=720&width=1280&query=person ${index + 1} in video call`}
                        alt={`${participant.name}'s video`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    )}
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                      <span className="text-white text-sm bg-black/50 px-2 py-1 rounded">
                        {participant.id === currentUser.id ? "You" : participant.name}
                      </span>
                      <div className="flex space-x-1">
                        {participant.isMuted && (
                          <span className="bg-red-500 p-1 rounded-full">
                            <MicOff className="h-4 w-4 text-white" />
                          </span>
                        )}
                        {participant.isScreenSharing && (
                          <span className="bg-blue-500 p-1 rounded-full">
                            <MonitorUp className="h-4 w-4 text-white" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat panel */}
          {showChat && (
            <div className="w-full md:w-1/3 border-l bg-background">
              <div className="flex flex-col h-full">
                <div className="p-3 border-b">
                  <h3 className="font-medium">Chat</h3>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                  </div>
                </div>
                <div className="p-3 border-t">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <Button size="sm">Send</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call controls */}
        <div className="bg-muted p-4 flex items-center justify-center space-x-2">
          <Button
            variant={isMuted ? "destructive" : "outline"}
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={toggleMute}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          {callType === "video" && (
            <Button
              variant={isVideoDisabled ? "destructive" : "outline"}
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={toggleVideo}
            >
              {isVideoDisabled ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </Button>
          )}

          <Button
            variant="outline"
            size="icon"
            className={`rounded-full h-12 w-12 ${isScreenSharing ? "bg-primary text-primary-foreground" : ""}`}
            onClick={toggleScreenSharing}
          >
            <MonitorUp className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={toggleFullscreen}>
                {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowChat(!showChat)}>
                {showChat ? "Hide Chat" : "Show Chat"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLayout(layout === "grid" ? "spotlight" : "grid")}>
                {layout === "grid" ? "Switch to Spotlight" : "Switch to Grid"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="destructive" size="icon" className="rounded-full h-12 w-12" onClick={handleHangup}>
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto my-8 group relative" data-component-type="call-component">
      {editMode && (
        <div
          className="drag-handle absolute top-2 left-2 bg-primary/90 text-white px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity cursor-move flex items-center gap-1 z-20"
          data-drag-handle
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-grip"
          >
            <circle cx="12" cy="5" r="1" />
            <circle cx="19" cy="5" r="1" />
            <circle cx="5" cy="5" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
            <circle cx="12" cy="19" r="1" />
            <circle cx="19" cy="19" r="1" />
            <circle cx="5" cy="19" r="1" />
          </svg>
          Drag to reorder
        </div>
      )}

      <Card className="shadow-sm h-[600px] overflow-hidden" ref={containerRef}>
        <CardContent className="p-0 h-full">
          {isIncoming ? renderIncomingCall() : isConnecting ? renderConnecting() : renderActiveCall()}
        </CardContent>
      </Card>
    </div>
  )
}
