import type { CreateWorkspace } from 'wasp/server/operations'
import type { Workspace, WorkspaceUser } from 'wasp/entities'
import { HttpError } from 'wasp/server'
import type { GetWorkspaces } from 'wasp/server/operations'


type CreateWorkspaceInput = {
  name: string
}

export const createWorkspace: CreateWorkspace<CreateWorkspaceInput, Workspace> = async (
  { name },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not found')
  }

  // Create the workspace
  const workspace = await context.entities.Workspace.create({
    data: {
      name,
    }
  })

  // Link the user as a member (WorkspaceUser)
  await context.entities.WorkspaceUser.create({
    data: {
      userId: context.user.id,
      workspaceId: workspace.id,
      role: 'owner'
    }
  })

  return workspace
}

type GetWorkspacesArgs = Record<string, never> // or your actual input shape

export const getWorkspaces: GetWorkspaces<GetWorkspacesArgs, Workspace[]> = async (
  _args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not found')
  }

  return context.entities.Workspace.findMany({
    include: {
      users: true,
      channels: true,
    }
  })
}
