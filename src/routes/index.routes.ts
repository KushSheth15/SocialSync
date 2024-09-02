import { Router } from 'express';

import {BASE_ROUTES} from '../constants/api.constant';

import chatRoutes from './chat.routes';
import commentRoutes from './comment.routes';
import friendshipRoutes from './friendship.routes';
import likeRoutes from './like.routes';
import postRoutes from './post.routes';
import sharePostRoutes from './share-post.routes';
import tagRoutes from './tag.routes';
import userRoutes from './user.routes';

const router = Router();

router.use(BASE_ROUTES.USER,userRoutes);
router.use(BASE_ROUTES.POST,postRoutes);
router.use(BASE_ROUTES.COMMENT,commentRoutes);
router.use(BASE_ROUTES.FRIENDSHIP,friendshipRoutes);
router.use(BASE_ROUTES.LIKE,likeRoutes);
router.use(BASE_ROUTES.TAGS,tagRoutes);
router.use(BASE_ROUTES.SHARE_POST,sharePostRoutes);
router.use(BASE_ROUTES.CHAT,chatRoutes);

export default router;