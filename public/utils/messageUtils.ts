import { MessgeInfoValue } from '../store/zustandboard/types';

export const createMessage = (
  type: string, 
  message: string, 
  userId: string,
  userName: string,
  roomId: string,
  imageInfo?: string
): MessgeInfoValue => ({
  id: Date.now().toString(),
  sender: userId,
  message,
  userName: userName,
  roomId,
  type,
  cretDate: new Date().toLocaleString('sv-SE').replace('T', ' ').substring(0, 19),
  isRead: '0',
  reUserId: '',
  userList: [],
  ...(imageInfo && { imageInfo })
});

export const processMessagesForRead = (messages: MessgeInfoValue[], userId: string) => {
  return messages.map(msg => {
    if (msg.sender !== userId && msg.reUserId && typeof msg.reUserId === 'string' && msg.reUserId.trim() !== '') {
      const userIds = msg.reUserId.split(',').map(id => id.trim()).filter(id => id !== '');
      
      if (userIds.includes(userId)) {
        const currentReadCount = parseInt(msg.isRead) || 0;
        const newReadCount = Math.max(0, currentReadCount - 1);
        const updatedUserIds = userIds.filter(id => id !== userId);
        const updatedReUserId = updatedUserIds.join(',');
        
        return {
          ...msg,
          isRead: newReadCount.toString(),
          reUserId: updatedReUserId
        };
      }
    }
    return msg;
  });
};