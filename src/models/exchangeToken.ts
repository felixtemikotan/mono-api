import {DataTypes,Model} from 'sequelize';
import db from '../config/database.config';

interface ExchangeTokenAttribute{
    id:string;
    userId:string;
    logintoken:string;
    exchangetoken:string;
}

export class ExchangeTokenInstance extends Model<ExchangeTokenAttribute>{}

ExchangeTokenInstance.init(
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
      logintoken:{
        type: DataTypes.STRING,
        allowNull: true
      },
      exchangetoken:{
        type: DataTypes.STRING,
        allowNull: true
      }

},

  {
    sequelize: db,
    tableName: 'exchangeTokenTable'
  }
)
