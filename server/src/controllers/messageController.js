const messageService = require('../services/messageService')

class MessageController {
  async getMessage(req, res) {
    try {
      const message = await messageService.getLatestMessage()
      res.json({ message })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  async createMessage(req, res) {
    try {
      const message = await messageService.createMessage(req.body.content)
      res.status(201).json(message)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  }
}

module.exports = new MessageController() 
