"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Check, Download, Copy } from "lucide-react"
import QRCode from "react-qr-code"

interface ShareChannelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  channelUrl: string
}

export default function ShareChannelDialog({ open, onOpenChange, channelUrl }: ShareChannelDialogProps) {
  const [copied, setCopied] = useState(false)
  const qrCodeRef = useRef<HTMLDivElement>(null)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(channelUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadQRCode = () => {
    if (!qrCodeRef.current) return

    // Create a canvas element
    const canvas = document.createElement("canvas")
    const svg = qrCodeRef.current.querySelector("svg")

    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()

    img.onload = () => {
      // Set canvas dimensions to match the SVG with some padding
      canvas.width = img.width + 40
      canvas.height = img.height + 40
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Fill with white background
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw the image centered
      ctx.drawImage(img, 20, 20)

      // Create download link
      const link = document.createElement("a")
      link.download = `channel-qrcode.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    }

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Channel</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6">
          <div ref={qrCodeRef} className="bg-white p-4 rounded-lg">
            <QRCode value={channelUrl} size={200} level="H" className="h-auto max-w-full" />
          </div>
          <p className="mt-4 text-sm text-center text-muted-foreground">
            Scan this QR code to access the channel directly
          </p>
          <div className="mt-2 w-full text-center">
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline break-all"
            >
              {channelUrl}
            </a>
          </div>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
            <Button variant="default" size="sm" onClick={downloadQRCode}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
