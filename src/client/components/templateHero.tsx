import type { FC, ReactNode } from 'react';
import { ContainerWithFlatShadow } from './containerWithFlatShadow';

export const TemplateHero: FC = () => {
  return (
    <ContainerWithFlatShadow shadowColor='rgba(0, 0, 0, 0.1)' bgColor='bg-gray-100'>
      <h1 className='text-4xl font-bold text-gray-900 mb-4'>Wasp Cursor IDE Template</h1>
      <p className='text-lg text-gray-800 mb-8'>This is a template to help you build your Wasp app with the Cursor IDE.</p>
      <div className='space-y-4 font-mono text-gray-600'>
        <p>
          - Context for the AI to build with the Wasp framework are provided in the <Code>.cursorrules</Code> file. If you find that the AI assistant is making mistakes with regards to Wasp-specific code, you can add
          more context here.
        </p>
        <p>
          - Make sure to add the Wasp docs,{' '}
          <Code>
            <a href='https://wasp-lang.dev/docs' target='_blank' className='underline hover:text-yellow-500 transition-colors'>
              https://wasp-lang.dev/docs
            </a>
          </Code>
          , under <Code>{`preferences > cursor settings > features > add new doc `}</Code>
          and access them with the <Code>{`@docs`}</Code> keyword in Cursor chat.
        </p>
        <p>
          - We've provided some example feature code for you in <Code>{`src/exampleNotesFeature/`}</Code>. You can leave this code in place to help guide the AI in building the rest of your app, and delete it once you've
          got your own code in place.
        </p>
      </div>
    </ContainerWithFlatShadow>
  );
};

const Code: FC<{ children: ReactNode }> = ({ children }) => {
  return <span className='text-gray-500'>{children}</span>;
};
