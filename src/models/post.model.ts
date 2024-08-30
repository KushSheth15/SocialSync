/* eslint-disable max-len */
import Sequelize, {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import db from '../sequelize-client';

export interface PostModelCreationAttributes {
    content: string;
    captions:string;
    userId: string;
}

export interface PostModelAttributes extends PostModelCreationAttributes {
    id: string;
}

export default class Post extends Model<InferAttributes<Post>, InferCreationAttributes<Post>> {
  declare id: CreationOptional<string>;
  declare content: string;
  declare captions?: string;
  declare userId: string;

  declare comments?:Comment[];

  static associate: (models: typeof db) => void;
}

export const post = (sequelize: Sequelize.Sequelize, DataTypes: typeof Sequelize.DataTypes) => {
  Post.init(
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
      captions: {
        type: DataTypes.STRING,
        allowNull:true
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
      },
    },
    {
      sequelize,
      underscored: true,
      timestamps: true,
      paranoid: true,
      modelName: 'Post',
      tableName: 'posts',
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Post.associate = models => {
    Post.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });

    Post.hasMany(models.Comment,{foreignKey:'postId',as:'comments'});
  };

  return Post;
};
