/* eslint-disable max-len */
import Sequelize, {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import db from '../sequelize-client';

export interface ChatModelCreationAttributes {
    senderId: string;
    receiverId: string;
    message: string;
    roomId: string;
}

export interface ChatModelAttributes extends ChatModelCreationAttributes {
    id: string;
    sendTime: Date;
    isSeen: boolean;
}

export default class Chat extends Model<InferAttributes<Chat>, InferCreationAttributes<Chat>> {
  declare id: CreationOptional<string>;
  declare senderId: string;
  declare receiverId?: string;
  declare message: string;
  declare roomId: string;
  declare sendTime: CreationOptional<Date>;
  declare isSeen: CreationOptional<boolean>;

  static associate: (models: typeof db) => void;
}

export const chat = (sequelize: Sequelize.Sequelize, DataTypes: typeof Sequelize.DataTypes) => {
  Chat.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      senderId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'sender_id',
      },
      receiverId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'receiver_id',
      },
      roomId: {
        type: DataTypes.UUID,
        field: 'room_id',
      },
      sendTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      isSeen: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      underscored: true,
      timestamps: true,
      paranoid: true,
      modelName: 'Chat',
      tableName: 'chats',
    },
  );

  Chat.associate = models => {
    Chat.belongsTo(models.ChatRoom,{foreignKey:'roomId',as:'chatRoom'});
    Chat.belongsTo(models.User,{foreignKey:'senderId',as:'sender'});
    Chat.belongsTo(models.User,{foreignKey:'receiverId',as:'receiver'});
  };

  return Chat;
};
