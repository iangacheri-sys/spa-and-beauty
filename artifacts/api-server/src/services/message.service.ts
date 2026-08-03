import { messageRepository } from '../repositories/message.repository';

export class MessageService {
  async getConversations(spaId: string) {
    const convos = await messageRepository.findConversationsBySpaId(spaId);
    return convos.map(c => ({
      ...c,
      messages: c.messages.map(m => ({
        ...m,
        timestamp: m.createdAt.toISOString(),
        senderName: m.sender === 'bot' ? 'System' : (m.sender === 'client' ? c.clientName : 'Staff')
      }))
    }));
  }

  async getConversation(id: string) {
    return messageRepository.findConversationById(id);
  }

  async markAsRead(id: string) {
    return messageRepository.markConversationAsRead(id);
  }

  async reply(conversationId: string, text: string, senderName?: string, senderId?: string) {
    const msg = await messageRepository.addReply(conversationId, text, 'owner', senderId);
    return {
      ...msg,
      timestamp: msg.createdAt.toISOString(),
      senderName: senderName || 'Staff'
    };
  }
}

export const messageService = new MessageService();
