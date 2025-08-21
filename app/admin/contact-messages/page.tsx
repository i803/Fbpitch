"use client"

import { useEffect, useState, useMemo } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ContactMessageType {
  _id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
}

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessageType[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/contact")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (err) {
      console.error(err)
      alert("Failed to load messages")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/contact?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to delete message")
      setMessages((prev) => prev.filter((msg) => msg._id !== id))
    } catch (err: any) {
      console.error(err)
      alert(err.message || "Failed to delete message")
    } finally {
      setDeletingId(null)
    }
  }

  const filteredMessages = useMemo(() => {
    return messages.filter(
      (msg) =>
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [messages, searchTerm])

  const totalPages = Math.ceil(filteredMessages.length / pageSize)
  const paginatedMessages = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredMessages.slice(start, start + pageSize)
  }, [filteredMessages, currentPage])

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={0} />

      <main className="container mx-auto px-4 py-8">
        <Card className="shadow-xl rounded-lg">
          <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <CardTitle>Contact Messages</CardTitle>
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="max-w-sm"
            />
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-gray-500">Loading messages...</p>
            ) : paginatedMessages.length === 0 ? (
              <p className="text-center py-8 text-gray-400">No messages found.</p>
            ) : (
              <div className="overflow-x-auto">
                <div className="hidden md:table w-full border rounded-lg">
                  <div className="table-header-group bg-gray-700">
                    <div className="table-row">
                      <div className="table-cell p-2 font-medium">Name</div>
                      <div className="table-cell p-2 font-medium">Email</div>
                      <div className="table-cell p-2 font-medium">Subject</div>
                      <div className="table-cell p-2 font-medium">Message</div>
                      <div className="table-cell p-2 font-medium">Sent At</div>
                      <div className="table-cell p-2 font-medium">Action</div>
                    </div>
                  </div>
                  <div className="table-row-group">
                    {paginatedMessages.map((msg) => (
                      <TooltipProvider key={msg._id}>
                        <div className="table-row hover:bg-gray-800 transition-colors duration-150">
                          <div className="table-cell p-2">{msg.name}</div>
                          <div className="table-cell p-2">{msg.email}</div>
                          <div className="table-cell p-2">{msg.subject}</div>
                          <div className="table-cell p-2 max-w-xs truncate">
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="block truncate">{msg.message}</span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs whitespace-normal">
                                {msg.message}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="table-cell p-2">{new Date(msg.createdAt).toLocaleString()}</div>
                          <div className="table-cell p-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(msg._id)}
                              disabled={deletingId === msg._id}
                              className="transition-colors duration-150 hover:bg-red-600"
                            >
                              {deletingId === msg._id ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        </div>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>

                {/* Mobile View */}
                <div className="flex flex-col gap-4 md:hidden">
                  {paginatedMessages.map((msg) => (
                    <Card key={msg._id} className="shadow-md rounded-lg hover:shadow-lg transition-shadow duration-150">
                      <CardContent className="space-y-2">
                        <p>
                          <span className="font-semibold">Name:</span> {msg.name}
                        </p>
                        <p>
                          <span className="font-semibold">Email:</span> {msg.email}
                        </p>
                        <p>
                          <span className="font-semibold">Subject:</span> {msg.subject}
                        </p>
                        <p>
                          <span className="font-semibold">Message:</span> {msg.message}
                        </p>
                        <p>
                          <span className="font-semibold">Sent At:</span>{" "}
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(msg._id)}
                          disabled={deletingId === msg._id}
                          className="w-full mt-2 transition-colors duration-150 hover:bg-red-600"
                        >
                          {deletingId === msg._id ? "Deleting..." : "Delete"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4 gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={i + 1 === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
