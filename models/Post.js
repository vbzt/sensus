const { DataTypes } = require('sequelize')

const db = require('../db/conn')

const User = require('./User')

const Post = db.define('Post', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    require: true
  }
})

Post.belongsTo(User)
User.hasMany(Post)

module.exports = Post