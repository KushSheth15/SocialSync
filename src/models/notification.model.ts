/* eslint-disable max-len */
import Sequelize, {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import db from '../sequelize-client';

export interface NotificationModelCreationAttributes {
    message: string;
    userId: string;
}

export interface NotificationModelAttributes extends NotificationModelCreationAttributes {
    id: string;
    type: 'FRIEND_REQUEST' | 'COMMENT' | 'LIKE' | 'MESSAGE';
    isRead: boolean;
}

export default class Notification extends Model<
    InferAttributes<Notification>,
    InferCreationAttributes<Notification>
> {
  declare id: CreationOptional<string>;
  declare type: CreationOptional<'FRIEND_REQUEST' | 'COMMENT' | 'LIKE' | 'MESSAGE'>;
  declare message: string;
  declare userId: string;
  declare isRead: CreationOptional<boolean>;

  static associate: (models: typeof db) => void;
}

export const notification = (
  sequelize: Sequelize.Sequelize,
  DataTypes: typeof Sequelize.DataTypes,
) => {
  Notification.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
      },
      type: {
        type: DataTypes.ENUM('FRIEND_REQUEST', 'COMMENT', 'LIKE', 'MESSAGE'),
        allowNull: true,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      underscored: true,
      timestamps: true,
      paranoid: true,
      modelName: 'Notification',
      tableName: 'notifications',
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Notification.associate = models => {};

  return Notification;
};
