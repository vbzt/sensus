const User = require('../models/User');
const { Op } = require('sequelize');


const bcrypt = require('bcryptjs')

class AuthController {
  static login(req, res) {
    res.render('auth/login')
  }

  static async loginPost(req, res){
    const {user, password} = req.body
    
    //find user 
      const foundUser = await User.findOne({where: {[Op.or]: [{ username: user }, { email: user }]}})
      if(!foundUser){
        req.flash('message', 'Incorrect email or password')
        res.render('auth/login', {error: true})
        return
      }

      //password matching
      const passwordMatch = await bcrypt.compare(password, foundUser.password)

      if(!passwordMatch){
        req.flash('message', 'Incorrect email or password')
        res.render('auth/login', {error: true})
      }

      req.session.userid = foundUser.id
      
      req.flash('message', 'Logged in successfully')
      req.session.save(() => {
        res.redirect('/')
      })

  
    
  }

  static register(req, res){ 
    res.render('auth/register')
  }

  static async registerPost(req, res){

    const {username, email, password, confirmPassword} = req.body

    // user verification
    if(username.length < 4){
      req.flash('message', "The username must contain at least 4 characters")
      res.render('auth/register', {userError: true})
      return
    }

    const checkExistingUser = await User.findOne({where: {username}})
    if(checkExistingUser){
      req.flash('message', "The current username is already in use")
      res.render('auth/register', {userError: true})
      return
    }

    const userRegex = /^[a-zA-Z0-9_]+$/
    if(!userRegex.test(username)){
      req.flash('message', "Username can only contain letters, numbers and '_'")
      res.render('auth/register', {userError: true})
      return
    }


    // email verification
    const checkExistingEmail = await User.findOne({where: {email}})
    if(checkExistingEmail){
      req.flash('message', "The current email is already in use")
      res.render('auth/register', {userError: true})
      return
    }
    
    // password validation
    if(password.length < 8){
      req.flash('message', "The password must contain at least 8 characters")
      res.render('auth/register', {passwordError: true})
      return
    }
    if(password != confirmPassword){
      console.log(password +'|'+ confirmPassword)
      req.flash('message', "The passwords don't match.")
      res.render('auth/register', {confirmError: true})
      return
    }

    // hashing and salting password

    const salt = await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash(password, salt)
    
    const user = {
      username,
      email,
      password: hashed
    }

    try{
      const createdUser = await User.create(user)

      // Initialize session
      req.session.userid = createdUser.id
      req.flash('message', "User registered succesfully")

      req.session.save(() => {
        res.redirect('/')
      })
    }catch(e){
      console.log(e)
    }
}
  static logout(req, res){
    req.session.destroy()
    res.redirect('/login')
  }

}

module.exports = AuthController;
