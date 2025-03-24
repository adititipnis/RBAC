/**
 * Utility functions for client-related operations
 */

/**
 * Get a consistent client ID regardless of the object format
 * @param {Object|String} client - Client object or ID
 * @returns {String|null} - Client ID or null if no client
 */
const getClientId = (client) => {
  if (!client) return null
  
  // If client is an object with id or _id
  if (typeof client === 'object') {
    return client.id || client._id
  }
  
  // If client is already an ID string
  return client
}

/**
 * Check if a user can access a client
 * @param {Object} user - User object
 * @param {String|Object} clientId - Client ID to check
 * @returns {Boolean} - Whether user can access the client
 */
const canAccessClient = (user, clientId) => {
  // System-level roles can access any client
  if (user.role.hierarchyLevel < 2) return true
  
  // Client-scoped roles can only access their own client
  const userClientId = getClientId(user.client)
  const targetClientId = getClientId(clientId)
  
  return userClientId && targetClientId && 
         userClientId.toString() === targetClientId.toString()
}

module.exports = {
  getClientId,
  canAccessClient
} 
