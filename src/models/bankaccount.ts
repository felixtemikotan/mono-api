import {DataTypes,Model} from 'sequelize';
import db from '../config/database.config';

interface BankAccountAtrribute{
    id:string;
    userId:string;
    accountnumber:string;
    accountname:string;
    bankname:string;
    bankcode:string;
    accounttype:string;
    banktransactiontype:string;
    username:string;
    password:string;
}

export class BankAccountInstance extends Model<BankAccountAtrribute>{}

BankAccountInstance.init(
    {
        id:{
            type:DataTypes.STRING,
            primaryKey:true,
            allowNull:false
        },
        userId:{
            type:DataTypes.STRING,
            allowNull:false
        },
        accountnumber:{
            type:DataTypes.STRING,
            allowNull:false
        },
        accountname:{
            type:DataTypes.STRING,
            allowNull:false
        },
        bankname:{
            type:DataTypes.STRING,
            allowNull:false
        },
        bankcode:{
            type:DataTypes.STRING,
            allowNull:false
        },
        accounttype:{
            type:DataTypes.STRING,
            allowNull:false
        },
        banktransactiontype:{
            type:DataTypes.STRING,
            allowNull:false
        },
        username:{
            type:DataTypes.STRING,
            allowNull:false
        },
        password:{
            type:DataTypes.STRING,
            allowNull:false
        }

    },
    {
        sequelize:db,
        tableName:'bankaccountTable'
    }
)
