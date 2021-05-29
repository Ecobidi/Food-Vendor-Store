const {DataTypes, Model} = require('sequelize')
const productFactory = require('./product')

class Category extends Model {}
class CategoryProduct extends Model {}

module.exports = function(sequelize) {
  // Product Model
  const {Product} = productFactory(sequelize)
  // Category Model Schema
  Category.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 15]
      }
    },
    image: {
      type: DataTypes.STRING
    }
  }, {sequelize, timestamps: false, tableName: 'categories'})
  // CategoryProduct (Join Table) Model Schema 
  CategoryProduct.init({
    category_id: {
      type: DataTypes.INTEGER,
    },
    product_id: {
      type: DataTypes.INTEGER,
    },
  }, {sequelize, tableName: 'categories_products', timestamps: false, underscored: true})
  // Table Associations
  // Category -- Product Association (Many to Many)
  Category.belongsToMany(Product, {
    through: 'CategoryProduct',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    foreignKey: 'category_id'
  })
  Product.belongsToMany(Category, {
    through: 'CategoryProduct',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    foreignKey: 'product_id'
  })

  return {Category, CategoryProduct}
}