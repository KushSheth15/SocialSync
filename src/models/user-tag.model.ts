/* eslint-disable max-len */
import Sequelize, {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
    
import db from '../sequelize-client';
    
export interface UserTagModelCreationAttributes {
        userId: string;
        postId?: string;
        commentId?: string;
    }
    
export interface UserTagModelAttributes extends UserTagModelCreationAttributes {
        id: string;
    }
    
export default class UserTag extends Model<
        InferAttributes<UserTag>,
        InferCreationAttributes<UserTag>
    > {
  declare id: CreationOptional<string>;
  declare commentId?: string;
  declare userId: string;
  declare postId: string;
    
  static associate: (models: typeof db) => void;
}
    
export const usertag = (sequelize: Sequelize.Sequelize, DataTypes: typeof Sequelize.DataTypes) => {
  UserTag.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
      },
      postId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'post_id',
      },
      commentId:{
        type: DataTypes.UUID,
        allowNull: true,
        field: 'comment_id',
      }
    },
    {
      sequelize,
      underscored: true,
      timestamps: true,
      paranoid: true,
      modelName: 'UserTag',
      tableName: 'usertags',
    },
  );
    
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  UserTag.associate = models => {};
    
  return UserTag;
};
    