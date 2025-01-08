import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from 'wasp/client/auth'
import { completeOnboarding } from 'wasp/client/operations'  // <-- Use the Wasp client import

export const OnboardingPage: FC = () => {
  const navigate = useNavigate()
  const { data: user } = useAuth()

  // Example usage
  const handleCompleteOnboarding = async () => {
    try {
      await completeOnboarding({})
      navigate('/chat')
    } catch (err: any) {
      alert('Error completing onboarding: ' + err.message)
    }
  }

  return (
    <div className='max-w-md mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Onboarding</h1>
      <p>Welcome {user?.email}! Please set up any required info here.</p>
      <button
        className='mt-4 px-4 py-2 bg-blue-600 text-white'
        onClick={handleCompleteOnboarding}
      >
        Complete Onboarding
      </button>
    </div>
  )
}