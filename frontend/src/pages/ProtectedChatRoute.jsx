import { Navigate } from 'react-router-dom'
import ChatPage from './ChatPage'

function ProtectedChatRoute() {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <ChatPage />
}

export default ProtectedChatRoute
