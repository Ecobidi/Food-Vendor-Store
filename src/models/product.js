const {DataTypes, Model} = require('sequelize')

class Product extends Model {}
class ProductImage extends Model {}
class ProductVariant extends Model {}
class SupplementProduct extends Model {}
class ComplementProduct extends Model {}

module.exports = function(sequelize) {
  // Product Model Schema
  Product.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 15]
      }
    },
    discount: {
      type: DataTypes.DECIMAL,
      defaultValue: 0.0
    },
    status: {
      type: DataTypes.ENUM('AVAILABLE', 'NOT AVAILABLE'),
      defaultValue: 'AVAILABLE',
    },
    primary_image: {
      type: DataTypes.STRING
    },
    rating: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 5
      }
    }
  }, {sequelize, createdAt: 'created_at', updatedAt: 'updated_at', tableName: 'products'})

  // ProductImage Model Schema
  ProductImage.init({
    product_id: {
      type: DataTypes.INTEGER
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {sequelize, createdAt: 'created_at', updatedAt: 'updated_at', tableName: 'products_images'})

  // ProductVariant Model Schema
  ProductVariant.init({
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: 'product_variant_unique_key',
    }, 
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    size: {
      type: DataTypes.ENUM('SMALL', 'MEDIUM', 'LARGE'),
      allowNull: false,
      unique: 'product_variant_unique_key',
    }
  }, {sequelize, timestamps: false, tableName: 'products_variants'})

  // SupplementProduct Model Schema
  SupplementProduct.init({
    primary_product_id: {
      type: DataTypes.INTEGER
    },
    supplement_product_id: {
      type: DataTypes.INTEGER
    }
  }, {sequelize, timestamps: false, tableName: 'supplement_products'})

  // ComplementProduct Model Schema
  ComplementProduct.init({
    primary_product_id: {
      type: DataTypes.INTEGER
    },
    complement_product_id: {
      type: DataTypes.INTEGER
    }
  }, {sequelize, timestamps: false, tableName: 'complement_products'})

  // Table Associations

  // Product -- ProductImage Association (One to Many)
  Product.hasMany(ProductImage, {
    foreignKey: 'product_id'
  })
  ProductImage.belongsTo(Product, {foreignKey: 'product_id'})

  // Product -- ProductVariant Association (One to Many)
  Product.hasMany(ProductVariant, {
    foreignKey: 'product_id',
    foreignKeyConstraint: false // removes the unique foreign key which interfers with unique multiple columns
  }),
  ProductVariant.belongsTo(Product, { foreignKey: 'product_id'})

  // SupplementProduct Associations
  Product.hasMany(SupplementProduct, {
    onDelete: 'SET NULL',
    foreignKey: 'primary_product_id'
  })

  SupplementProduct.belongsTo(Product,  {
    foreignKey: 'primary_product_id'
  })

  // ComplementProduct Associations
  Product.hasMany(ComplementProduct, {
    onDelete: 'SET NULL',
    foreignKey: 'primary_product_id'
  })

  ComplementProduct.belongsTo(Product,  {
    foreignKey: 'primary_product_id'
  })

  return { Product, ProductImage, ProductVariant, SupplementProduct, ComplementProduct }
}