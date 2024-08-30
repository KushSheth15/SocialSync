import { Router } from 'express';

import commentRoutes from './comment.routes';
import friendshipRoutes from './friendship.routes';
import likeRoutes from './like.routes';
import postRoutes from './post.routes';
import tagRoutes from './tag.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/user',userRoutes);
router.use('/post',postRoutes);
router.use('/comment',commentRoutes);
router.use('/friendship',friendshipRoutes);
router.use('/like',likeRoutes);
router.use('/tags',tagRoutes);

export default router;