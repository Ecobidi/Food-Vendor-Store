const {Customer} = require('../models/')

class CustomerService {
  
  static async findById(id) {
    return await Customer.findByPk(id, {attributes: {exclude: ['password']}})
  }

  // static async findAll(condition = {}) { // condition defaults to {}
  //   condition = {limit: 15, offset: 0, ...condition, attributes: {exclude: ['password']}}
  //   return await Customer.findAll(condition)
  // }

  // static async save(data) {
  //   return await Customer.create(data)
  // }

  static async update(data) {
    return await Customer.upsert(data)
  }

  static async changePassword(id, oldPassword, newPassword) {
    let customer = await Customer.findByPk(id, {attributes: ['id', 'password']})
    console.log(customer)
    if (await customer.comparePassword(oldPassword)) {
      customer = await customer.updatePassword(newPassword)
      return {done: true, customer}
    } else {
      return {done: false, customer: null}
    }
  }

  static async delete(id) {
    return await Customer.destroy({where: {id}})
  }
}

module.exports = CustomerService