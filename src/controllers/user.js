const jwt = require('jsonwebtoken')
const {UserService} = require('../services/')
const {User} = require('../models/')
const {profilePhotoPath ,secret} = require('../../config/app.config')

class UserController {

  static async verifyAuthenticationAndAuthorization(req, res, next) {
    const authHeader = req.header('authorization')
    const token = authHeader ? authHeader.split(' ')[1] : null
    try {
      let {sub} = await jwt.verify(token, secret)
      let user = await UserService.findById(sub)
      // only allow Role_Admin
      if (user.getDataValue('roles').toUpperCase() === 'ROLE_ADMIN') {
        next()
      } else {
        res.status(403).json({message: 'UNAUTHORIZED'})
      }
    } catch (err) {
      console.log(err)
      res.status(403).json({message: 'INVALID TOKEN'})
    }
  }


  static async register(req, res, next) {
    let user = await User.findOne({email: req.body.email})
    if (user) {
      return res.status(202).json({message: 'EMAIL ALREADY EXISTS!'})
    } else {
      try {
        user = await UserService.update(req.body)
        return res.status(201).end()
      } catch (err) {
        console.log(err)
        return res.status(400).end()
      }
    }
  }

  static async login(req, res, next) {
    const user = await User.findOne({email: req.body.email})
    if (!user || !(await user.comparePassword(req.body.password))) {
      return res.status(202).json({message: 'Incorrect Login Details'})
     }
     const payload = {id: user.id, email: user.email}
     const options = {subject: user.id.toString(), expiresIn: '7d'}
     const token = await jwt.sign(payload, secret, options)
     res.setHeader('Authorization', 'Bearer ' + token)
     res.json({token, user})
  }

  static async getProfile(req, res, next) {
    try {
      const user = await UserService.findById(req.params.id)
      // concat the full photo path
      user.image = user.image && profilePhotoPath + user.image
      res.json(user)
    } catch (err) {
      console.log('Error: UserController.getProfile(): ', err)
      res.status(403).end()
    }
  }

  static async getProfiles(req, res, next) {
    try {
      const users = await UserService.findAll()
      // concat full photo path to all users
      users.forEach(u => u.image = u.image && profilePhotoPath + u.image)
      res.json(users)
    } catch (err) {
      console.log('Error: UserController.getProfiles(): ', err)
      res.status(403).end()
    }
  }

  static async updateProfile(req, res, next) {
    try {
      req.body.id = req.params.id
      const updated = await UserService.update(req.body)
      res.json(updated)
    } catch (err) {
      console.log('Error: UserController.updateProfile(): ', err)
      res.status(403).end()
    }
  }

  static async changeProfileImage(req, res, next) {
    try {
      req.body.id = req.params.id
      req.body.image = req.file.filename
      await UserService.update(req.body)
      res.json({image: profilePhotoPath + req.file.filename})
    } catch (err) {
      console.log('Error: UserController.changeProfileImage(): ', err)
      res.status(403).end()
    }
  }

  static async changePassword(req, res, next) {
    try {
      const id = req.params.id
      const {done} = await UserService.changePassword(id, req.body.oldPassword, req.body.newPassword)
      if (!done) { // passwords don't match
        return res.status(202).json({message: 'Incorrect Credential'}) 
      }
      res.status(200).end()
    } catch (err) {
      console.log('Error: UserController.changePassword(): ', err)
      res.status(403).end()
    }
  }

  static async deleteProfile(req, res, next) {
    try {
      const id = await UserService.delete(id)
      res.json(id)
    } catch (err) {
      console.log('Error: UserController.deleteProfile(): ', err)
      res.status(400).end()
    }
  }
}

module.exports = UserController