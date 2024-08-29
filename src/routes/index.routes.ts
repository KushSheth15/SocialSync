import { Router } from 'express';

import commentRoutes from './comment.routes';
import postRoutes from './post.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/user',userRoutes);
router.use('/post',postRoutes);
router.use('/comment',commentRoutes);

export default router;