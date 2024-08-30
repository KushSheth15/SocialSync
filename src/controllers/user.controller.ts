/* eslint-disable max-len */
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import { MyUserRequest } from 'request-interface';
import { Op } from 'sequelize';

import db from '../sequelize-client';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import uploadOnCloudinary from '../utils/cloudinary';
import encryption from '../utils/encryption';
import i18n from '../utils/intl/i18n-config';
import { LocaleService } from '../utils/intl/locale-service';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt-tokens';
import redisClient from '../utils/redis-client';

const localeService = new LocaleService(i18n);

const VALID_PROFILE_VISIBILITIES = ['PRIVATE', 'FRIENDS_ONLY', 'PUBLIC'];

export const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userName, email, password } = req.body;
    if (!userName || !email || !password) {
      return next(new ApiError(400, localeService.translate('MISSING_REQUIRED_FIELDS')));
    }

    try {
      const existingUser = await db.User.findOne({
        where: {
          [Op.or]: [{ email }, { userName }],
        },
      });

      if (existingUser) {
        return next(new ApiError(400, localeService.translate('EMAIL_ALREADY_EXIST')));
      }

      const newUser = await db.User.create({
        userName,
        email,
        password,
      });

      const response = new ApiResponse(201, newUser, localeService.translate('ACCOUNT_CREATED_SUCCESSFULLY'));
      res.status(201).json(response);
    } catch (error) {
      console.log(error);
      return next(new ApiError(500, localeService.translate('INTERNAL_SERVER_ERROR'), [error]));
    }
  },
);

export const loginUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ApiError(400, localeService.translate('MISSING_REQUIRED_FIELDS')));
  }

  try {
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return next(new ApiError(404, localeService.translate('USER_NOT_FOUND')));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new ApiError(401, localeService.translate('INVALID_CREDENTIAL')));
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });
    const encryptedAccessToken = encryption.encryptWithAES(accessToken);

    const existingAccessToken = await db.AccessToken.findOne({
      where: {
        userId: user.id,
        tokenType: 'ACCESS',
      },
    });
    if (existingAccessToken) {
      await db.AccessToken.destroy({
        where: {
          id: existingAccessToken.id,
        },
      });
    }

    await db.AccessToken.create({
      tokenType: 'ACCESS',
      token: encryptedAccessToken,
      userId: user.id,
      expiredAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
    });

    let refreshTokenRecord = await db.AccessToken.findOne({
      where: {
        userId: user.id,
        tokenType: 'REFRESH',
      },
    });

    let refreshToken: string;

    if (!refreshTokenRecord) {
      refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
      });
      const encryptedRefreshToken = encryption.encryptWithAES(refreshToken);

      refreshTokenRecord = await db.AccessToken.create({
        tokenType: 'REFRESH',
        token: encryptedRefreshToken,
        userId: user.id,
        expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    } else {
      refreshToken = encryption.decryptWithAES(refreshTokenRecord.token);
    }

    // Cache using Redis
    await redisClient.set(`user:${user.id}`, JSON.stringify(user), 'EX', 3600);

    const response = new ApiResponse(
      201,
      {
        accessToken,
        refreshToken,
        user,
      },
      localeService.translate('LOGIN_SUCCESSFULLY'),
    );

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, localeService.translate('INTERNAL_SERVER_ERROR'), [error]));
  }
});

export const uploadProfile = asyncHandler(async (req:MyUserRequest,res: Response, next: NextFunction)=>{
  const profileImage = req.file?.path;
  const user = req.user;

  if(!user){
    return next(new ApiError(404, localeService.translate('USER_NOT_FOUND')));
  }
  if(!profileImage){
    throw new ApiError(400, localeService.translate('FILE_REQUIRED'));
  }

  try {
    const profile = await uploadOnCloudinary(profileImage);
    if(!profile || !profile.url){
      throw new ApiError(400, localeService.translate('PROFILE_UPLOAD_FAILED'));
    }

    user.profileImage = profile.url;
    await user.save();

    // Cache using Redis
    await redisClient.set(`user:${user.id}`, JSON.stringify(user), 'EX', 3600);

    return res.status(200).json(new ApiResponse(200, user, localeService.translate('PROFILE_UPDATED_SUCCESSFULLY')));
  } catch (error) {
    console.error('Error in uploadProfile:', error);
    return next(new ApiError(500,  localeService.translate('INTERNAL_SERVER_ERROR'), [error]));
  }
  
});

export const updateProfile = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) => {
  const { userName, email, profileVisibility } = req.body;
  const profileImage = req.file?.path;
  const user = req.user;

  if (!user) {
    return next(new ApiError(404, localeService.translate('USER_NOT_FOUND')));
  }

  if (profileVisibility && !VALID_PROFILE_VISIBILITIES.includes(profileVisibility)) {
    return next(new ApiError(400, localeService.translate('INVALID_PROFILE_VISIBILITY')));
  }

  try {
    // Upload profile image if it exists
    let profileImageUrl: string | undefined;
    if (profileImage) {
      const profile = await uploadOnCloudinary(profileImage);
      if (!profile || !profile.url) {
        return next(new ApiError(400, localeService.translate('PROFILE_UPLOAD_FAILED')));
      }
      profileImageUrl = profile.url;
    }

    // Update user profile
    const updatedUser = await db.User.update(
      {
        userName,
        email,
        profileImage: profileImageUrl,
        profileVisibility,
      },
      {
        where: { id: user.id },
        returning: true,
      }
    );

    if (!updatedUser) {
      return next(new ApiError(404, localeService.translate('UPDATE_USER_FAILED')));
    }

    // Update the cache with the new profile data
    await redisClient.set(`user:${user.id}`, JSON.stringify(updatedUser[1][0]), 'EX', 3600);

    return res.status(200).json(new ApiResponse(200, updatedUser[1][0], localeService.translate('PROFILE_UPDATED_SUCCESSFULLY')));
  } catch (error) {
    console.error(error);
    return next(new ApiError(500, localeService.translate('INTERNAL_SERVER_ERROR'), [error]));
  }
});

export const getUserProfile = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction)=>{
  const userId = req.params.id;
  try {
    const cachedProfile = await redisClient.get(`user:${userId}`);
    if(cachedProfile){
      return res.status(200).json(new ApiResponse(200, JSON.parse(cachedProfile), localeService.translate('USER_PROFILE_FETCHED_SUCCESSFULLY')));
    }

    const user = await db.User.findByPk(userId,{
      attributes:['userName','profileImage','profileVisibility'],
    });
    if(!user){
      return next(new ApiError(404, localeService.translate('USER_NOT_FOUND')));
    }

    await redisClient.set(`user:${userId}`,JSON.stringify(user),'EX',3600);
    return res.status(200).json(new ApiResponse(200, user, localeService.translate('USER_PROFILE_FETCHED_SUCCESSFULLY')));
  } catch (error) {
    console.error(error);
    return next(new ApiError(500, localeService.translate('INTERNAL_SERVER_ERROR'), [error]));
  }
});