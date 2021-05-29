const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {CustomerService} = require('../services/')
const {Customer} = require('../models/')
const {secret} = require('../../config/app.config')

class CustomerController {

  static async verifyAuthenticationAndAuthorization(req, res, next) {
    const authHeader = req.header('authorization')
    const token = authHeader ? authHeader.split(' ')[1] : null
    try {
      let {sub} = await jwt.verify(token, secret)
      let customers = await CustomerService.findById(sub)
      // only allow verified customerss
      if (customers) {
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
    let customer = await Customer.findOne({email: req.body.email})
    if (customer) {
      return res.status(202).json({message: 'EMAIL ALREADY EXISTS!'})
    } else {
      try {
        let dao = req.body
        dao.password = await bcrypt.hashSync(dao.password)
        customer = await CustomerService.update(dao)
        return res.status(201).end()
      } catch (err) {
        console.log(err)
        return res.status(400).end()
      }
    }
  }

  static async login(req, res, next) {
    const customer = await Customer.findOne({email: req.body.email})
    if (!customer || !(await customer.comparePassword(req.body.password))) {
      return res.status(202).json({message: 'Incorrect Login Details'})
    }
    try {
      const payload = {id: customer.id, email: customer.email}
      const options = {subject: customer.id.toString(), expiresIn: '7d'}
      const token = await jwt.sign(payload, secret, options)
      res.setHeader('Authorization', 'Bearer ' + token)
      res.json({token, customer})
    } catch (err) {
      console.log(err)
      return res.status(400).end()
    }
  }

  static async getProfile(req, res, next) {
    try {
      const customer = await CustomerService.findById(req.params.id)
      res.json(customer)
    } catch (err) {
      console.log('Error: CustomerController.getProfile(): ', err)
      res.status(403).end()
    }
  }

  static async updateProfile(req, res, next) {
    try {
      req.body.id = req.params.id
      const updated = await CustomerService.update(req.body)
      res.json(updated)
    } catch (err) {
      console.log('Error: CustomerController.updateProfile(): ', err)
      res.status(403).end()
    }
  }

  static async changePassword(req, res, next) {
    try {
      const id = req.params.id
      const {done} = await CustomerService.changePassword(id, req.body.oldPassword, req.body.newPassword)
      if (!done) { // passwords don't match
        return res.status(202).json({message: 'Incorrect Credential'}) 
      }
      res.status(200).end()
    } catch (err) {
      console.log('Error: CustomerController.changePassword(): ', err)
      res.status(403).end()
    }
  }

  // static async deleteProfile(req, res, next) {
  //   try {
  //     const id = await CustomerService.delete(id)
  //     res.json(id)
  //   } catch (err) {
  //     console.log('Error: CustomerController.deleteProfile(): ', err)
  //     res.status(400).end()
  //   }
  // }
}

module.exports = CustomerController