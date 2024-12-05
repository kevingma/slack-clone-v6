import type { ExampleNote } from 'wasp/entities';
import type { GetExampleNotes, GetExampleNote, CreateExampleNote, DeleteExampleNote, UpdateExampleNote } from 'wasp/server/operations';

import { HttpError } from 'wasp/server';

type GetExampleNoteInput = {
  id: number;
};

type CreateExampleNoteInput = {
  title: string;
  content: string;
};

type UpdateExampleNoteInput = {
  id: number;
  title: string;
  content: string;
};

type DeleteExampleNoteInput = {
  id: number;
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

export const updateExampleNote: UpdateExampleNote<UpdateExampleNoteInput, ExampleNote> = async ({ id, title, content }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User not found');
  }

  return context.entities.ExampleNote.update({
    where: { id, userId: context.user.id },
    data: { title, content },
  });
};

export const deleteExampleNote: DeleteExampleNote<DeleteExampleNoteInput, ExampleNote> = async ({ id }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User not found');
  }

  return context.entities.ExampleNote.delete({
    where: { id, userId: context.user.id },
  });
};
