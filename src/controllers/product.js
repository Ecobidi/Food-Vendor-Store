const fs = require('fs').promises
const path = require('path')
const multer = require('multer')
const {ImageService, ProductService} = require('../services/index')
const {productPhotoPath} = require('../../config/app.config')

const DEFAULT_LIMIT = 10
const DEFAULT_OFFSET = 0

const prepareImagesMetaForTableInsert = (images, product) => {
  let metas // array to hold metas
  if (images) {
    metas = [] // initialize metas
    metas = images.map(image => {
      return ({ 
        product_id: product.id, 
        filename: image.path.replace(path.join(process.cwd(), '/src/uploads/products'), '') 
      })
    }) 
  return metas
  }
}

const productImageDiskStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    cb(null, path.join(process.cwd(), req.productImageDestination))
  }, // TODO: devise a suitable strategy for naming the files
  filename: (req, file, cb) => {
    req.count = req.count || 0
   cb(null, req.body.name + '_' + (++ req.count) + '.jpg') 
  }
})

const productImageUploadFilter = async (req, file, cb) => {
  try {
    // prevents multiple database queries
    if (typeof req.productExists === 'undefined') { // not yet checked
      let product = await ProductService.getInstance().findByName(req.body.name)
      req.productExists = (product) ? true : false // now checked
    }
    if (req.productExists) { // product with same name already exists
      cb(new multer.MulterError('Another product with same name: ' + req.body.name + ' already exists!')) // reject request
    } else {
      const acceptPattern = /.(jpeg|jpg|png)$/i  
      const isAcceptable = acceptPattern.test(file.originalname) && acceptPattern.test(file.mimetype)
      if (isAcceptable) cb(null, true) // accept image
      else cb(null, false) // reject image
    }
  } catch (err) {
    console.log('Error: productImageUploadFilter ', err)
    cb(new Error('An Error Occurred'))
  }
}

const uploadProductImage = multer({
  storage: productImageDiskStorage, 
  limits: { files: 6, fileSize: 1024 * 1024 * 0.5 },
  fileFilter: productImageUploadFilter
})

class ProductController {
  static uploadImage = uploadProductImage.fields([
    {name: 'primaryImage', maxCount: 1}, 
    {name: 'otherImages', maxCount: 5}
  ])

  static async createProduct(req, res, next) {
    ProductController.uploadImage(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        console.log(err)
        res.status(202).json({message: err.code})
      } else if (err) {
        console.log(err)
        res.status(500).end()
      } else {
        try {
          /// Applying Separation Of Concern
          // productService to insert product to product table
          let imagePath = req.files.primaryImage[0].path
          req.body.primary_image = imagePath.replace(path.join(process.cwd(), '/src/uploads/products'), '')
          const product = await ProductService.create(req.body)
          // imageService to insert imagesMeta to product_images table
          let preparedImagesMetas = prepareImagesMetaForTableInsert(req.files.otherImages, product)
          let savedImagesMetas
          if (preparedImagesMetas) {
            savedImagesMetas = await ImageService.saveProductImages(preparedImagesMetas)
          }
          res.status(201).json({product, savedImagesMeta: savedImagesMetas})
        } catch(err) {
          console.log('Error handling ProductController.createProduct() request. ', err)
          res.status(500).end()
        }
      }
    })
  }

  static async getProduct(req, res, next) {
    const productID = req.params.productID
    try {
      const product = await ProductService.findById(productID)
      // append accurate image_path
      product.primary_image = productPhotoPath + product.primary_image
      res.status(200).json(product)
    } catch (err) {
      console.log(`Error getting product with id ${productID} `, err)
      res.status(500).end()
    }
  }

  static async getProducts(req, res, next) {
    let query = req.query
    let limit = query.limit = Number(query.limit || DEFAULT_LIMIT) // default = 10
    let offset = query.offset = Number(query.offset || DEFAULT_OFFSET) // default = 0
    // TODO: propery format condition according to Sequelize query format
    try {
      let data = []
      console.log(query)

      if (query.category) {
        data = await ProductService.findByCategory(query)
      } 
      else if (query.search) {
        data = await ProductService.findByName(query)
        console.log(data)
      } else {
        data = await ProductService.findProducts(query)
      }
      
      // append accurate image_path
      data.forEach(p => {
        p.primary_image = productPhotoPath + p.primary_image
        p.ProductImages && p.ProductImages.forEach(otherImage => otherImage.filename = productPhotoPath + otherImage.filename)
      })
      let totalCount = await ProductService.countAll()
      let pageHits = totalCount / limit
      pageHits = (pageHits === 0) ? 0 : parseInt((pageHits + 1))
      let currentPage = (pageHits === 0) ? 0 : (data.length + offset) / limit
      // if currentPage has fractional parts, increment by 1 and convert to integer
      currentPage = (currentPage > parseInt(currentPage)) ? parseInt((currentPage + 1)) : parseInt(currentPage)
      res.json({currentPage, data, limit, offset, pageHits, totalCount})
    } catch (err) {
      console.log(`Error getting products `, err)
      res.status(500).end()
    }
  }

  static async getProductsByCategories(req, res, next) {
    let categories = req.query.category
    if (!categories) {
      return res.json({currentPage: 0, data: [], limit: 0, offset: 0, pageHits: 0, totalCount: 0})
    }
    if (!Array.isArray(categories)) {
      let temp = categories
      categories = []
      categories.push(temp)
    }

    let limit = req.query.limit = Number(req.query.limit || DEFAULT_LIMIT)
    let offset = req.query.offset = Number(req.query.offset || DEFAULT_OFFSET)
    try {
      let data = await ProductService.findByCategory({...req.query, categories})

      // append accurate image_path
      data.forEach(p => p.primary_image = productPhotoPath + p.primary_image)
      let totalCount = await ProductService.countAll()
      let pageHits = totalCount / limit
      pageHits = (pageHits === 0) ? 0 : parseInt((pageHits + 1))
      let currentPage = (pageHits === 0) ? 0 : (data.length + offset) / limit
      // if currentPage has fractional parts, increment by 1 and covert to integer
      currentPage = (currentPage > parseInt(currentPage)) ? parseInt((currentPage + 1)) : parseInt(currentPage)
      res.json({currentPage, data, limit, offset, pageHits, totalCount})
    } catch (err) {
      console.log(`Error getting products `, err)
      res.status(500).end()
    }
  }

  static async deleteProduct(req, res, next) {
    try {
      // retrieve product instance for destruction
      const product = await ProductService.findById(req.params.id)
      // retrieve productImages from products_images table
      const productImages = await ImageService.findByProductId(product.id)
      // array to store all the product images for fs removal
      let images = []
      images[0] = path.join(`${process.cwd()}/src${productPhotoPath}`, product.primary_image)
      productImages.forEach(i => images.push(path.join(`${process.cwd()}/src${productPhotoPath}`, i.filename)))
      // remove images from file system
      // TODO: this deletion task can be given to a separate micro-service that handles file deletion
      images.forEach(async (i) => await fs.unlink(i))
      // destroy product and its dependent records
      product.destroy()
      res.status(200).end()
    } catch (err) {
      console.log('Error: deleteProduct(): ', err)
      res.status(500).end()
    }
  }

  static async updateProduct(req, res, next) {

  }
}

module.exports = ProductController