import type { FC, FormEvent } from 'react';

import { useState } from 'react';
import { Link } from 'wasp/client/router';
import { useAuth } from 'wasp/client/auth';
import { useNavigate } from 'react-router-dom';
import { TemplateHero } from '../client/components/templateHero';
import { createExampleNote, useQuery, getExampleNotes } from 'wasp/client/operations';
import { ContainerWithFlatShadow } from '../client/components/containerWithFlatShadow';

export const ExampleNotesDashboard: FC = () => {
  const navigate = useNavigate();
  const { data: user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { data: notes, isLoading, error } = useQuery(getExampleNotes, undefined, { enabled: !!user });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      alert('Please enter a title and content');
      return;
    }
    try {
      await createExampleNote({ title, content });
      setTitle('');
      setContent('');
    } catch (err: any) {
      window.alert('Error: ' + err.message);
    }
  };

  const handleNoteClick = (noteId: number) => {
    navigate(`/example-note/${noteId}`);
  };

  return (
    <>
      <TemplateHero />
      <ContainerWithFlatShadow>
        <h2 className='py-4 text-2xl font-bold'>Example Notes Feature</h2>
        <form onSubmit={handleSubmit} className='mb-8 space-y-4'>
          <div>
            <input type='text' value={title} onChange={(e) => setTitle(e.target.value)} placeholder='Note title' className='w-full p-2 border bg-gray-50' />
          </div>
          <div>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder='Note content' className='w-full p-2 border bg-gray-50' />
          </div>
          <button type='submit' className='px-4 py-2 bg-gray-100 border border-gray-200 text-black ring-1 ring-yellow-500 hover:ring-2'>
            Create Note
          </button>
        </form>

        {user && isLoading && <div>Loading Notes...</div>}
        {!user && (
          <div className='text-center py-4'>
            <p className='mb-2 text-gray-600'>Please login to view notes</p>
            <Link to='/login' className='text-blue-600 hover:text-blue-500'>
              Login here
            </Link>
          </div>
        )}

        {user && notes && (
          <div className='space-y-4'>
            {notes.length === 0 && <div className='text-gray-600'>No notes created yet....</div>}
            {notes.map((note) => (
              <div key={note.id} onClick={() => handleNoteClick(note.id)} className='group p-4 border bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors'>
                <h3 className='font-bold flex items-center gap-1'>
                  {note.title}
                  <span className='opacity-10 group-hover:opacity-100 transition-opacity'>→</span>
                </h3>
                <p className='text-gray-600'>{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </ContainerWithFlatShadow>
    </>
  );
};
