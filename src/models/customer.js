const bcrypt = require('bcryptjs')
let { DataTypes, Model } = require('sequelize')

class Customer extends Model{
  async comparePassword(password) {
    return await bcrypt.compare(password, this.getDataValue('password'))
  }

  async hashPassword(password) {
    return await bcrypt.hash(password, 10)
  }

  async updatePassword(password) {
    await this.setDataValue('password', this.hashPassword(password))
    return await this.save()
  }
}
class CustomerCart extends Model{}

module.exports = function(sequelize) {
  // Customer Model Schema
  Customer.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: {
          msg: 'must be valid email!'
        }
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    delivery_address: {
      type: DataTypes.STRING,
    },
  }, {sequelize, createdAt: 'created_at', updatedAt: false, tableName: 'customers'})

  // Customer Cart Model Schema
  CustomerCart.init({
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_variant: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    total_price: {
      type: DataTypes.DECIMAL(2),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {sequelize, timestamps: false, tableName: 'customers_cart'})

  // Table Associations
  // Customer -- CustomerCart (One to Many)
  Customer.hasMany(CustomerCart, {
    foreignKey: 'customer_id'
  })

  CustomerCart.belongsTo(Customer, {
    foreignKey: 'customer_id'
  })

  return {Customer, CustomerCart}
}