/* eslint-disable max-len */
import Sequelize, {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
  
import db from '../sequelize-client';
  
export interface ChatRoomModelCreationAttributes {
      name:string;
      isGroup:boolean;
  }
  
export interface ChatRoomModelAttributes extends ChatRoomModelCreationAttributes {
      id: string;
  }
  
export default class ChatRoom extends Model<InferAttributes<ChatRoom>, InferCreationAttributes<ChatRoom>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare isGroup: boolean;
  
  static associate: (models: typeof db) => void;
}
  
export const chatroom = (sequelize: Sequelize.Sequelize, DataTypes: typeof Sequelize.DataTypes) => {
  ChatRoom.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isGroup: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      underscored: true,
      timestamps: true,
      paranoid: true,
      modelName: 'ChatRoom',
      tableName: 'chatrooms',
    },
  );
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ChatRoom.associate = models => {};
  
  return ChatRoom;
};
  