import { Router } from 'express';

import {FRIENDSHIP_ROUTES} from '../constants/api.constant';
import {
  sendFriendRequest,
  acceptFriendRequest,
  getAllFriends
} from '../controllers/friendship.controller';
import { verifyToken } from '../middlewares/jwt.middleware';

const router = Router();

router.post(FRIENDSHIP_ROUTES.SEND_REQUEST,verifyToken,sendFriendRequest);

router.post(FRIENDSHIP_ROUTES.ACCEPT_REQUEST,verifyToken,acceptFriendRequest);

router.get(FRIENDSHIP_ROUTES.GET_FRIENDS,verifyToken,getAllFriends);

export default router;