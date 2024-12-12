import type { FC, ReactNode } from 'react';

interface ContainerWithFlatShadowProps {
  children: ReactNode;
  bgColor?: string;
  shadowColor?: string;
}

export const ContainerWithFlatShadow: FC<ContainerWithFlatShadowProps> = ({ 
  children, 
  bgColor = '',
  shadowColor = 'rgba(234, 179, 8, 0.7)' // Default yellow shadow
}) => {
  return (
    <div className={`${bgColor} py-16`}>
      <div className='container mx-auto px-4'>
        <div 
          className={`bg-white border border-gray-200 p-6 relative`}
          style={{ 
            boxShadow: `6px 6px 0px 0px ${shadowColor}`
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
