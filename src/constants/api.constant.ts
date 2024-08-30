export const USER_ROUTES = {
  REGISTER:'/register',
  LOGIN:'/login',
  UPLOAD_PROFILE:'/upload-profile',
  UPDATE_PROFILE:'/update-profile',
  GET_PROFILE:'/get-profile/:id'
};

export const POST_ROUTES = {
  CREATE: '/create-post',
  GET_ALL: '/get-post',
  GET_BY_ID: '/get-post/:id',
  UPDATE: '/update-post/:id',
  DELETE: '/delete-post/:id',
  VIEW: '/view-post/:postId',
};

export const COMMENT_ROUTES = {
  ADD: '/add-comment',
  GET_BY_POST: '/get-comment/:postId',
  UPDATE: '/update-comment/:id',
  DELETE: '/delete-comment/:id',
};

export const LIKE_ROUTES = {
  LIKE_POST: '/like-post',
  LIKE_COMMENT: '/like-comment',
};

export const FRIENDSHIP_ROUTES = {
  SEND_REQUEST: '/sent-request',
  ACCEPT_REQUEST: '/accept-request/:requesterId',
  GET_FRIENDS: '/get-friends',
};

export const TAG_ROUTES = {
  TAG_USER: '/tag-user',
};

export const SHARE_POST_ROUTES = {
  SHARE_POST: '/share-post',
};

export const BASE_ROUTES = {
  USER:'/user',
  POST:'/post',
  COMMENT:'/comment',
  FRIENDSHIP:'/friendship',
  LIKE:'/like',
  TAGS:'/tags',
  SHARE_POST:'/share-post'
};