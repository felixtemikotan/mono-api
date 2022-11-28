import { DataTypes, Model } from 'sequelize';
import db from '../config/config';


interface LinkBankAtrribute {
  bankId: string;
  userId: string,
  icon: string;
  bankName: string;
  username: string;
  password: string;
  serviceType:string;
  wallet: number,
}

export class LinkedBankInstance extends Model<LinkBankAtrribute> {}

LinkedBankInstance.init(
  {
    bankId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },

    userId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    
    bankName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }, 
   
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    serviceType:{
        type: DataTypes.STRING,
        allowNull: false
    },
    wallet:{
      type:DataTypes.FLOAT,
      defaultValue:0.00,
      allowNull:false
    },
  },
  {
    sequelize: db,
    tableName: 'linkedBanksTable'
  }
);

 