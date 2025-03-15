const Message = require('../../models/Message')

class MessageRepository {
  async findLatest() {
    return Message.findOne().sort({ createdAt: -1 })
  }

  async create(content) {
    const message = new Message({ content })
    return message.save()
  }
}

module.exports = new MessageRepository() 
