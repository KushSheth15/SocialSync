import { Router } from 'express';

import { SETTING_ROUTES } from '../constants/api.constant';

import {
  updateNotificationSetting
} from '../controllers/setting.controller';
import { verifyToken } from '../middlewares/jwt.middleware';

const router = Router();

router.post(
  SETTING_ROUTES.UPDATE_SETTING,
  verifyToken,
  updateNotificationSetting
);

export default router;