const { Op } = require('sequelize')
const {Product, ProductImage, ProductVariant, ComplementProduct, SupplementProduct, CategoryProduct} = require('../models/index')
const ImageService = require('./image')
class ProductService {

  // TODO: Since Model.save() only updates fields that changed, try and combine insert() and update() into one method save()

  static async create(productData) {
    // TODO: Product.save() doesn't eager-load associations, so look for a way to support eager-loading of associations. For instance, ProductVariant and ProductImage associations of Product Model

    // insert product
    const product = await Product.create(productData)

    // if only one category is selected it is no longer an array. Therefore convert it to an array
    if (!Array.isArray(productData.categories)) {
      productData.categories = [productData.categories]
    }
    // append the product id to the associated data
    const categories = productData.categories.map(c => ({product_id: product.id, category_id: c}))

    let sizes = Object.keys(productData.variant)
    let variants = []
    sizes.forEach(v => {
      if (productData.variant[v]) {
        variants.push({product_id: product.id, price: productData.variant[v], size: v})
      }
    })
    // const supplements = productData.supplements.map(s => {s.product_id = product.id; return s})
    // const complements = productData.complements.map(c => {c.product_id = product.id; return c})

    // insert associated data to respective tables
    await Promise.all([
      CategoryProduct.bulkCreate(categories),
      ProductVariant.bulkCreate(variants),
      // SupplementProduct.bulkCreate(supplements),
      // ComplementProduct.bulkCreate(complements)
    ])
    return product
  }

  static async findByCategory({category, limit = 10, offset = 0}) {
    let byCategory = await CategoryProduct.findAll({limit, offset, where: {
      category_id: category} })
    //   console.log('byCAtegory')
    // console.log(byCategory)
    let productIDs = byCategory.map(id => id.product_id)
    // console.log('productIDs')
    // console.log(productIDs)
    return await Product.findAll({where: {id: productIDs}, include: [ProductImage, ProductVariant]})
  }

  static async findById(id) {
    return await Product.findByPk(id, {include: [ProductImage, ProductVariant]})
  }
  
  static async findByName({search, offset = 0, limit = 10}) {
    let name = new RegExp(search, 'ig')
    return await Product.findAll({where: { name: { [Op.like]: `%${search}%` } }, limit, offset, include: [ProductImage, ProductVariant]})
  }

  static async findProducts( {condition, limit = 10, offset = 0} ) {
    return await Product.findAll({where: condition, limit, offset, include: [ProductImage, ProductVariant]})
  }

  static async countAll() {
    return await Product.count({})
  }

  // TODO: see if there is a way to upsert (insert or update) data. if it exists you may try and merge create() and update() to a save()
  static async update(data) {
    
  }

  static async delete(id) {
    return await Product.destroy({where: {id}})
  }
}

module.exports = ProductService