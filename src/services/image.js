const fs = require('fs')
const { ProductImage } = require('../models/index')

class ImageService {

  static async findByProductId(product_id) {
    return await ProductImage.findAll({where: {product_id}})
  }

  static async saveProductImages(preparedImagesMeta) {
    let savedImagesMeta = await ProductImage.bulkCreate(preparedImagesMeta)
    return savedImagesMeta
  }
  
}

module.exports = ImageService