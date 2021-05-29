const {Category} = require('../models/')

class CategoryService {
  static async create(data) {
    return await Category.create(data)
  }

  static async findByName(name) {
    return await Category.findOne({where: {name}})
  }

  static async findById(id) {
    return await Category.findByPk(id)
  }

  static async findAll({where, limit = 10, offset = 0}) {
    return await Category.findAll({where, limit, offset, order: [['name', 'ASC']]})
  }

  static async countAll() {
    return await Category.count({})
  }

  static async delete(id) {
    return await Category.destroy({where: {id}})
  }

  static async update(data) {
    return await Category.update(data, {where: {id: data.id}})
  }
}

module.exports = CategoryService