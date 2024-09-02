import { Server,Socket } from 'socket.io';

import {v4 as UUIDV4} from 'uuid';

import db from '../sequelize-client';

interface JoinRoomData {
    roomId:string;
    userId:string;
}

interface MessageData{
    roomId: string;
    senderId: string;
    receiverId: string;
    message: string;
}

export default function ChatSocket(io:Server){
  io.on('connection',(socket:Socket)=>{
    console.log('New client connected', socket.id);

    socket.on('joinRoom',async (data:JoinRoomData)=>{
      socket.join(data.roomId);
      console.log(`${data.userId} Joined Room ${data.roomId}`);
    });

    socket.on('sendMessage',async (data:MessageData)=>{
      const newMessage = await db.Chat.create({
        id: UUIDV4(),
        senderId: data.senderId,
        receiverId: data.receiverId,
        roomId: data.roomId,
        message: data.message,
        sendTime:new Date(),
        isSeen:false
      });

      const sender = await db.User.findByPk(data.senderId);

      if (sender && data.senderId !== data.receiverId) {
        await db.Notification.create({
          message: `You have received a new message from ${sender.userName}`,
          userId: data.receiverId,
          type: 'MESSAGE',
          isRead: false
        });
      }

      io.emit('receiveMessage',newMessage);
 
    });

    socket.on('messageSeen', 
      async ({ messageId, roomId }: { messageId: string; roomId: string }) => {
        try {
          const message = await db.Chat.findOne({ where: { id: messageId } });
          if (message && message.isSeen === false) {
            message.isSeen = true;
            await message.save();
            console.log(`Message ${messageId} marked as seen`);
  
            io.to(roomId).emit('messageSeen', { messageId });
          }
        } catch (error) {
          console.error('Error marking message as seen:', error);
        }
      });

    socket.on('disconnect',()=>{
      console.log('Client disconnected', socket.id);
    });
  });
}