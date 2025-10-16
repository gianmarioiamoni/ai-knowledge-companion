import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Settings, MessageCircle, Share2 } from 'lucide-react'

export default function LandingPage(): JSX.Element {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            AI Knowledge Companion
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Your Personal Learning Assistant
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Build your own AI tutor by uploading materials and creating personalized learning experiences.
          </p>

          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <a href="/auth/signup">
              <Button size="lg" className="text-lg px-8 py-3 w-full sm:w-auto">
                Get Started
              </Button>
            </a>
            <a href="/auth/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 w-full sm:w-auto">
                Sign In
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center">
            <CardHeader>
              <Upload className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>Upload Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Upload PDFs, documents, and links to build your knowledge base
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Settings className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <CardTitle>Customize Your Tutor</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Configure tone, language, and teaching style to match your preferences
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <MessageCircle className="h-12 w-12 mx-auto text-purple-600 mb-4" />
              <CardTitle>Interactive Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Ask questions and get personalized answers based on your materials
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Share2 className="h-12 w-12 mx-auto text-orange-600 mb-4" />
              <CardTitle>Share & Collaborate</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Share your tutors publicly or collaborate with others
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
