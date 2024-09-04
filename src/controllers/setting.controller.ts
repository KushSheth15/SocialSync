/* eslint-disable max-len */
import { Response, NextFunction } from 'express';

import logger from '../logger';
import db from '../sequelize-client';
import { MyUserRequest } from '../types/request-interface';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import i18n from '../utils/intl/i18n-config';
import { LocaleService } from '../utils/intl/locale-service';

const localeService = new LocaleService(i18n);

/**
 * Updates the notification settings for a user.
 * @param req - The request object, including userId and notificationsEnabled in the body.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export const updateNotificationSetting = asyncHandler(
  async (req: MyUserRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    const {notificationsEnabled } = req.body;

    // Validate userId and notificationsEnabled
    if (!user) {
      return next(
        new ApiError(400, localeService.translate('USER_NOT_FOUND'))
      );
    }

    if (typeof notificationsEnabled !== 'boolean') {
      return next(
        new ApiError(400, localeService.translate('INVALID_NOTIFICATION_SETTING'))
      );
    }

    try {
      // Find existing setting or create new one
      const [setting, created] = await db.Setting.findOrCreate({
        where: { userId:user.id },
        defaults: { userId:user.id, notificationsEnabled },
      });

      // Update the setting if it already exists
      if (!created) {
        setting.notificationsEnabled = notificationsEnabled;
        await setting.save();
      }

      const response = new ApiResponse(
        200,
        setting,
        localeService.translate('NOTIFICATION_SETTING_UPDATED')
      );

      res.status(200).json(response);
    } catch (error) {
      logger.error(error);
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
