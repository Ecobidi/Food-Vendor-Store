const {DataTypes, Model} = require('sequelize')

class Store extends Model {}

module.exports = function(sequelize) {
  // Store Model Schema
  Store.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    motto: {
      type: DataTypes.STRING
    },
    logo: {
      type: DataTypes.BLOB('tiny')
    },
    banner: {
      type: DataTypes.BLOB('medium')
    }
  }, {sequelize, createdAt: 'created_at', updatedAt: 'updated_at', tableName: 'store'})

  return { Store }
}