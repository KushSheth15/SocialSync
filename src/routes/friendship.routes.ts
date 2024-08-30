import { Router } from 'express';

import {
  sendFriendRequest,
  acceptFriendRequest,
  getAllFriends
} from '../controllers/friendship.controller';
import { verifyToken } from '../middlewares/jwt.middleware';

const router = Router();

router.post('/sent-request',verifyToken,sendFriendRequest);

router.post('/accept-request',verifyToken,acceptFriendRequest);

router.get('/get-friends',verifyToken,getAllFriends);

export default router;