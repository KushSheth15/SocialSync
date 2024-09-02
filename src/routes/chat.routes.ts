import { Router } from 'express';

import {CHAT_ROUTES} from '../constants/api.constant';
import {
  createChatRoom,
  getChatRoomMessage,
  sendMessage
} from '../controllers/chat.controller';
import { verifyToken } from '../middlewares/jwt.middleware';

const router = Router();

router.post(CHAT_ROUTES.CREATE_CHAT_ROOM,verifyToken,createChatRoom);

router.get(CHAT_ROUTES.GET_CHAT_ROOM_MESSAGE,verifyToken,getChatRoomMessage);

router.post(CHAT_ROUTES.SEND_MESSAGE,verifyToken,sendMessage);

export default router;