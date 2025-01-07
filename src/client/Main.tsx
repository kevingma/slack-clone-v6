import type { FC } from 'react'
import './Main.css'
import logo from './../../public/logo.webp'
import { Link } from 'wasp/client/router'
import { logout, useAuth } from 'wasp/client/auth'
import { Outlet, useLocation } from 'react-router-dom'

export const Main: FC = () => {
  const { data: user, isLoading } = useAuth()
  const location = useLocation()
  const currentPath = location.pathname

  const isChatPage = currentPath === '/chat'

  return (
    // Changed from 'min-h-screen' to 'h-screen' 
    <div className='h-screen flex flex-col'>
      <nav className='bg-gray-800 p-4'>
        <div className='container mx-auto flex items-center'>
          {/* Logo on the far left */}
          <img
            src={logo}
            alt='Wasp Logo'
            className='w-8 h-8 mr-2'
          />

          {/* Title text directly to the right of the logo */}
          <Link
            to='/'
            className='text-yellow-300 hover:text-gray-300 transition-colors mr-auto'
          >
            Slack Clone v5
          </Link>

          {/* Hide "Chat" nav button if we are on the /chat page */}
          {!isChatPage && (
            <Link
              to='/chat'
              className='text-yellow-300 hover:text-gray-300 transition-colors mr-4'
            >
              Chat
            </Link>
          )}

          {/* Login / Logout */}
          {user ? (
            <button
              onClick={() => logout()}
              className='text-white hover:text-gray-300 transition-colors'
            >
              Logout, {user.email}
            </button>
          ) : (
            <Link to='/login' className='text-white hover:text-gray-300 transition-colors'>
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* Make the main area take up remaining vertical space and prevent overflow */}
      <main className='flex-1 flex overflow-hidden'>
        <Outlet />
      </main>
    </div>
  )
}
