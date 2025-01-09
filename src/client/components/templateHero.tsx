import type { FC, ReactNode } from 'react'
import { ContainerWithFlatShadow } from './containerWithFlatShadow'

export const TemplateHero: FC = () => {
  return (
    <ContainerWithFlatShadow shadowColor='rgba(0, 0, 0, 0.1)' bgColor='bg-gray-100'>
      <h1 className='text-4xl font-bold text-gray-900 mb-2'>Slack Clone v5</h1>
      <p className='text-md text-gray-500 italic mb-6'>
        This is a Slack-like application built on Wasp, featuring a global chat with realtime updates.
      </p>
    </ContainerWithFlatShadow>
  )
}