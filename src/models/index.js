const { Sequelize } = require('sequelize')
const {database, host, user, password} = require('../../config/db.config')
const sequelize = new Sequelize({
  database, username: user, password, host, dialect: 'mysql'})

const {Category, CategoryProduct} = require('./category')(sequelize)
const {Customer, CustomerCart} = require('./customer')(sequelize)
const {Order, ProductsInOrder} = require('./order')(sequelize)
const {Product, ProductImage, ProductVariant, ComplementProduct, SupplementProduct} = require('./product')(sequelize)
const {ProductReview} = require('./productReview')(sequelize)
const {Store} = require('./store')(sequelize)
const {User} = require('./user')(sequelize)

async function setup() {
  // arrange Model executions according to dependencies
  // ie dependents should be executed after the parents
  try {
    // await Store.sync({alter: true})
    // await Order.sync({alter: true})
    // await Customer.sync({alter: true})
    // await CustomerCart.sync({alter: true})
    // await Category.sync({alter: true})
    // await Product.sync({alter: true})
    // await CategoryProduct.sync({alter: true})
    // await ProductImage.sync({alter: true})
    // await ProductsInOrder.sync({alter: true})
    // await ProductReview.sync({alter: true})
    // await ProductVariant.sync({alter: true})
    // await ComplementProduct.sync({alter: true})
    // await SupplementProduct.sync({alter: true})
    // await User.sync({alter: true})
  }
  catch(err) {
    console.log('Error while syncing one of the tables\n', err)
    process.exit()
  }
}

//  setup database tables
setup()

module.exports = {Category, CategoryProduct, ComplementProduct, Customer, CustomerCart, Order, ProductsInOrder, ProductReview, Product, ProductImage, ProductVariant, Store, SupplementProduct, User,}

