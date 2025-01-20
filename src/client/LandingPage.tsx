import type { FC } from 'react'
import { Link } from 'wasp/client/router'
import { TemplateHero } from '../client/components/templateHero'
import { ContainerWithFlatShadow } from './components/containerWithFlatShadow'

export const LandingPage: FC = () => {
  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <TemplateHero />
      <ContainerWithFlatShadow bgColor='bg-gray-900'>
        <h1 className='mb-4 text-lg font-bold'>All systems operational.</h1>
        <ul className='list-disc list-inside space-y-2 mb-4'>
          <li>Powered by Wasp for full-stack generation</li>
          <li>PostgreSQL for data storage</li>
          <li>Authentication with username/password or Google OAuth</li>
          <li>Realtime chat across all users (Slack-like interface)</li>
          <li>Styling with Tailwind CSS</li>
        </ul>
        <div className='flex justify-between items-center'>
          <Link
            to='/chat'
            className='group flex items-center justify-center gap-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 transition-colors'
          >
            Go To Chat
            <span className='opacity-10 group-hover:opacity-100 transition-opacity'>→</span>
          </Link>
        </div>
      </ContainerWithFlatShadow>
    </div>
  )
}
