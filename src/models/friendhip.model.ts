/* eslint-disable max-len */
import Sequelize, {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import db from '../sequelize-client';

export interface FriendshipModelCreationAttributes {
    requesterId: string;
    receiverId: string;
}

export interface FriendshipModelAttributes extends FriendshipModelCreationAttributes {
    id: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export default class Friendship extends Model<
    InferAttributes<Friendship>,
    InferCreationAttributes<Friendship>
> {
  declare id: CreationOptional<string>;
  declare status: CreationOptional<'PENDING' | 'ACCEPTED' | 'REJECTED'>;
  declare requesterId: string;
  declare receiverId: string;

  static associate: (models: typeof db) => void;
}

export const friendship = (
  sequelize: Sequelize.Sequelize,
  DataTypes: typeof Sequelize.DataTypes,
) => {
  Friendship.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      requesterId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'requester_id',
      },
      receiverId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'receiver_id',
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'REJECTED'),
        defaultValue: 'PENDING',
      },
    },
    {
      sequelize,
      underscored: true,
      timestamps: true,
      paranoid: true,
      modelName: 'Friendship',
      tableName: 'friendships',
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Friendship.associate = models => {};

  return Friendship;
};
