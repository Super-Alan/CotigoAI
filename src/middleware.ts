import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    
    // For admin routes, we'll handle authorization in the page components
    // This middleware only ensures the user is authenticated
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // 管理员路由需要登录
        if (pathname.startsWith('/admin')) {
          return !!token
        }

        // 其他受保护路由
        if (pathname.startsWith('/conversations') || 
            pathname.startsWith('/arguments') || 
            pathname.startsWith('/perspectives') ||
            pathname.startsWith('/learn')) {
          return !!token
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/conversations/:path*',
    '/arguments/:path*',
    '/perspectives/:path*',
    '/learn/:path*'
  ]
}