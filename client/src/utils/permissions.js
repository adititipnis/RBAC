export const hasPermission = (user, pageType, action = 'read') => {
  if (!user?.permissions) return false
  return user.permissions[pageType]?.includes(action)
} 
