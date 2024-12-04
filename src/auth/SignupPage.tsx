import { Link } from 'wasp/client/router'
import { SignupForm } from 'wasp/client/auth'

export function SignupPage() {
  return (
    <div className='min-h-screen flex items-start justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <SignupForm />
        <div className='text-center'>
          <Link to='/login' className='text-blue-600 hover:text-blue-500'>
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  )
} 