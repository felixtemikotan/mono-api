import { DataTypes, Model } from 'sequelize';
import db from '../config/database.config';
import { BankAccountInstance } from './bankaccount';

interface UserAtrribute {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phonenumber: string;
  password: string;
}

export class UserInstance extends Model<UserAtrribute> {}

UserInstance.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },

    firstname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    
    phonenumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }, 
   
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
  },
  {
    sequelize: db,
    tableName: 'userTable'
  }
);

 UserInstance.hasMany(BankAccountInstance, { foreignKey: "userId", as: "bankaccounts" });
 BankAccountInstance.belongsTo(UserInstance, { foreignKey: "userId", as: "user" });