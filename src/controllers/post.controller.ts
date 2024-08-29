/* eslint-disable max-len */
import {Response, NextFunction } from 'express';

import db from '../sequelize-client';
import { MyUserRequest } from '../types/request-interface';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import i18n from '../utils/intl/i18n-config';
import { LocaleService } from '../utils/intl/locale-service';

const localeService = new LocaleService(i18n);

export const createPost = 
    asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) => {
      const { content } = req.body;
      const user = req.user;

      if (!user) {
        return next(
          new ApiError(401, localeService.translate('USER_NOT_FOUND'))
        );
      }

      try {
        const newPost = await db.Post.create({
          content,
          userId: user.id,
        });

        const response = new ApiResponse(
          201,
          newPost,
          localeService.translate('POST_CREATED_SUCCESSFULLY'),
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

export const getAllPost = asyncHandler(async (req:MyUserRequest,res:Response,next:NextFunction)=>{
  const user = req.user;
  if(!user){
    return next(
      new ApiError(401, localeService.translate('USER_NOT_FOUND'))
    );
  }

  try {
    const getPost = await db.Post.findAll();

    const response = new ApiResponse(200,getPost,localeService.translate('POST_RETRIVED_SUCCESSFULLY'));
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return next(
      new ApiError(500, localeService.translate('INTERNAL_SERVER_ERROR'), 
        [error]
      ));
  }
});

export const getPostById = asyncHandler(async (req:MyUserRequest,res:Response,next:NextFunction)=>{
  const user = req.user;
  const {id} = req.params;

  if(!user){
    return next(
      new ApiError(401, localeService.translate('USER_NOT_FOUND'))
    );
  }

  try {
    const post = await db.Post.findByPk(id);
    if(!post){
      return next(
        new ApiError(404, localeService.translate('POST_NOT_FOUND'))
      );
    }
    const response = new ApiResponse(200, post, localeService.translate('POST_RETRIVED_SUCCESSFULLY'));
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return next(
      new ApiError(500, localeService.translate('INTERNAL_SERVER_ERROR'), 
        [error]
      ));
  }
});

export const updatePost = asyncHandler(async (req:MyUserRequest,res:Response,next:NextFunction)=>{
  const user = req.user;
  const {id} = req.params;
  const {content} = req.body;

  if(!user){
    return next(
      new ApiError(401, localeService.translate('USER_NOT_FOUND'))
    );
  }

  try {
    const post = await db.Post.findByPk(id);
    if(!post){
      return next(
        new ApiError(404, localeService.translate('POST_NOT_FOUND'))
      );
    }

    if(post.userId!== user.id){
      return next(
        new ApiError(403, localeService.translate('FORBIDDEN_ACCESS'))
      );
    }

    await post.update({content});

    const response = new ApiResponse(200, post, localeService.translate('POST_UPDATED_SUCCESSFULLY'));
    return res.status(200).json(response);
  } catch(error){
    console.error(error);
    return next(
      new ApiError(500, localeService.translate('INTERNAL_SERVER_ERROR'), 
        [error]
      ));
  }
});

export const deletePost = asyncHandler(async (req:MyUserRequest,res:Response,next:NextFunction)=>{
  const user = req.user;
  const {id} = req.params;

  if(!user){
    return next(
      new ApiError(401, localeService.translate('USER_NOT_FOUND'))
    );
  }

  try {
    const post = await db.Post.findByPk(id);
    if(!post){
      return next(
        new ApiError(404, localeService.translate('POST_NOT_FOUND'))
      );
    }

    if(post.userId!== user.id){
      return next(
        new ApiError(403, localeService.translate('FORBIDDEN_ACCESS'))
      );
    }

    await post.destroy();

    const response = new ApiResponse(200, null, localeService.translate('POST_DELETE_SUCCESSFULLY'));
    return res.status(200).json(response);
  } catch(error){
    console.error(error);
    return next(
      new ApiError(500, localeService.translate('INTERNAL_SERVER_ERROR'), 
        [error]
      ));
  }
}); 