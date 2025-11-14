/**
 * Auto Processing Hook
 * Automatically triggers background worker for queued multimedia
 * 
 * Usage: Add this to your app layout or multimedia page during development
 * In production, replace with proper cron job / BullMQ / Inngest
 */

'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseAutoProcessingOptions {
  enabled?: boolean
  intervalMs?: number // Check interval in milliseconds
  maxRetries?: number
}

export function useAutoProcessing(options: UseAutoProcessingOptions = {}) {
  const {
    enabled = false, // Disabled by default - enable only for development
    intervalMs = 10000, // Check every 10 seconds
    maxRetries = 3,
  } = options

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)

  const processNext = useCallback(async () => {
    try {
      const response = await fetch('/api/multimedia/worker', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        console.log('✅ Auto-processed:', data)
        retryCountRef.current = 0 // Reset retry count on success
        
        // If job was processed, immediately check for more
        if (data.processed > 0) {
          setTimeout(processNext, 1000) // Wait 1s then check again
        }
      } else if (data.message === 'No jobs in queue') {
        // Queue is empty, that's ok
        retryCountRef.current = 0
      } else {
        throw new Error(data.error || 'Processing failed')
      }
    } catch (error) {
      console.error('❌ Auto-processing error:', error)
      retryCountRef.current++

      if (retryCountRef.current >= maxRetries) {
        console.warn('⚠️  Max retries reached, pausing auto-processing')
        // Stop the interval after max retries
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [maxRetries])

  useEffect(() => {
    if (!enabled) return

    console.log('🔄 Auto-processing enabled (check every ${intervalMs}ms)')

    // Initial check
    processNext()

    // Set up interval
    intervalRef.current = setInterval(processNext, intervalMs)

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        console.log('🛑 Auto-processing stopped')
      }
    }
  }, [enabled, intervalMs, processNext])

  return {
    triggerNow: processNext,
  }
}

