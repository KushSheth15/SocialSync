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
  }
  
export interface ChatModelAttributes extends ChatModelCreationAttributes {
      id: string;
  }
  
export default class Chat extends Model<
      InferAttributes<Chat>,
      InferCreationAttributes<Chat>
  > {
  declare id: CreationOptional<string>;
  declare senderId: string;
  declare receiverId: string;
  declare message: string;
  
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
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Chat.associate = models => {
    
  };
  
  return Chat;
};
  