import type { FC } from 'react';

import './Main.css';
import { Link } from 'wasp/client/router';
import { Outlet } from 'react-router-dom';
import logo from './../../public/logo.webp';
import { logout, useAuth } from 'wasp/client/auth';

export const Main: FC = () => {
  const { data: user, isLoading } = useAuth(); // We have to get the user from the useAuth hook because it's not passed in as a prop to the Main component by Wasp.
  const username = user?.identities.username;

  return (
    <div className='min-h-screen flex flex-col'>
      <nav className='bg-gray-800 p-4'>
        <div className='container mx-auto flex justify-between items-center'>
          <div className='flex-1 text-white font-semibold'>Wasp Cursor IDE Template</div>
          <img src={logo} alt='Wasp Logo' className='w-8 h-8' />
          <div className='flex-1 flex justify-end'>
            {isLoading ? (
              <div className='text-gray-300'>Loading...</div>
            ) : user ? (
              <div className='flex items-center gap-4'>
                {username && <span className='text-gray-300'>Welcome, {username.id}</span>}
                <button onClick={() => logout()} className='text-white hover:text-gray-300 transition-colors'>
                  Logout
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
  );
};
