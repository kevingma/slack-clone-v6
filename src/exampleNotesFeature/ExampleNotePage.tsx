import type { FC } from 'react';
import type { AuthUser } from 'wasp/auth';
import type { ExampleNote } from 'wasp/entities';

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, getExampleNote, deleteExampleNote, updateExampleNote } from 'wasp/client/operations';
import { ContainerWithFlatShadow } from '../client/components/containerWithFlatShadow';

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
      <ContainerWithFlatShadow>
        <div className='flex justify-between items-center'>
          <button onClick={() => navigate(-1)} className='px-4 py-2 bg-gray-100 border border-gray-200 text-black ring-1 ring-yellow-500 hover:ring-2'>
            ← Back
          </button>
          <button
            onClick={async () => {
              try {
                await deleteExampleNote({ id: note.id });
                navigate('/');
              } catch (err: any) {
                window.alert('Error: ' + err.message);
              }
            }}
            className='mt-4 px-2 py-1 text-sm bg-red-100 border border-red-200 text-red-700 ring-1 ring-red-500 hover:ring-2'
          >
            Delete Note
          </button>
        </div>
        <h2 className='py-4 text-2xl font-bold'>
          {username}'s Note #{note.id}
        </h2>
        <EditableNote note={note} />
      </ContainerWithFlatShadow>
    </>
  );
};

type EditableNoteProps = {
  note: ExampleNote;
};

const EditableNote: FC<EditableNoteProps> = ({ note }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);

  const handleEditSubmit = async () => {
    try {
      await updateExampleNote({ id: note.id, title: editTitle, content: editContent });
      setIsEditing(false);
    } catch (err: any) {
      window.alert('Error: ' + err.message);
    }
  };

  if (isEditing) {
    return (
      <div className='space-y-4'>
        <input
          type='text'
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className='w-full p-2 border bg-gray-50'
        />
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className='w-full p-2 border bg-gray-50'
          rows={4}
        />
        <div className='flex gap-2'>
          <button
            onClick={handleEditSubmit}
            className='px-4 py-2 bg-blue-100 border border-blue-200 text-blue-700 ring-1 ring-blue-500 hover:ring-2'
          >
            Save Changes
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className='px-4 py-2 bg-gray-100 border border-gray-200 text-gray-700 ring-1 ring-gray-500 hover:ring-2'
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className='p-4 border bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors'
      onClick={() => {
        setIsEditing(true);
        setEditTitle(note.title);
        setEditContent(note.content);
      }}
    >
      <h1 className='font-bold'>{note.title}</h1>
      <p className='text-gray-600'>{note.content}</p>
    </div>
  );
};
