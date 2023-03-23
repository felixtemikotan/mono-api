import {DataTypes,Model} from 'sequelize';
import db from '../config/config';

interface TransactionAttribute{
    id:string;
    userId:string;
    bankId:string;
    sessionId:string;
    loginToken:string;
    exchangeToken:string
    amount:number;
    description:string;
    referrence: string;

}

export class TransactionInstance extends Model<TransactionAttribute>{}

TransactionInstance.init(
{
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
      },
      userId:{
        type: DataTypes.STRING,
        allowNull: false
      },
      bankId:{
        type: DataTypes.STRING,
        allowNull: true
      },
      sessionId:{
        type: DataTypes.STRING,
        allowNull: true
      },
      loginToken:{
        type: DataTypes.STRING,
        allowNull: true
      },
      exchangeToken:{
        type: DataTypes.STRING,
        allowNull: true
      },
      amount:{
        type: DataTypes.NUMBER,
        allowNull: true
      },
      description:{
        type: DataTypes.STRING,
        allowNull: true
      },
      referrence:{
        type: DataTypes.STRING,
        allowNull: true
      },   
      
},

  {
    sequelize: db,
    tableName: 'transactions'
  }
)
