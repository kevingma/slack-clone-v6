import type { FC } from 'react'
import './Main.css'
import logo from './../../public/logo.webp'
import { Link } from 'wasp/client/router'
import { useAuth } from 'wasp/client/auth'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

export const Main: FC = () => {
  const { data: user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isChatPage = location.pathname === '/chat'

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
          {!isChatPage && (
            <Link
              to='/chat'
              className='text-white hover:text-gray-300 transition-colors'
            >
              Chat
            </Link>
          )}
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
