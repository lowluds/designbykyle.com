"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Instagram, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InstagramPostEmbedProps {
  postUrl: string
  title?: string
  artist?: string
}

export function InstagramPostEmbed({ postUrl, title, artist }: InstagramPostEmbedProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Load Instagram embed script
    const script = document.createElement('script')
    script.src = 'https://www.instagram.com/embed.js'
    script.async = true
    script.onload = () => {
      // Process Instagram embeds after script loads
      if (window.instgrm) {
        window.instgrm.Embeds.process()
      }
      setIsLoading(false)
    }
    script.onerror = () => setHasError(true)
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  // Reprocess embeds when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.instgrm) {
        window.instgrm.Embeds.process()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleViewInstagram = () => {
    window.open(postUrl, '_blank', 'noopener,noreferrer')
  }

  if (hasError) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <Instagram className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <h3 className="text-sm font-semibold mb-2">Instagram Post Unavailable</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Unable to load this Instagram post. Please visit the link directly.
          </p>
          <Button onClick={handleViewInstagram} variant="outline" size="sm">
            <Instagram className="h-3 w-3 mr-2" />
            View Post
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      {/* Instagram post embed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full h-full"
      >
        {isLoading && (
          <div className="flex items-center justify-center w-full h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold-500"></div>
          </div>
        )}
        
        <div className="instagram-post-container">
          <blockquote
            className="instagram-media"
            data-instgrm-permalink={postUrl}
            data-instgrm-version="14"
            style={{
              background: '#FFF',
              border: '0',
              borderRadius: '3px',
              boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
              margin: '1px',
              maxWidth: '540px',
              minWidth: '326px',
              padding: '0',
              width: 'calc(100% - 2px)'
            }}
            onLoad={() => setIsLoading(false)}
            onError={() => setHasError(true)}
          >
            <div style={{ padding: '16px' }}>
              <a
                href={postUrl}
                style={{
                  background: '#FFFFFF',
                  lineHeight: '0',
                  padding: '0 0',
                  textAlign: 'center',
                  textDecoration: 'none',
                  width: '100%'
                }}
                target="_blank"
                rel="noopener noreferrer"
              >
                View this post on Instagram
              </a>
            </div>
          </blockquote>
        </div>
      </motion.div>
    </div>
  )
}
