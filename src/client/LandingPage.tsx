import type { FC } from 'react';

import { Link } from 'wasp/client/router';
import { TemplateHero } from '../client/components/templateHero';
import { ContainerWithFlatShadow } from './components/containerWithFlatShadow';

export const LandingPage: FC = () => {
  return (
    <>
      <TemplateHero />
      <ContainerWithFlatShadow>
        <div className='flex justify-between items-center'>
          <Link to='/example-notes' className='group flex items-center justify-center gap-1 px-4 py-2 bg-gray-100 border border-gray-200 text-black ring-1 ring-yellow-500 hover:ring-2'>
            Go To Example Notes Feature
            <span className='opacity-10 group-hover:opacity-100 transition-opacity'>→</span>
          </Link>
        </div>
      </ContainerWithFlatShadow>
    </>
  );
};
