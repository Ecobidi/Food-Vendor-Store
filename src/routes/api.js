const {CategoryController, ProductController} = require('../controllers/index')
const router = require('express').Router()

router.get('/products', ProductController.getProducts)

router.get('/products/:productID', ProductController.getProduct)

router.get('/products-by-category', ProductController.getProductsByCategories)

router.get('/categories', CategoryController.getCategories)

module.exports = router