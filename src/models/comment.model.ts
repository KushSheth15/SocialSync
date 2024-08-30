/* eslint-disable max-len */
import Sequelize, {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import db from '../sequelize-client';

export interface CommentModelCreationAttributes {
    content: string;
    userId: string;
    postId: string;
}

export interface CommentModelAttributes extends CommentModelCreationAttributes {
    id: string;
}

export default class Comment extends Model<
    InferAttributes<Comment>,
    InferCreationAttributes<Comment>
> {
  declare id: CreationOptional<string>;
  declare content: string;
  declare userId: string;
  declare postId: string;

  static associate: (models: typeof db) => void;
}

export const comment = (sequelize: Sequelize.Sequelize, DataTypes: typeof Sequelize.DataTypes) => {
  Comment.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      content: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
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
    },
    {
      sequelize,
      underscored: true,
      timestamps: true,
      paranoid: true,
      modelName: 'Comment',
      tableName: 'comments',
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Comment.associate = models => {
    Comment.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' });
    Comment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Comment;
};
