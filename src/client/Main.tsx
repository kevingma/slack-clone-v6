import type { FC } from 'react';

import './Main.css';
import logo from './../../public/logo.webp';
import { Link, routes } from 'wasp/client/router';
import { logout, useAuth } from 'wasp/client/auth';
import { Outlet, useLocation } from 'react-router-dom';

export const Main: FC = () => {
  const { data: user, isLoading } = useAuth(); // We have to get the user from the useAuth hook because it's not passed in as a prop to the Main component by Wasp.
  const username = user?.identities.username;

  const location = useLocation();
  const currentPath = location.pathname;

  const isExampleNotesPage = currentPath === routes.ExampleNotesDashboardRoute.to;

  return (
    <div className='min-h-screen flex flex-col'>
      <nav className='bg-gray-800 p-4'>
        <div className='container mx-auto flex justify-between items-center'>
          <Link to='/' className='flex-1 font-semibold text-yellow-300 hover:text-gray-300 transition-color'>
            Wasp Cursor IDE Template
          </Link>
          <img src={logo} alt='Wasp Logo' className='w-8 h-8' />
          <div className='flex-1 flex justify-end gap-6'>
            <Link to='/example-notes' className={`hover:text-gray-300 transition-colors ${!isExampleNotesPage ? 'text-yellow-300' : 'text-white'}`}>
              Example Notes Feature
            </Link>
            {user ? (
              <div className='flex items-center gap-4'>
                <button onClick={() => logout()} className='text-white hover:text-gray-300 transition-colors'>
                  Logout, {username && username.id}
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

export const linkStyles = 'text-yellow-300 hover:text-gray-300 transition-colors';
