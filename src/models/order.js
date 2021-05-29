const {DataTypes, Model} = require('sequelize')

class Order extends Model {}
class ProductsInOrder extends Model {}

module.exports = function(sequelize) {
  // Order Model Schema
  Order.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    payment_status: {
      type: DataTypes.ENUM('PAID', 'NOT PAID')
    },
    delivery_status: {
      type: DataTypes.ENUM('AWAITING', 'ACTIVE', 'DELIVERED')
    },
    delivery_charge: {
      type: DataTypes.DECIMAL
    },
    delivery_type: {
      type: DataTypes.ENUM('PICKUP', 'HOME DELIVERY')
    }
  }, {sequelize, createdAt: 'created_at', updatedAt: 'updated_at', tableName: 'orders'})

  // ProductsInOrder Model Schema
  ProductsInOrder.init({
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER
    },
    price: {
      type: DataTypes.INTEGER
    }
  }, {sequelize, timestamps: false, tableName: 'products_orders'})

  // Model Associations

  // Order -- ProductsInOrder (One to Many)

  Order.hasMany(ProductsInOrder, {
    onDelete: 'CASCADE', // SET NULL results in a Foreign Key Constraint Error
    foreignKey: 'order_id'
  })

  ProductsInOrder.belongsTo(Order, {
    foreignKey: 'order_id'
  })

  return {Order, ProductsInOrder}
}