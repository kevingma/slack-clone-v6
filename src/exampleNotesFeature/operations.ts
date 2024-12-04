import type { ExampleNote } from 'wasp/entities';
import type { GetExampleNotes, GetExampleNote, CreateExampleNote } from 'wasp/server/operations';

import { HttpError } from 'wasp/server';

type GetExampleNoteInput = {
  id: number;
};

type CreateExampleNoteInput = {
  title: string;
  content: string;
};

export const getExampleNotes: GetExampleNotes<void, ExampleNote[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User not found');
  }

  return context.entities.ExampleNote.findMany({
    where: { userId: context.user.id },
    orderBy: { id: 'asc' },
  });
};

export const getExampleNote: GetExampleNote<GetExampleNoteInput, ExampleNote> = async ({ id }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User not found');
  }

  return context.entities.ExampleNote.findUniqueOrThrow({
    where: {
      id,
      userId: context.user.id,
    },
  });
};

export const createExampleNote: CreateExampleNote<CreateExampleNoteInput, ExampleNote> = async ({ title, content }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User not found');
  }

  return context.entities.ExampleNote.create({
    data: {
      title,
      content,
      userId: context.user.id,
    },
  });
};