/* eslint-disable max-len */
import Sequelize, {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
  
import db from '../sequelize-client';
  
export interface LikeModelCreationAttributes {
      userId: string;
      postId?: string;
      commentId?: string;
  }
  
export interface LikeModelAttributes extends LikeModelCreationAttributes {
      id: string;
  }
  
export default class Like extends Model<
      InferAttributes<Like>,
      InferCreationAttributes<Like>
  > {
  declare id: CreationOptional<string>;
  declare commentId?: string;
  declare userId?: string;
  declare postId?: string;
  
  static associate: (models: typeof db) => void;
}
  
export const like = (sequelize: Sequelize.Sequelize, DataTypes: typeof Sequelize.DataTypes) => {
  Like.init(
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
        allowNull: false,
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
      modelName: 'Like',
      tableName: 'likes',
    },
  );
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Like.associate = models => {};
  
  return Like;
};
  