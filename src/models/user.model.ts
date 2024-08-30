/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import bcrypt from 'bcrypt';
import Sequelize, {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import db from '../sequelize-client';

export interface UserModelCreationAttributes {
    email: string;
    password: string;
    userName?: string;
}

export interface UserModelAttributes extends UserModelCreationAttributes {
    id: string;
    profileImage: string;
    profileVisibility: 'PRIVATE' | 'FRIENDS_ONLY' | 'PUBLIC';
}

export default class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare email: string;
  declare password: string;
  declare userName: string;
  declare profileImage: CreationOptional<string>;
  declare profileVisibility: CreationOptional<'PRIVATE' | 'FRIENDS_ONLY' | 'PUBLIC'>;

  static associate: (models: typeof db) => void;

  static async hashPassword(user: User) {
    if (user.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  }
}

export const user = (sequelize: Sequelize.Sequelize, DataTypes: typeof Sequelize.DataTypes) => {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      profileImage: {
        type: DataTypes.STRING,
      },
      profileVisibility: {
        type: DataTypes.ENUM('PRIVATE', 'FRIENDS_ONLY', 'PUBLIC'),
        defaultValue: 'PUBLIC',
      },
    },
    {
      sequelize,
      underscored: true,
      timestamps: true,
      paranoid: true,
      modelName: 'User',
      tableName: 'users',
      hooks: {
        beforeCreate: User.hashPassword,
        beforeUpdate: User.hashPassword,
      },
    },
  );
  User.associate = models => {
    User.hasMany(models.Post, { foreignKey: 'userId', as: 'posts' });
    User.hasMany(models.Comment, { foreignKey: 'userId', as: 'comments' });
    User.belongsToMany(models.User, {
      through: models.Friendship,
      as: 'friends',
      foreignKey: 'requesterId',
      otherKey: 'receiverId'
    });
    User.belongsToMany(models.User, {
      through: models.Friendship,
      as: 'receivedRequests',
      foreignKey: 'receiverId',
      otherKey: 'requesterId',
    });
  };

  return User;
};
