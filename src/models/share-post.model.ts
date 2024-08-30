/* eslint-disable max-len */
import Sequelize, {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
      
import db from '../sequelize-client';
      
export interface SharePostModelCreationAttributes {
          userId: string;
          postId?: string;
          recipientUserId?: string;
      }
      
export interface SharePostModelAttributes extends SharePostModelCreationAttributes {
          id: string;
      }
      
export default class SharePost extends Model<
          InferAttributes<SharePost>,
          InferCreationAttributes<SharePost>
      > {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare postId: string;
  declare recipientUserId: string;
      
  static associate: (models: typeof db) => void;
}
      
export const sharepost = (sequelize: Sequelize.Sequelize, DataTypes: typeof Sequelize.DataTypes) => {
  SharePost.init(
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
      recipientUserId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'recipient_user_id',
      },
    },
    {
      sequelize,
      underscored: true,
      timestamps: true,
      paranoid: true,
      modelName: 'SharePost',
      tableName: 'shareposts',
    },
  );
      
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  SharePost.associate = models => {};
      
  return SharePost;
};
      