/* eslint-disable max-len */
import { Server,Socket } from 'socket.io';

import logger from '../logger';
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
    logger.info('New client connected', socket.id);

    socket.on('joinRoom',async (data:JoinRoomData)=>{

      const isUserInRoom = await db.UserChat.findOne({
        where:{roomId:data.roomId,userId:data.userId},
      });

      if(isUserInRoom){
        socket.join(data.roomId);
        logger.info(`${data.userId} joined Room ${data.roomId}`);
      }
      else{
        logger.info(`${data.userId} is not part of Room ${data.roomId}`);
        socket.emit('errorMessage','You are not part of this room');
      }
    });

    socket.on('sendMessage', async (data: MessageData) => {
      try {
        const isSenderInRoom = await db.UserChat.findOne({
          where: { roomId: data.roomId, userId: data.senderId },
        });
    
        // Ensure the sender is in the room before proceeding
        if (!isSenderInRoom) {
          logger.info('Message not sent. Sender is not part of the room.');
          socket.emit('errorMessage', 'Sender must be part of the room.');
          return;
        }
    
        // Check if it's a one-to-one chat or a group chat
        if (data.receiverId) {
          // One-to-One Chat
          const isReceiverInRoom = await db.UserChat.findOne({
            where: { roomId: data.roomId, userId: data.receiverId },
          });
    
          if (isReceiverInRoom) {
            const newMessage = await db.Chat.create({
              senderId: data.senderId,
              receiverId: data.receiverId,
              roomId: data.roomId,
              message: data.message,
              sendTime: new Date(),
              isSeen: false,
            });
    
            // Emit the message to both the sender and the receiver
            io.emit('receiveMessage', newMessage);
          } else {
            logger.info('Message not sent. Receiver is not part of the room.');
            socket.emit('errorMessage', 'Receiver must be part of the room.');
          }
        } else {
          // Group Chat: Broadcast to all members in the room
          const newMessage = await db.Chat.create({
            senderId: data.senderId,
            roomId: data.roomId,
            message: data.message,
            sendTime: new Date(),
            isSeen: false,
          });
    
          // Notify all users in the room
          io.emit('receiveMessage', newMessage);
        }
      } catch (error) {
        console.error('Error in sendMessage:', error);
        socket.emit('errorMessage', 'An error occurred while sending the message.');
      }
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
          logger.error('Error marking message as seen:', error);
        }
      });

    socket.on('disconnect',()=>{
      logger.info('Client disconnected', socket.id);
    });
  });
}