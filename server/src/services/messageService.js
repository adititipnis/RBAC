const messageRepository = require('../data/repositories/messageRepository')

class MessageService {
  async getLatestMessage() {
    try {
      const message = await messageRepository.findLatest()
      return message?.content || 'Welcome to the Express server!'
    } catch (error) {
      throw new Error('Failed to fetch message')
    }
  }

  async createMessage(content) {
    try {
      return await messageRepository.create(content)
    } catch (error) {
      throw new Error('Failed to create message')
    }
  }
}

module.exports = new MessageService() 
