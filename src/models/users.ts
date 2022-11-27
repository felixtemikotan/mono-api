import { DataTypes, Model } from 'sequelize';
import db from '../config/config';
import { BankAccountInstance } from './bankaccount';

/*
id,
            fullname,
            username,
            email,
            phonenumber,
            password: hashedPin,
*/
interface UserAtrribute {
  id: string;
  fullname: string,
  username: string;
  email: string;
  mobile: string;
  pin: string;
  wallet: number,
}

export class UserInstance extends Model<UserAtrribute> {}

UserInstance.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },

    fullname: {
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
    
    mobile: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }, 
   
    pin: {
        type: DataTypes.STRING,
        allowNull: false
    },
    wallet:{
      type:DataTypes.FLOAT,
      defaultValue:0.00,
      allowNull:false
    }
  },
  {
    sequelize: db,
    tableName: 'userTable'
  }
);

 UserInstance.hasMany(BankAccountInstance, { foreignKey: "userId", as: "bankaccounts" });
 BankAccountInstance.belongsTo(UserInstance, { foreignKey: "userId", as: "user" });