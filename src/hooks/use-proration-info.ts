/**
 * Proration Info Hook
 * Fetches and manages proration information after payment
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ProrationInfo {
  amount: number
  currency: string
  date: string
  invoice_id: string
}

export function useProrationInfo() {
  const [prorationInfo, setProrationInfo] = useState<ProrationInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProrationInfo()
  }, [])

  const fetchProrationInfo = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      // Get user's profile with settings (JSONB column)
      const { data: profile } = await supabase
        .from('profiles')
        .select('settings')
        .eq('id', user.id)
        .single<{ settings: { last_proration?: ProrationInfo } }>()

      if (profile?.settings?.last_proration) {
        const proration = profile.settings.last_proration
        
        // Only show if it's recent (within last 10 minutes)
        const prorationDate = new Date(proration.date)
        const now = new Date()
        const minutesAgo = (now.getTime() - prorationDate.getTime()) / 1000 / 60
        
        if (minutesAgo < 10) {
          setProrationInfo(proration)
        }
      }
    } catch (error) {
      console.error('Error fetching proration info:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearProrationInfo = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      // Clear proration info from settings
      // Cast to any due to Supabase type inference issue with JSONB columns
      /* eslint-disable @typescript-eslint/no-explicit-any */
      await (supabase
        .from('profiles') as any)
        .update({
          settings: {
            last_proration: null
          }
        })
        .eq('id', user.id)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      setProrationInfo(null)
    } catch (error) {
      console.error('Error clearing proration info:', error)
    }
  }

  return {
    prorationInfo,
    loading,
    clearProrationInfo,
  }
}

