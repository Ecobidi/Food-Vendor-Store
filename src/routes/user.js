const fsExistsSync = require('fs').existsSync
const fs = require('fs').promises
const path = require('path')
const router = require('express').Router()
const multer = require('multer')
const {CategoryController, ProductController, UserController} = require('../controllers/index')
const {UserService} = require('../services/index')

const productImagePathMiddleware = async (req, res, next) => {
  const productImagePath = '/src/uploads/products'
  const absoluteProductImagePath = path.join(process.cwd(), productImagePath)
  let subDirectories = await fs.readdir(absoluteProductImagePath)
  let size = subDirectories.length
  if (size > 0) {
    let lastDir = subDirectories[size - 1]
    let lastDirLength = (await fs.readdir(path.join(absoluteProductImagePath, lastDir))).length
    if (lastDirLength >= 250) { // not more than 250 files per directory
      // subDirectories are expected to be numerically named
      // productImageDestination should start from the next number
      req.productImageDestination = producImagePath + (parseInt(lastDir) + 1)
    } else {
      req.productImageDestination = productImagePath + '/' + lastDir
    }
  } else { // start sub-directories from 1
    req.productImageDestination= productImagePath + '/1'
  }
  // create the directory in the file system
  if (! fsExistsSync(path.join(process.cwd(), req.productImageDestination))) {
    await fs.mkdir(path.join(process.cwd(), req.productImageDestination))
  }
  next()
}

const profileImageDiskStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    cb(null, path.join(process.cwd(), '/src/uploads/profiles/'))
  }, // TODO: devise a suitable strategy for naming the files
  filename: (req, file, cb) => {
    // TODO: name the profile photo according to the user ID
    cb(null, req.params.id + path.extname(file.originalname) )
  }
})

const profileImageUploadFilter = async (req, file, cb) => {
  try {
    let user = await UserService.getInstance().findById(req.params.id)
    if (!user) { // user doesn't exist
      cb(new Error('User does not exist!')) // reject request
    } else {
      const acceptPattern = /.(jpeg|jpg|png)$/i  
      const isAcceptable = acceptPattern.test(file.originalname) && acceptPattern.test(file.mimetype)
      if (isAcceptable) cb(null, true) // accept image
      else cb(null, false) // reject image
    }
  } catch (err) {
    console.log('Error: profileImageUploadFilter ', err)
    cb(new Error('An Error Occurred'))
  }
}

const uploadProfileImage = multer({
  // dest: path.join(process.cwd(), '/src/uploads/profile'),
  storage: profileImageDiskStorage,
  limits: {fileSize: 1024 * 1024 * 0.5},
  fileFilter: profileImageUploadFilter
})

router.post('/login', UserController.login)

router.post('/register', UserController.register)

// protect below endpoints
router.use(UserController.verifyAuthenticationAndAuthorization)

router.get('/profiles/:id', UserController.getProfile)

router.post('/profiles/:id', UserController.updateProfile)

router.post('/profiles/:id/changePhoto', uploadProfileImage.single('image'), UserController.changeProfileImage)

router.post('/profiles/:id/changePassword', UserController.changePassword)

router.delete('/profiles/:id/delete', UserController.deleteProfile)

router.get('/profiles', UserController.getProfiles)

router.get('/categories', CategoryController.getCategories)

router.post('/categories', CategoryController.createCategory)

router.post('/categories/:id', CategoryController.updateCategory)

router.delete('/categories/:id/delete', CategoryController.deleteCategory)

router.get('/products', ProductController.getProducts)

router.post('/products', productImagePathMiddleware,  ProductController.createProduct)

// router.post('/products/:id', ProductController.updateProduct)

router.delete('/products/:id/delete', ProductController.deleteProduct)


module.exports = router