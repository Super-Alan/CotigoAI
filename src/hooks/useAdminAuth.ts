import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AdminAuthState {
  isAdmin: boolean
  isLoading: boolean
  error: string | null
}

export function useAdminAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [adminState, setAdminState] = useState<AdminAuthState>({
    isAdmin: false,
    isLoading: true,
    error: null
  })

  useEffect(() => {
    async function checkAdminStatus() {
      if (status === 'loading') {
        return
      }

      if (status === 'unauthenticated') {
        router.push('/auth/signin?callbackUrl=/admin')
        return
      }

      if (!session?.user?.id) {
        setAdminState({
          isAdmin: false,
          isLoading: false,
          error: 'No user session found'
        })
        return
      }

      try {
        const response = await fetch('/api/admin/auth/check')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to check admin status')
        }

        if (!data.isAdmin) {
          router.push('/?error=access-denied')
          return
        }

        setAdminState({
          isAdmin: data.isAdmin,
          isLoading: false,
          error: null
        })
      } catch (error) {
        console.error('Admin auth check failed:', error)
        setAdminState({
          isAdmin: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    checkAdminStatus()
  }, [session, status, router])

  return {
    ...adminState,
    hasAccess: adminState.isAdmin
  }
}