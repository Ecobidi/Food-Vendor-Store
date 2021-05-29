const {DataTypes, Model} = require('sequelize')
const productFactory = require('./product')

class ProductReview extends Model {}

module.exports = function(sequelize) {
  // Product Model
  const {Product} = productFactory(sequelize)

  // ProductReview Model Schema
  ProductReview.init({
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: true //accommodates unauthenticated customers
    },
    review: {
      type: DataTypes.TEXT,
      validate: {
        len: [2, 140]
      }
    }
  }, {sequelize, createdAt: 'created_at', updatedAt: false, tableName: 'products_reviews'})

  // Table Association
  // Product -- Review (One to Many)
  
  Product.hasMany(ProductReview, {
    onDelete: 'CASCADE', // SET NULL causes Foreign Key Constraint Error
    foreignKey: 'product_id'
  })

  ProductReview.belongsTo(Product, {
    foreignKey: 'product_id',
  })

  return {ProductReview}
}