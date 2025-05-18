"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Paperclip, Send, Bold, Italic, List, Link } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EmailComponentProps {
  title?: string
  defaultRecipient?: string
  defaultSubject?: string
  defaultBody?: string
  maxAttachmentSize?: number
  maxAttachments?: number
  editMode?: boolean
}

export function EmailComponent({
  title = "Compose Email",
  defaultRecipient = "",
  defaultSubject = "",
  defaultBody = "",
  maxAttachmentSize = 5, // in MB
  maxAttachments = 3,
  editMode = false,
}: EmailComponentProps) {
  const [recipient, setRecipient] = useState(defaultRecipient)
  const [subject, setSubject] = useState(defaultSubject)
  const [body, setBody] = useState(defaultBody)
  const [attachments, setAttachments] = useState<File[]>([])
  const [isSending, setIsSending] = useState(false)
  const [activeTab, setActiveTab] = useState<"compose" | "preview">("compose")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)

    // Check file size
    const oversizedFiles = newFiles.filter((file) => file.size > maxAttachmentSize * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: `Some files exceed the maximum size of ${maxAttachmentSize}MB.`,
        variant: "destructive",
      })
      return
    }

    // Check attachment limit
    if (attachments.length + newFiles.length > maxAttachments) {
      toast({
        title: "Too many attachments",
        description: `You can only attach up to ${maxAttachments} files.`,
        variant: "destructive",
      })
      return
    }

    setAttachments([...attachments, ...newFiles])

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  // Format text (simple implementation)
  const formatText = (format: "bold" | "italic" | "list" | "link") => {
    const textarea = document.getElementById("email-body") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = body.substring(start, end)
    let formattedText = ""

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`
        break
      case "italic":
        formattedText = `*${selectedText}*`
        break
      case "list":
        formattedText = `\n- ${selectedText}`
        break
      case "link":
        formattedText = `[${selectedText}](url)`
        break
    }

    const newBody = body.substring(0, start) + formattedText + body.substring(end)
    setBody(newBody)

    // Focus back on textarea
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length)
    }, 0)
  }

  // Send email
  const handleSend = async () => {
    // Validate inputs
    if (!recipient.trim()) {
      toast({
        title: "Missing recipient",
        description: "Please enter a recipient email address.",
        variant: "destructive",
      })
      return
    }

    if (!subject.trim()) {
      toast({
        title: "Missing subject",
        description: "Please enter a subject for your email.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    try {
      // Simulate sending email
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Success
      toast({
        title: "Email sent",
        description: "Your email has been sent successfully.",
      })

      // Reset form
      setRecipient("")
      setSubject("")
      setBody("")
      setAttachments([])
      setActiveTab("compose")
    } catch (error) {
      toast({
        title: "Failed to send email",
        description: "There was an error sending your email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  // Render email preview with basic formatting
  const renderFormattedBody = () => {
    const formatted = body
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n- (.*)/g, "<ul><li>$1</li></ul>")
      .replace(/\[(.*?)\]$$(.*?)$$/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n/g, "<br />")

    return <div dangerouslySetInnerHTML={{ __html: formatted }} />
  }

  return (
    <div className="w-full max-w-3xl mx-auto my-8 group relative" data-component-type="email-component">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="mr-2 h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>Compose and send emails directly from the application</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "compose" | "preview")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="compose">Compose</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="compose" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">To</Label>
                <Input
                  id="recipient"
                  type="email"
                  placeholder="recipient@example.com"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Email subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="email-body">Message</Label>
                  <div className="flex space-x-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => formatText("bold")}
                      title="Bold"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => formatText("italic")}
                      title="Italic"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => formatText("list")}
                      title="List"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => formatText("link")}
                      title="Link"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="email-body"
                  placeholder="Write your message here..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Attachments ({attachments.length}/{maxAttachments})
                </Label>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center bg-muted p-2 rounded-md text-sm">
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-1"
                        onClick={() => removeAttachment(index)}
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
                          className="lucide lucide-x"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </Button>
                    </div>
                  ))}
                  {attachments.length < maxAttachments && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-10"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="h-4 w-4 mr-2" />
                      Attach File
                    </Button>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximum file size: {maxAttachmentSize}MB. Allowed attachments: {maxAttachments}.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="preview" className="pt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{subject || "(No subject)"}</CardTitle>
                  <CardDescription>To: {recipient || "recipient@example.com"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    {body ? renderFormattedBody() : <p className="text-muted-foreground">(No content)</p>}
                  </div>
                  {attachments.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-medium mb-2">Attachments ({attachments.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {attachments.map((file, index) => (
                          <div key={index} className="flex items-center bg-muted p-2 rounded-md text-sm">
                            <Paperclip className="h-4 w-4 mr-2" />
                            <span className="truncate max-w-[150px]">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setActiveTab(activeTab === "compose" ? "preview" : "compose")}>
            {activeTab === "compose" ? "Preview" : "Edit"}
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
