import { FC, useState } from 'react'
import { useAuth, logout } from 'wasp/client/auth'
import { updateDisplayName } from 'wasp/client/operations'
import { useNavigate } from 'react-router-dom'

export const ProfilePage: FC = () => {
  const { data: user } = useAuth()
  const [displayName, setDisplayName] = useState((user as any)?.displayName || '')
  const navigate = useNavigate()

  const handleSave = async () => {
    if (!displayName.trim()) return
    try {
      await updateDisplayName({ displayName })
      alert('Display name updated!')
    } catch (err: any) {
      alert('Error updating display name: ' + err.message)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (!user) return <div>Loading...</div>

  return (
    <div className='max-w-lg mx-auto p-4 space-y-4'>
      <h1 className='text-2xl font-bold'>Profile</h1>
      <p><strong>Email:</strong> {user.email}</p>
      {user.username && <p><strong>Username:</strong> {user.username}</p>}

      <div>
        <label className='block mb-1 font-medium'>Display Name</label>
        <input
          className='border p-2 w-full'
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>

      <button
        onClick={handleSave}
        className='px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors'
      >
        Save
      </button>

      <hr />

      <button
        onClick={handleLogout}
        className='px-4 py-2 bg-red-500 text-white hover:bg-red-600 transition-colors'
      >
        Logout
      </button>
    </div>
  )
}