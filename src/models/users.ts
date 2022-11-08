import { DataTypes, Model } from 'sequelize';
import db from '../config/database.config';

interface UserAtrribute {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  homeaddress:string;
  residentialaddress:string;
  nin: string;
  bvn: string;
  city:string;
  state:string;
  country:string;
  zipcode:string;
  comment:string;
  accountnumber:string;
  phonenumber: string;
  bankname:string;
  bankcode:string;
  bankaccountnumber:string;
  password: string;
  accountofficer:string;
  branch:string;
  
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
    homeaddress: {
        type: DataTypes.STRING,
        allowNull: false
    },
    residentialaddress: { 
        type: DataTypes.STRING,
        allowNull: false
    },
    nin: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    bvn: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    zipcode: {
        type: DataTypes.STRING,
        allowNull: false
    },
    comment: {
        type: DataTypes.STRING,
        allowNull: false
    },
    accountnumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
        
    }, 
    phonenumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }, 
    bankname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    bankcode: {
        type: DataTypes.STRING,
        allowNull: false
    },
    bankaccountnumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    accountofficer: {
        type: DataTypes.STRING,
        allowNull: false
    },
    branch: {
        type: DataTypes.STRING,
        allowNull: false
    },
  },
  {
    sequelize: db,
    tableName: 'userTable'
  }
);

//  UserInstance.hasMany(usersGroupInstance, { foreignKey: "userId", as: "groups" });
//  usersGroupInstance.belongsTo(UserInstance, { foreignKey: "userId", as: "user" });