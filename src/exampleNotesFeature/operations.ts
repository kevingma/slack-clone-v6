import type { ExampleNote } from 'wasp/entities';
import type { GetExampleNotes, GetExampleNote, CreateExampleNote, DeleteExampleNote, UpdateExampleNote } from 'wasp/server/operations';

import { HttpError } from 'wasp/server';

export const getExampleNotes: GetExampleNotes<void, ExampleNote[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User not found');
  }

  return context.entities.ExampleNote.findMany({
    where: { userId: context.user.id },
    orderBy: { id: 'asc' },
  });
};

type GetExampleNoteInput = {
  id: number;
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

type CreateExampleNoteInput = {
  title: string;
  content: string;
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

type UpdateExampleNoteInput = {
  id: number;
  title: string;
  content: string;
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

type DeleteExampleNoteInput = {
  id: number;
};

export const deleteExampleNote: DeleteExampleNote<DeleteExampleNoteInput, ExampleNote> = async ({ id }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User not found');
  }

  return context.entities.ExampleNote.delete({
    where: { id, userId: context.user.id },
  });
};
