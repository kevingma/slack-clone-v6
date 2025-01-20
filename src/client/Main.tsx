import type { FC } from 'react'
import { useEffect, useState } from 'react'
import './Main.css'
import logo from './../../public/logo.webp'
import { Link } from 'wasp/client/router'
import { Outlet } from 'react-router-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from 'wasp/client/auth'
import { MessageSquare, Send, User } from 'lucide-react'

export const Main: FC = () => {
  const { data: user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user && (!(user as any).username || !(user as any).displayName) && location.pathname !== '/onboarding') {
      navigate('/onboarding')
    }
  }, [user, location.pathname, navigate])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return
    navigate(`/search?query=${encodeURIComponent(searchTerm)}`)
    setSearchTerm('')
  }

  return (
    <div className='h-screen flex flex-col bg-gray-900 text-white'>
      {/* Top Bar - darkest */}
      <header className='bg-gray-900 text-white p-3 flex items-center'>
        {/* Logo on the left */}
        <Link to='/'>
          <img src={logo} alt='App Logo' className='w-8 h-8' />
        </Link>

        {/* Centered search box */}
        <div className='flex-1 flex justify-center'>
          <form onSubmit={handleSearchSubmit}>
            <input
              type='text'
              placeholder='Search messages...'
              className='px-2 py-1 bg-gray-700 text-white placeholder-gray-400 rounded-md border border-gray-600'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* Removed the "Search" button */}
          </form>
        </div>
      </header>

      {/* Main Content Area */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Slim Left Sidebar */}
        <aside className='w-16 bg-gray-900 text-white flex flex-col items-center justify-between py-4'>
          <div className='flex flex-col items-center gap-6'>
            <Link to='/chat' className='flex flex-col items-center group'>
              <MessageSquare size={24} className='text-gray-400 group-hover:text-white' />
              <span className='text-xs text-gray-400 group-hover:text-white mt-1'>Chat</span>
            </Link>
            <Link to='/dm' className='flex flex-col items-center group'>
              <Send size={24} className='text-gray-400 group-hover:text-white' />
              <span className='text-xs text-gray-400 group-hover:text-white mt-1'>DMs</span>
            </Link>
          </div>
          <div>
            <Link to='/profile' className='flex flex-col items-center group mb-4'>
              <User size={24} className='text-gray-400 group-hover:text-white' />
            </Link>
          </div>
        </aside>

        {/* Outlet for pages */}
        <Outlet />
      </div>
    </div>
  )
}
