/* eslint-disable max-len */
import {Response, NextFunction } from 'express';

import { Op } from 'sequelize';

import db from '../sequelize-client';
import { MyUserRequest } from '../types/request-interface';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import i18n from '../utils/intl/i18n-config';
import { LocaleService } from '../utils/intl/locale-service';

const localeService = new LocaleService(i18n);

export const sendFriendRequest = asyncHandler(
  async(req:MyUserRequest,res:Response,next:NextFunction)=>{
    const user = req.user;
    const {receiverId} = req.body;

    if(!user){
      return next(
        new ApiError(401, localeService.translate('USER_NOT_FOUND'))
      );
    }

    if(!receiverId){
      return next(
        new ApiError(400, localeService.translate('MISSING_REQUIRED_FIELDS'))
      );
    }

    try {
      const existingFriendship = await db.Friendship.findOne({
        where:{
          requesterId:user.id,
          receiverId:receiverId,
        }
      });
      if (existingFriendship) {
        return next(
          new ApiError(409, localeService.translate('FRIEND_REQUEST_ALREADY_EXISTS'))
        );
      }

      const newFriendRequest = await db.Friendship.create({
        requesterId:user.id,
        receiverId:receiverId,
        status:'PENDING',
      });

      const response = new ApiResponse(
        201,
        newFriendRequest,
        localeService.translate('FRIEND_REQUEST_SENT_SUCCESSFULLY')
      );
      res.status(201).json(response);
    } catch (error) {
      console.error(error);
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

export const acceptFriendRequest = asyncHandler(
  async(req:MyUserRequest,res:Response,next:NextFunction)=>{
    const user = req.user;
    const {requesterId} = req.params;

    if(!user){
      return next(
        new ApiError(401, localeService.translate('USER_NOT_FOUND'))
      );
    }

    if(!requesterId){
      return next(
        new ApiError(400, localeService.translate('MISSING_REQUIRED_FIELDS'))
      );
    }

    try {
      const friendRequest = await db.Friendship.findOne({
        where:{
          id:requesterId,
          receiverId:user.id,
          status:'PENDING',
        }
      });

      if(!friendRequest){
        return next(
          new ApiError(404, localeService.translate('FRIEND_REQUEST_NOT_FOUND'))
        );
      }

      friendRequest.status = 'ACCEPTED';
      await friendRequest.save();

      const response = new ApiResponse(
        200,
        friendRequest,
        localeService.translate('FRIEND_REQUEST_ACCEPTED_SUCCESSFULLY')
      );
      res.status(200).json(response);
    } catch (error) {
      console.error(error);
      return next(
        new ApiError(
          500,
          localeService.translate('INTERNAL_SERVER_ERROR'),
          [error]
        )
      );
    }
    
  });

export const getAllFriends = asyncHandler(
  async (req:MyUserRequest,res:Response,next:NextFunction)=>{
    const user = req.user;

    if(!user){
      return next(
        new ApiError(401, localeService.translate('USER_NOT_FOUND'))
      );
    }

    try {
      const friendships = await db.Friendship.findAll({
        where:{
          [Op.or]:[
            {requesterId:user.id,status:'ACCEPTED'},
            {receiverId:user.id,status:'ACCEPTED'}
          ]
        },
        include:[
          {
            model:db.User,
            as:'requester',
            attributes:['email', 'userName', 'profileImage']
          },
          {
            model:db.User,
            as:'receiver',
            attributes:['email', 'userName', 'profileImage']
          }
        ]
      });

      const formattedFriends = friendships.map(friendship => {
        const requester = friendship.requester;
        const receiver = friendship.receiver ;

        return requester && receiver
          ? friendship.requesterId === user.id
            ? { email: receiver.email, userName: receiver.userName, profileImage: receiver.profileImage }
            : { email: requester.email, userName: requester.userName, profileImage: requester.profileImage }
          : null;
      }).filter(friend => friend !== null);

      const response = new ApiResponse(
        200,
        formattedFriends,
        localeService.translate('FRIENDS_FETCHED_SUCCESSFULLY')
      );

      res.status(200).json(response);
    } catch (error) {
      console.error(error);
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