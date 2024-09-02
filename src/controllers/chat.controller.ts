import { Response, NextFunction } from 'express';

import { v4 as UUIDV4 } from 'uuid';

import db from '../sequelize-client';
import { MyUserRequest } from '../types/request-interface';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import i18n from '../utils/intl/i18n-config';
import { LocaleService } from '../utils/intl/locale-service';

const localeService = new LocaleService(i18n);

export const createChatRoom = asyncHandler(
  async (req: MyUserRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    const { userIds, isGroup, name } = req.body;
    if (!user) {
      return next(new ApiError(401, localeService.translate('USER_NOT_FOUND')));
    }

    if (!userIds || typeof isGroup === 'undefined') {
      return next(
        new ApiError(400, localeService.translate('MISSING_REQUIRED_FIELDS'))
      );
    }

    try {
      const roomId = UUIDV4();

      const chatRoom = await db.ChatRoom.create({
        id: roomId,
        isGroup,
        name:isGroup?name:null
      });

      await db.UserChat.bulkCreate(
        userIds.map((userId: string) => ({
          userId,
          roomId,
        })),
      );
    
      const response = new ApiResponse(
        201,
        chatRoom,
        localeService.translate('CHAT_ROOM_CREATED_SUCCESSFULLY')
      );
      res.status(201).json(response);

    } catch (error) {
      return next(
        new ApiError(
          500,
          localeService.translate('INTERNAL_SERVER_ERROR'),
          [error]
        )
      );
    }
  }
);

export const getChatRoomMessage = asyncHandler(
  async (req:MyUserRequest,res:Response,next:NextFunction)=>{
    const user = req.user;
    const {roomId} = req.params;

    if (!user) {
      return next(
        new ApiError(401, localeService.translate('USER_NOT_FOUND'))
      );
    }
      
    if (!roomId) {
      return next(
        new ApiError(400, localeService.translate('MISSING_REQUIRED_FIELDS'))
      );
    }

    try {
      const messages = await db.Chat.findAll({
        where:{roomId},
        order:[['createdAt','ASC']]
      });

      const response = new ApiResponse(
        200,
        messages,
        localeService.translate('MESSAGES_RETRIEVED_SUCCESSFULLY')
      );
      res.status(200).json(response);
    } catch (error) {
      console.error(error);
      return next(
        new ApiError(
          500,
          localeService.translate('INTERNAL_SERVER_ERROR'),
          [error]
        )
      );
    }
  }
);

export const sendMessage = asyncHandler(
  async (req:MyUserRequest, res:Response, next:NextFunction)=>{
    const user = req.user;
    const {roomId,message,receiverId} = req.body;

    if(!user){
      return next(
        new ApiError(401, localeService.translate('USER_NOT_FOUND'))
      );
    }

    if(!roomId || !message || !receiverId){
      return next(
        new ApiError(400, localeService.translate('MISSING_REQUIRED_FIELDS'))
      );
    }

    try {
      const newMessage = await db.Chat.create({
        senderId:user.id,
        receiverId,
        roomId,
        message,
        sendTime:new Date(),
        isSeen:false
      });

      const response = new ApiResponse(
        201,
        newMessage,
        localeService.translate('MESSAGE_SENT_SUCCESSFULLY')
      );
      res.status(201).json(response);
    } catch (error) {
      console.error(error);
      return next(
        new ApiError(
          500,
          localeService.translate('INTERNAL_SERVER_ERROR'),
          [error]
        )
      );
    }
  }
);