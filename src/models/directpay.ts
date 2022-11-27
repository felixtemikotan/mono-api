import {DataTypes,Model} from 'sequelize';
import db from '../config/config';

interface DirectPayAttribute{
    id:string;
    userId:string;
    sessionId:string;
    logintoken:string;
    exchangetoken:string;
}

export class DirectPayInstance extends Model<DirectPayAttribute>{}

DirectPayInstance.init(
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
        sessionId:{
        type: DataTypes.STRING,
        allowNull: true
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
    tableName: 'directPayTable'
}
)
