import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MessageRepository {
  async findConversationsBySpaId(spaId: string) {
    return prisma.conversation.findMany({
      where: { spaId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    });
  }

  async findConversationById(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        }
      }
    });
  }

  async markConversationAsRead(id: string) {
    await prisma.chatMessage.updateMany({
      where: { conversationId: id, read: false },
      data: { read: true }
    });
    return prisma.conversation.update({
      where: { id },
      data: { unreadCount: 0 }
    });
  }

  async addReply(conversationId: string, text: string, sender: string, senderId?: string) {
    const message = await prisma.chatMessage.create({
      data: {
        conversationId,
        spaId: (await this.findConversationById(conversationId))!.spaId,
        text,
        sender,
        senderId,
        read: true, // We are sending it, so it's read by us. For the other party it should be false, but the UI logic currently has a single read flag. Let's say true for owner.
      }
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: text,
        lastMessageAt: new Date()
      }
    });

    return message;
  }
}

export const messageRepository = new MessageRepository();
