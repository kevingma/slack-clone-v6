import { Link } from 'wasp/client/router'
import { LoginForm } from 'wasp/client/auth'

export function LoginPage() {
  return (
    <div className='min-h-screen flex items-start justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <LoginForm />
        <div className='text-center'>
          <Link to='/signup' className='text-blue-600 hover:text-blue-500'>
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  );
} 