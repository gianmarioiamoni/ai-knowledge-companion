import { JSX } from 'react'

interface WelcomeHeaderProps {
  title: string
  welcomeMessage: string
  userName: string
}

export function WelcomeHeader({
  title,
  welcomeMessage,
  userName
}: WelcomeHeaderProps): JSX.Element {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {title}
      </h1>
      <p className="text-gray-600">
        {welcomeMessage}, {userName}!
      </p>
    </div>
  )
}
