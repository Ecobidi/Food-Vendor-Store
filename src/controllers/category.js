const fs = require('fs').promises
const path = require('path')
const multer = require('multer')
const {CategoryService} = require('../services/')
const {categoryPhotoPath} = require('../../config/app.config')

const DEFAULT_LIMIT = 10
const DEFAULT_OFFSET = 0

const categoryImageDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), '/src/uploads/categories/'))
  },
  filename: (req, file, cb) => {
    // name the image according to the category name
    cb(null, req.body.name + '.jpg' ) // store in .jpg
  }
})

const newCategoryImageUploadFilter = async (req, file, cb) => {
  try {
    let category = await CategoryService.getInstance().findByName(req.body.name)
    if (category) { // category with same name already exists
      cb(new multer.MulterError(req.body.name + ' already exists!')) // reject request
    } else {
      const acceptPattern = /.(jpeg|jpg|png)$/i  
      const isAcceptable = acceptPattern.test(file.originalname) && acceptPattern.test(file.mimetype)
      if (isAcceptable) cb(null, true) // accept image
      else cb(null, false) // reject image
    }
  } catch (err) {
    console.log('Error: newCategoryImageUploadFilter ', err)
    cb(new Error('An Error Occurred'))
  }
}

const editCategoryImageUploadFilter = async (req, file, cb) => {
  try {
    let category = await CategoryService.getInstance().findById(req.params.id)
    if (!category) { // category doesn't exists
      cb(new multer.MulterError(req.body.name + ' does not exist!')) // reject request
    } else {
      // rename old image to new category name, in order to allow new image to successfully overwrite old one
      const oldName = path.join(process.cwd(), `src/${categoryPhotoPath}/${category.image}`)
      const newName = path.join(process.cwd(), `src/${categoryPhotoPath}/${req.body.name}.jpg`)
      let status = await fs.rename(oldName, newName)
      console.log(status)
      // validation
      const acceptPattern = /.(jpeg|jpg|png)$/i  
      const isAcceptable = acceptPattern.test(file.originalname) && acceptPattern.test(file.mimetype)
      if (isAcceptable) cb(null, true) // accept image
      else cb(null, false) // reject image
    }
  } catch (err) {
    console.log('Error: editCategoryImageUploadFilter ', err)
    cb(new Error('An Error Occurred'))
  }
}

const uploadNewCategoryImage = multer({
  storage: categoryImageDiskStorage, 
  limits: {fileSize: 1024 * 1024 * 0.5},
  fileFilter: newCategoryImageUploadFilter
})

const uploadEditCategoryImage = multer({
  storage: categoryImageDiskStorage, 
  limits: {fileSize: 1024 * 1024 * 0.5},
  fileFilter: editCategoryImageUploadFilter
})

class CategoryController {
  // handles new category image upload
  static uploadNewImage = uploadNewCategoryImage.single('image')
  // handles updated category image upload
  static uploadEditedImage = uploadEditCategoryImage.single('image')

  static async createCategory(req, res, next) {
    CategoryController.uploadNewImage(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        res.status(202).json({message: err.code})
      } else if (err) {
        console.log('Error: CategoryController.createCategory(): ', err)
        res.status(500).end()
      } else { // image saved successfully
        try {
          req.body.image = req.file ? req.file.filename : ''
          await CategoryService.create(req.body)
          res.status(201).end()
        } catch (err) {
          console.log('Error: CategoryController.createCategory(): ', err)
          res.status(500).end()
        }
      }
    })
  }

  static async getCategories(req, res, next) {
    let limit = req.query.limit = Number(req.query.limit || DEFAULT_LIMIT)
    let offset = req.query.offset = Number(req.query.offset || DEFAULT_OFFSET)
    try {
      const data = await CategoryService.findAll(req.query)
      // append the accurate category image path
      data.forEach(d => d.image = categoryPhotoPath + d.image)
      const totalCount = await CategoryService.countAll()
      let pageHits = totalCount / limit
      pageHits = (pageHits === 0) ? 0 : parseInt((pageHits + 1))
      let currentPage = (pageHits === 0) ? 0 : (data.length + offset) / limit
      // if currentPage has fractional parts, increment by 1 and covert to integer
      currentPage = (currentPage > parseInt(currentPage)) ? parseInt((currentPage + 1)) : parseInt(currentPage)
      res.json({currentPage, data, limit, offset, pageHits, totalCount})
    } catch (err) {
      console.log('Error: CategoryController.getCategories(): ', err)
      res.status(500).end()
    }
  }

  static async updateCategory(req, res, next) {
    CategoryController.uploadEditedImage(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        res.status(202).json({message: err.code})
      } else if (err) {
        console.log('Error: CategoryController.updateCategory(): ', err)
        res.status(500).end()
      } else { // image saved successfully
        try {
          if (req.file) {  // update image name
            req.body.image = req.file.filename
          }
          await CategoryService.update(req.body)
          res.status(201).end()
        } catch (err) {
          console.log('Error: CategoryController.updateCategory(): ', err)
          res.status(500).end()
        }
      }
    })
  }

  static async deleteCategory(req, res, next) {
    try {
      const category = await CategoryService.findById(req.params.id)
      const imageName = category.getDataValue('image')
      await category.destroy()
      // remove image from file system
      await fs.unlink(path.join(process.cwd(), '/src/', `${categoryPhotoPath}/${imageName}`))
      res.status(200).end()
    } catch (err) {
      console.log('Error: CategoryController.deleteCategory(): ', err)
      res.status(500).end()
    }
  }
}

module.exports = CategoryController