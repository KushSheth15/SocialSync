import {Response, NextFunction } from 'express';

import db from '../sequelize-client';
import { MyUserRequest } from '../types/request-interface';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import i18n from '../utils/intl/i18n-config';
import { LocaleService } from '../utils/intl/locale-service';

const localeService = new LocaleService(i18n);

/**
 * Tags a user in a post.
 * @param req - The request object, including user information, postId, and taggedUserId in the body.
 * @param res - The response object.
 * @param next - The next middleware function.
 */

export const tagUserInPost = asyncHandler(
  async(req:MyUserRequest,res:Response,next:NextFunction)=>{
    const user = req.user;
    const {postId,taggedUserId } = req.body;

    if(!user){
      return next(
        new ApiError(401, localeService.translate('USER_NOT_FOUND'))
      );
    }

    if(!postId ||!taggedUserId){
      return next(
        new ApiError(400, localeService.translate('MISSING_REQUIRED_FIELDS'))
      );
    }

    try {
      const userTag = await db.UserTag.create({
        postId,
        userId:taggedUserId
      });
            
      const response = new ApiResponse(
        201,
        userTag,
        localeService.translate('USER_TAGGED_SUCCESSFULLY')
      );

      res.status(201).json(response);
    } catch (error) {
      console.error(error);
      return next(
        new ApiError(500, localeService.translate('INTERNAL_SERVER_ERROR'), 
          [error]
        ));      
    }
  });