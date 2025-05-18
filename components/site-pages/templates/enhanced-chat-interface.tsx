"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Send, Paperclip, Smile, Phone, Video, MoreVertical, User, Settings } from "lucide-react"
import { format } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface ChatUser {
  id: string
  name: string
  avatar?: string
  status?: "online" | "offline" | "away" | "busy"
  lastSeen?: Date
  isTyping?: boolean
}

interface ChatMessage {
  id: string
  content: string
  sender: string
  timestamp: Date
  status?: "sent" | "delivered" | "read"
  attachments?: Array<{
    id: string
    type: "image" | "file"
    url: string
    name: string
    size?: number
  }>
}

interface EnhancedChatInterfaceProps {
  title?: string
  currentUser: ChatUser
  contacts?: ChatUser[]
  initialMessages?: Record<string, ChatMessage[]>
  showSidebar?: boolean
  allowAttachments?: boolean
  allowCalls?: boolean
  editMode?: boolean
}

export function EnhancedChatInterface({
  title = "Chat",
  currentUser,
  contacts = [],
  initialMessages = {},
  showSidebar = true,
  allowAttachments = true,
  allowCalls = true,
  editMode = false,
}: EnhancedChatInterfaceProps) {
  const [activeTab, setActiveTab] = useState<"chats" | "contacts">("chats")
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [selectedContact, setSelectedContact] = useState<ChatUser | null>(contacts.length > 0 ? contacts[0] : null)
  const [isTyping, setIsTyping] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, selectedContact])

  // Filter contacts based on search query
  const filteredContacts = contacts.filter((contact) => contact.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Get chat history for selected contact
  const chatHistory = selectedContact ? messages[selectedContact.id] || [] : []

  // Handle sending a message
  const handleSendMessage = () => {
    if (!selectedContact || inputValue.trim() === "") return

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: inputValue,
      sender: currentUser.id,
      timestamp: new Date(),
      status: "sent",
    }

    const updatedMessages = {
      ...messages,
      [selectedContact.id]: [...(messages[selectedContact.id] || []), userMessage],
    }

    setMessages(updatedMessages)
    setInputValue("")

    // Simulate contact typing
    setIsTyping(true)

    // Simulate contact response after a delay
    setTimeout(
      () => {
        const contactMessage: ChatMessage = {
          id: `contact-${Date.now()}`,
          content: getSimulatedResponse(inputValue, selectedContact),
          sender: selectedContact.id,
          timestamp: new Date(),
          status: "read",
        }

        setMessages({
          ...updatedMessages,
          [selectedContact.id]: [...updatedMessages[selectedContact.id], contactMessage],
        })
        setIsTyping(false)
      },
      Math.random() * 2000 + 1000,
    ) // Random delay between 1-3 seconds
  }

  // Handle input change with typing indicator
  const handleInputChange = (value: string) => {
    setInputValue(value)

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout for typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      // Typing stopped
    }, 1000)
  }

  // Handle file selection
  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !selectedContact) return

    // Process each file
    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith("image/")
      const fileUrl = URL.createObjectURL(file)

      // Create attachment message
      const attachmentMessage: ChatMessage = {
        id: `attachment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        content: isImage ? "" : `Sent a file: ${file.name}`,
        sender: currentUser.id,
        timestamp: new Date(),
        status: "sent",
        attachments: [
          {
            id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: isImage ? "image" : "file",
            url: fileUrl,
            name: file.name,
            size: file.size,
          },
        ],
      }

      setMessages({
        ...messages,
        [selectedContact.id]: [...(messages[selectedContact.id] || []), attachmentMessage],
      })
    })

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    toast({
      title: "File sent",
      description: "Your file has been sent successfully.",
    })
  }

  // Handle initiating a call
  const handleCall = (type: "audio" | "video") => {
    if (!selectedContact) return

    toast({
      title: `${type === "audio" ? "Audio" : "Video"} call initiated`,
      description: `Calling ${selectedContact.name}...`,
    })

    // Simulate call rejection after a delay
    setTimeout(() => {
      toast({
        title: "Call ended",
        description: `${selectedContact.name} is not available right now.`,
        variant: "destructive",
      })
    }, 3000)
  }

  // Get a simulated response based on user input
  const getSimulatedResponse = (userInput: string, contact: ChatUser): string => {
    const lowerInput = userInput.toLowerCase()

    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return `Hi there! How can I help you today?`
    } else if (lowerInput.includes("how are you")) {
      return `I'm doing well, thanks for asking! How about you?`
    } else if (lowerInput.includes("bye") || lowerInput.includes("goodbye")) {
      return `Goodbye! Talk to you later.`
    } else if (lowerInput.includes("help")) {
      return `I'd be happy to help. What do you need assistance with?`
    } else if (lowerInput.includes("thanks") || lowerInput.includes("thank you")) {
      return `You're welcome! Is there anything else I can help with?`
    } else if (lowerInput.includes("time") || lowerInput.includes("date")) {
      return `It's currently ${format(new Date(), "h:mm a 'on' MMMM d, yyyy")}.`
    } else if (lowerInput.includes("call")) {
      return `Sure, I can call you. Would you prefer audio or video?`
    } else if (lowerInput.includes("meeting") || lowerInput.includes("schedule")) {
      return `I'm available for a meeting tomorrow afternoon. Does that work for you?`
    } else {
      const responses = [
        "That's interesting. Tell me more.",
        "I see. What else is on your mind?",
        "Got it. Is there anything specific you'd like to discuss?",
        "Thanks for sharing that with me.",
        "I understand. Let me know if you need anything else.",
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }
  }

  // Render user status indicator
  const renderStatusIndicator = (status?: string) => {
    if (!status) return null

    const statusColors = {
      online: "bg-green-500",
      offline: "bg-gray-500",
      away: "bg-yellow-500",
      busy: "bg-red-500",
    }

    return (
      <span
        className={`absolute bottom-0 right-0 w-3 h-3 ${
          statusColors[status as keyof typeof statusColors]
        } rounded-full border-2 border-white`}
      />
    )
  }

  // Format timestamp
  const formatMessageTime = (timestamp: Date) => {
    const now = new Date()
    const messageDate = new Date(timestamp)

    // If same day, show time
    if (
      messageDate.getDate() === now.getDate() &&
      messageDate.getMonth() === now.getMonth() &&
      messageDate.getFullYear() === now.getFullYear()
    ) {
      return format(messageDate, "h:mm a")
    }

    // If yesterday
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    if (
      messageDate.getDate() === yesterday.getDate() &&
      messageDate.getMonth() === yesterday.getMonth() &&
      messageDate.getFullYear() === yesterday.getFullYear()
    ) {
      return "Yesterday"
    }

    // If within the last week
    const lastWeek = new Date(now)
    lastWeek.setDate(now.getDate() - 7)
    if (messageDate > lastWeek) {
      return format(messageDate, "EEEE")
    }

    // Otherwise show date
    return format(messageDate, "MMM d")
  }

  return (
    <div className="w-full max-w-6xl mx-auto my-8 group relative" data-component-type="enhanced-chat-interface">
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

      <Card className="shadow-sm h-[600px] flex flex-col">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-xl flex items-center justify-between">
            <span>{title}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardTitle>
        </CardHeader>
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          {showSidebar && (
            <div className="w-80 border-r flex flex-col">
              <div className="p-3 border-b">
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "chats" | "contacts")}>
                <TabsList className="w-full">
                  <TabsTrigger value="chats" className="flex-1">
                    Chats
                  </TabsTrigger>
                  <TabsTrigger value="contacts" className="flex-1">
                    Contacts
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="chats" className="flex-1 overflow-y-auto">
                  {filteredContacts.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No contacts found</div>
                  ) : (
                    <div className="space-y-1 p-2">
                      {filteredContacts.map((contact) => {
                        const contactMessages = messages[contact.id] || []
                        const lastMessage =
                          contactMessages.length > 0 ? contactMessages[contactMessages.length - 1] : null
                        const unreadCount = contactMessages.filter(
                          (msg) => msg.sender === contact.id && msg.status !== "read",
                        ).length

                        return (
                          <div
                            key={contact.id}
                            className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-muted ${
                              selectedContact?.id === contact.id ? "bg-muted" : ""
                            }`}
                            onClick={() => setSelectedContact(contact)}
                          >
                            <div className="relative mr-3">
                              <Avatar>
                                <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                                <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              {renderStatusIndicator(contact.status)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <span className="font-medium truncate">{contact.name}</span>
                                {lastMessage && (
                                  <span className="text-xs text-muted-foreground">
                                    {formatMessageTime(lastMessage.timestamp)}
                                  </span>
                                )}
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground truncate">
                                  {lastMessage
                                    ? lastMessage.attachments && lastMessage.attachments.length > 0
                                      ? `${lastMessage.sender === currentUser.id ? "You" : contact.name} sent ${
                                          lastMessage.attachments[0].type === "image" ? "an image" : "a file"
                                        }`
                                      : lastMessage.content
                                    : "No messages yet"}
                                </span>
                                {unreadCount > 0 && (
                                  <Badge variant="default" className="ml-2">
                                    {unreadCount}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="contacts" className="flex-1 overflow-y-auto">
                  {filteredContacts.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No contacts found</div>
                  ) : (
                    <div className="space-y-1 p-2">
                      {filteredContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-muted ${
                            selectedContact?.id === contact.id ? "bg-muted" : ""
                          }`}
                          onClick={() => setSelectedContact(contact)}
                        >
                          <div className="relative mr-3">
                            <Avatar>
                              <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                              <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {renderStatusIndicator(contact.status)}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{contact.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {contact.status === "online"
                                ? "Online"
                                : contact.lastSeen
                                  ? `Last seen ${formatMessageTime(contact.lastSeen)}`
                                  : "Offline"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="p-3 border-b flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative mr-3">
                      <Avatar>
                        <AvatarImage src={selectedContact.avatar || "/placeholder.svg"} alt={selectedContact.name} />
                        <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {renderStatusIndicator(selectedContact.status)}
                    </div>
                    <div>
                      <div className="font-medium">{selectedContact.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {selectedContact.isTyping
                          ? "Typing..."
                          : selectedContact.status === "online"
                            ? "Online"
                            : selectedContact.lastSeen
                              ? `Last seen ${formatMessageTime(selectedContact.lastSeen)}`
                              : "Offline"}
                      </div>
                    </div>
                  </div>
                  {allowCalls && (
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleCall("audio")} title="Audio Call">
                        <Phone className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleCall("video")} title="Video Call">
                        <Video className="h-5 w-5" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View profile</DropdownMenuItem>
                          <DropdownMenuItem>Search in conversation</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Mute notifications</DropdownMenuItem>
                          <DropdownMenuItem>Block contact</DropdownMenuItem>
                          <DropdownMenuItem>Clear chat</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {chatHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Send className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                      <p className="text-muted-foreground">
                        Send a message to start a conversation with {selectedContact.name}.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatHistory.map((message, index) => {
                        const isCurrentUser = message.sender === currentUser.id
                        const showAvatar = index === 0 || chatHistory[index - 1].sender !== message.sender

                        return (
                          <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                            {!isCurrentUser && showAvatar && (
                              <Avatar className="mr-2 mt-1">
                                <AvatarImage
                                  src={selectedContact.avatar || "/placeholder.svg"}
                                  alt={selectedContact.name}
                                />
                                <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            )}
                            <div className={`max-w-[70%] ${isCurrentUser ? "order-1" : "order-2"}`}>
                              {/* Message content */}
                              {message.content && (
                                <div
                                  className={`rounded-lg p-3 ${
                                    isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                                  }`}
                                >
                                  <p>{message.content}</p>
                                  <div
                                    className={`text-xs mt-1 ${
                                      isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                                    } flex justify-end items-center`}
                                  >
                                    {format(new Date(message.timestamp), "h:mm a")}
                                    {isCurrentUser && message.status && (
                                      <span className="ml-1">
                                        {message.status === "sent" && "✓"}
                                        {message.status === "delivered" && "✓✓"}
                                        {message.status === "read" && "✓✓"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Attachments */}
                              {message.attachments &&
                                message.attachments.map((attachment) => (
                                  <div
                                    key={attachment.id}
                                    className={`mt-1 rounded-lg overflow-hidden ${
                                      isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                                    }`}
                                  >
                                    {attachment.type === "image" ? (
                                      <div className="relative">
                                        <img
                                          src={attachment.url || "/placeholder.svg"}
                                          alt={attachment.name}
                                          className="max-w-full rounded-lg"
                                        />
                                        <div
                                          className={`text-xs p-2 ${
                                            isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                                          } flex justify-between items-center`}
                                        >
                                          <span>{attachment.name}</span>
                                          <span>
                                            {format(new Date(message.timestamp), "h:mm a")}
                                            {isCurrentUser && message.status && (
                                              <span className="ml-1">
                                                {message.status === "sent" && "✓"}
                                                {message.status === "delivered" && "✓✓"}
                                                {message.status === "read" && "✓✓"}
                                              </span>
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="p-3">
                                        <div className="flex items-center">
                                          <Paperclip className="h-4 w-4 mr-2" />
                                          <span className="text-sm font-medium">{attachment.name}</span>
                                        </div>
                                        {attachment.size && (
                                          <div className="text-xs mt-1">{(attachment.size / 1024).toFixed(1)} KB</div>
                                        )}
                                        <div
                                          className={`text-xs mt-1 ${
                                            isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                                          } flex justify-end items-center`}
                                        >
                                          {format(new Date(message.timestamp), "h:mm a")}
                                          {isCurrentUser && message.status && (
                                            <span className="ml-1">
                                              {message.status === "sent" && "✓"}
                                              {message.status === "delivered" && "✓✓"}
                                              {message.status === "read" && "✓✓"}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </div>
                            {isCurrentUser && showAvatar && (
                              <Avatar className="ml-2 mt-1">
                                <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        )
                      })}

                      {/* Typing indicator */}
                      {isTyping && (
                        <div className="flex justify-start">
                          <Avatar className="mr-2">
                            <AvatarImage
                              src={selectedContact.avatar || "/placeholder.svg"}
                              alt={selectedContact.name}
                            />
                            <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="bg-muted rounded-lg p-3">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                              <div
                                className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                              <div
                                className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                                style={{ animationDelay: "0.4s" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-3 border-t">
                  <div className="flex items-end gap-2">
                    {allowAttachments && (
                      <>
                        <Button variant="ghost" size="icon" className="rounded-full" onClick={handleFileSelect}>
                          <Paperclip className="h-5 w-5" />
                        </Button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
                      </>
                    )}
                    <Textarea
                      placeholder="Type a message..."
                      value={inputValue}
                      onChange={(e) => handleInputChange(e.target.value)}
                      className="flex-1 min-h-[40px] max-h-[120px]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      onClick={() => {
                        // Emoji picker would go here
                        toast({
                          title: "Emoji picker",
                          description: "Emoji picker would open here.",
                        })
                      }}
                    >
                      <Smile className="h-5 w-5" />
                    </Button>
                    <Button
                      variant={inputValue.trim() ? "default" : "ghost"}
                      size="icon"
                      className="rounded-full"
                      disabled={!inputValue.trim()}
                      onClick={handleSendMessage}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Send className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
                <p className="text-muted-foreground">Select a contact to start a conversation.</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
