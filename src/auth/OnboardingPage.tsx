import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from 'wasp/client/auth'
import { completeOnboarding } from 'wasp/client/operations'

export const OnboardingPage: FC = () => {
  const navigate = useNavigate()
  const { data: user } = useAuth()

  const handleCompleteOnboarding = async () => {
    try {
      await completeOnboarding({})
      navigate('/chat')
    } catch (err: any) {
      alert('Error completing onboarding: ' + err.message)
    }
  }

  return (
    <div className='min-h-screen bg-gray-900 text-white flex items-center justify-center p-4'>
      <div className='max-w-md w-full space-y-6 bg-gray-800 p-6 rounded-md border border-gray-700'>
        <h1 className='text-2xl font-bold'>Onboarding</h1>
        <p>Welcome {user?.email}! Please set up any required info here.</p>
        <button
          className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500'
          onClick={handleCompleteOnboarding}
        >
          Complete Onboarding
        </button>
      </div>
    </div>
  )
}