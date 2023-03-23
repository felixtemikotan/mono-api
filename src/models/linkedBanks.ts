import { DataTypes, Model } from 'sequelize';
import db from '../config/config';


interface LinkBankAtrribute {
  id:string;
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
    id:{
      type:DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },

    bankId: {
      type: DataTypes.STRING,
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
     
    },
    
    bankName: {
        type: DataTypes.STRING,
        allowNull: false,
        
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

 