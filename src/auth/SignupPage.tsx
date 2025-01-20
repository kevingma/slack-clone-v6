import { Link } from 'wasp/client/router'
import { SignupForm } from 'wasp/client/auth'

export function SignupPage() {
  return (
    <div className='min-h-screen bg-gray-900 text-white flex items-start justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8 bg-gray-800 p-6 rounded-md border border-gray-700'>
        <SignupForm />
        <div className='text-center'>
          <Link to='/login' className='text-blue-400 hover:text-blue-300'>
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  )
}