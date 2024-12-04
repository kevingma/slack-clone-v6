import type { FC } from 'react';
import type { AuthUser } from 'wasp/auth';

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, getExampleNote } from 'wasp/client/operations';
import { ContainerWithFlatShadow } from '../client/components/containerWithFlatShadow';
import { TemplateHero } from '../client/components/templateHero';

export const ExampleNotePage: FC<{ user: AuthUser }> = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: note,
    isLoading,
    error,
  } = useQuery(getExampleNote, {
    id: parseInt(id!),
  });

  const username = user.identities.username?.id;

  if (isLoading) return <ContainerWithFlatShadow>Loading...</ContainerWithFlatShadow>;
  if (error)
    return (
      <ContainerWithFlatShadow>
        <div className='text-red-500'>Error: {error.message}</div>
      </ContainerWithFlatShadow>
    );
  if (!note) return <ContainerWithFlatShadow>Note not found</ContainerWithFlatShadow>;

  return (
    <>
      <TemplateHero />
      <ContainerWithFlatShadow>
        <button onClick={() => navigate(-1)} className='px-4 py-2 bg-gray-100 border border-gray-200 text-black ring-1 ring-yellow-500 hover:ring-2'>
          ← Back
        </button>
        <h2 className='py-4 text-2xl font-bold'>
          {username}'s Note #{note.id}
        </h2>
        <div className='p-4 border bg-gray-50'>
          <h1 className='font-bold'>{note.title}</h1>
          <p className='text-gray-600'>{note.content}</p>
        </div>
      </ContainerWithFlatShadow>
    </>
  );
};
