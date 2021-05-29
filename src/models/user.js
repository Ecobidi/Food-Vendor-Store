const bcrypt = require('bcryptjs')
const { DataTypes, Model } = require('sequelize')


class User extends Model {
  async comparePassword(password) {
    return await bcrypt.compare(password, this.getDataValue('password'))
  }

  hashPassword(password) {
    return bcrypt.hashSync(password, 10)
  }

  async updatePassword(password) {
    this.setDataValue('password', this.hashPassword(password))
    return await this.save()
  }
}

module.exports = function(sequelize) {
  User.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'must be valid email!'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [5, ]
      },
      set (value) {
        console.log('reached')
        this.setDataValue('password', this.hashPassword(value))
      }
    },
    fullname: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    roles: {
      type: DataTypes.ENUM('ROLE_ADMIN', 'ROLE_USER'),
      defaultValue: 'ROLE_ADMIN'
    },
    image: {
      type: DataTypes.STRING
    },
  
  }, {sequelize, createdAt: 'created_at', updatedAt: 'updated_at', tableName: 'users'})

  return {User}
}