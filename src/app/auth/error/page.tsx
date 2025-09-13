'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.'
      case 'AccessDenied':
        return 'You denied access to the application.'
      case 'Verification':
        return 'The verification token has expired or has already been used.'
      case 'OAuthSignin':
        return 'Error in constructing an authorization URL.'
      case 'OAuthCallback':
        return 'Error in handling the response from an OAuth provider.'
      case 'OAuthCreateAccount':
        return 'Could not create OAuth provider user in the database.'
      case 'EmailCreateAccount':
        return 'Could not create email provider user in the database.'
      case 'Callback':
        return 'Error in the OAuth callback handler route.'
      case 'OAuthAccountNotLinked':
        return 'To confirm your identity, sign in with the same account you used originally.'
      case 'EmailSignin':
        return 'The e-mail could not be sent.'
      case 'CredentialsSignin':
        return 'Sign in failed. Check the details you provided are correct.'
      case 'SessionRequired':
        return 'Please sign in to access this page.'
      default:
        return 'An error occurred during authentication. Please try again.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
          <CardDescription>
            {getErrorMessage(error)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error === 'OAuthCallback' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Google OAuth Setup Required
              </h4>
              <p className="text-sm text-blue-700">
                Please ensure your Google OAuth redirect URI is set to:
                <br />
                <code className="bg-blue-100 px-1 py-0.5 rounded text-xs mt-1 block">
                  http://localhost:3000/api/auth/callback/google
                </code>
              </p>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <Link href="/auth/signin">
              <Button className="w-full" size="lg">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="outline" className="w-full" size="lg">
                Go Home
              </Button>
            </Link>
          </div>

          {process.env.NODE_ENV === 'development' && error && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
              <strong>Debug info:</strong> {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}