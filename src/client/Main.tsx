import type { FC } from 'react'
import { useEffect } from 'react'
import './Main.css'
import logo from './../../public/logo.webp'
import { Link } from 'wasp/client/router'
import { useAuth } from 'wasp/client/auth'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

export const Main: FC = () => {
  const { data: user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (
      user &&
      (!(user as any).username || !(user as any).displayName) &&
      location.pathname !== '/onboarding'
    ) {
      navigate('/onboarding')
    }
  }, [user, location.pathname, navigate])

  const handleProfileClick = async () => {
    navigate('/profile')
  }

  return (
    <div className='h-screen flex'>
      {/* Vertical Menu Bar */}
      <nav className='bg-violet-800 w-16 flex flex-col items-center justify-between py-4'>
        {/* Top Section: Clickable Logo */}
        <div className='flex flex-col items-center'>
          <Link to='/'>
            <img
              src={logo}
              alt='Wasp Logo'
              className='w-8 h-8 mb-4'
            />
          </Link>
          {/* New Chat button */}
          <Link
            to='/chat'
            className='text-white hover:text-gray-300 transition-colors flex flex-col items-center mb-4'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='w-6 h-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M2.25 15a2.25 2.25 0 0 0 2.25 2.25h3.75l3.75 3.75V17.25h4.5A2.25 2.25 0 0 0 18.75 15V6.75A2.25 2.25 0 0 0 16.5 4.5h-12A2.25 2.25 0 0 0 2.25 6.75v8.25z'
              />
            </svg>
            Chat
          </Link>
          {/* New DMs button */}
          <button
            type='button'
            className='text-white hover:text-gray-300 transition-colors flex flex-col items-center'
            onClick={() => {}}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='w-6 h-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M21.75 7.5l-9 4.5-9-4.5m18 9-9 4.5-9-4.5'
              />
            </svg>
            DMs
          </button>
        </div>

        {/* Bottom Section: Profile Icon -> Navigate to /profile */}
        {user && (
          <button
            onClick={handleProfileClick}
            className='text-white hover:text-gray-300 transition-colors'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='w-6 h-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M15.75 9A3.75 3.75 0 1112 5.25 3.75 3.75 0 0115.75 9zm0 0v3.75m-7.5-3.75v3.75m1.5 2.25a6 6 0 1112 0 6 6 0 01-12 0z'
              />
            </svg>
          </button>
        )}
      </nav>

      {/* Main Content Area */}
      <div className='flex-1 flex overflow-hidden'>
        <Outlet />
      </div>
    </div>
  )
}