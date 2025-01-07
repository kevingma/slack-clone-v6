import type { FC } from 'react'

import './Main.css'
import logo from './../../public/logo.webp'
import { Link } from 'wasp/client/router'
import { logout, useAuth } from 'wasp/client/auth'
import { Outlet, useLocation } from 'react-router-dom'

export const Main: FC = () => {
  const { data: user, isLoading } = useAuth()
  const username = user?.username || 'User'

  const location = useLocation()
  const currentPath = location.pathname

  const isChatPage = currentPath === '/chat'

  return (
    <div className='min-h-screen flex flex-col'>
      <nav className='bg-gray-800 p-4'>
        <div className='container mx-auto flex justify-between items-center'>
          <Link to='/' className='flex-1 font-semibold text-yellow-300 hover:text-gray-300 transition-color'>
            Wasp Cursor IDE Template
          </Link>
          <img src={logo} alt='Wasp Logo' className='w-8 h-8' />
          <div className='flex-1 flex justify-end gap-6'>
            <Link
              to='/chat'
              className={`hover:text-gray-300 transition-colors ${!isChatPage ? 'text-yellow-300' : 'text-white'}`}
            >
              Chat
            </Link>
            {user ? (
              <div className='flex items-center gap-4'>
                <button onClick={() => logout()} className='text-white hover:text-gray-300 transition-colors'>
                  Logout, {username}
                </button>
              </div>
            ) : (
              <Link to='/login' className='text-white hover:text-gray-300 transition-colors'>
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
      <main className='flex-1'>
        <Outlet />
      </main>
    </div>
  )
}

export const linkStyles = 'text-yellow-300 hover:text-gray-300 transition-colors'