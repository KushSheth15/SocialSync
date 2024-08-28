/* eslint-disable max-len */
import Sequelize, {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import db from '../sequelize-client';

export interface SettingModelCreationAttributes {
    userId: string;
}

export interface SettingModelAttributes extends SettingModelCreationAttributes {
    id: string;
    notificationsEnabled: boolean;
}

export default class Setting extends Model<
    InferAttributes<Setting>,
    InferCreationAttributes<Setting>
> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare notificationsEnabled: CreationOptional<boolean>;

  static associate: (models: typeof db) => void;
}

export const setting = (sequelize: Sequelize.Sequelize, DataTypes: typeof Sequelize.DataTypes) => {
  Setting.init(
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
      notificationsEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      underscored: true,
      timestamps: true,
      paranoid: true,
      modelName: 'Setting',
      tableName: 'settings',
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Setting.associate = models => {};

  return Setting;
};
