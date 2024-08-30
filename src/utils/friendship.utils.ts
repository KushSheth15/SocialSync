import db from '../sequelize-client';

export const isFriend = 
async (userId:string,friendId:string):Promise<boolean> =>{
  const friendship = await db.Friendship.findOne({
    where:{
      requesterId: userId,
      receiverId: friendId,
      status: 'ACCEPTED'
    },
  });

  return friendship!=null;
};