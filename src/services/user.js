const {User} = require('../models/')

class UserService {
  
  static async findById(id) {
    return await User.findByPk(id, {attributes: {exclude: ['password']}})
  }

  static async findAll(condition = {}) { // condition defaults to {}
    condition = {limit: 15, offset: 0, ...condition, attributes: {exclude: ['password']}}
    return await User.findAll(condition)
  }

  // static async save(data) {
  //   return await User.create(data)
  // }

  static async update(data) {
    return await User.upsert(data)
  }

  static async changePassword(id, oldPassword, newPassword) {
    let user = await User.findByPk(id, {attributes: ['id', 'password']})
    console.log(user)
    if (await user.comparePassword(oldPassword)) {
      user = await user.updatePassword(newPassword)
      return {done: true, user}
    } else {
      return {done: false, user: null}
    }
  }

  static async delete(id) {
    return await User.destroy({where: {id}})
  }
}

module.exports = UserService