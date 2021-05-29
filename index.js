const path = require('path')
const express = require('express')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const adminRoutes = require('./src/routes/user')
const apiRoutes = require('./src/routes/api')
const customerRoutes = require('./src/routes/customer')

const {profilePhotoPath ,secret} = require('./config/app.config')

// initialize models
require('./src/models/index')

const CustomerService = require('./src/services/customer')
const UserService = require('./src/services/user')

const PORT = process.env.PORT || 8080
const app = express()

// TODO: work on a better solution to the below
app.use((req, res, next) => {
  console.log('path = %s  method = %s', req.path, req.method)
  res.header('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

// passport middleware
app.use(passport.initialize())

// passport config
require('./config/passport.config')(passport)

app.use(express.static(path.join(__dirname, '/src/client/build')))

app.use(express.static(path.join(__dirname, '/src')))

// body-parse middleware
app.use(express.urlencoded({extended: true}))
app.use(express.json())

// TODO: change the path of the client react app to build

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/src/client/build/index.html'))
})

app.use('/verifyToken', async (req, res) => {
  const authHeader = req.header('authorization')
  const token = authHeader ? authHeader.split(' ')[1] : null
  try {
    const subject = await jwt.verify(token, secret)
    const user = await UserService.findById(subject.sub)
    // concat the full photo path
    user.image = user.image && profilePhotoPath + user.image
    res.json({user})
  } catch (err) {
    console.log('Error at verifyToken(): ' + err.message)
    res.status(202).json({message: 'INVALID TOKEN'})
  }
})

app.use('/customers/verifyToken', async (req, res) => {
  const authHeader = req.header('authorization')
  const token = authHeader ? authHeader.split(' ')[1] : null
  try {
    const subject = await jwt.verify(token, secret)
    const user = await CustomerService.findById(subject.sub)
    res.json({user})
  } catch (err) {
    console.log('Error at verifyToken(): ' + err.message)
    res.status(202).json({message: 'INVALID TOKEN'})
  }
})

app.use('/admin', adminRoutes)

app.use('/api', apiRoutes)

app.use('/customers', customerRoutes)

app.listen(PORT, () => console.log('Food Vendor Store Server Running On Port: %s', PORT))