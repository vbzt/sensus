const express = require('express')
const exphbs = require('express-handlebars')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const flash = require('express-flash')

const app = express() 

const conn = require('./db/conn')

const Post = require('./models/Post')
const User = require('./models/Post')

const postRoutes = require('./routes/postRoutes')
const authRoutes = require('./routes/authRoutes')

const PostController = require('./controllers/PostController')
const AuthController = require('./controllers/AuthController')
app.engine('handlebars', exphbs.engine())
app.set('view engine', 'handlebars')

app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.use(
  session({
    name: 'session',
    secret: 'sensus_secret',
    resave: false,
    saveUninitialized: false,
    store: new FileStore({
      logFn: function() {},
      path: require('path').join(require('os').tmpdir(), 'sessions'),
    }),
    cookie: {
      secure: false,
      maxAge: 360000,
      expires: new Date(Date.now() + 360000),
      httpOnly: true
    }
}))

// flash  
app.use(flash())

app.use(express.static('public'))
app.use((req, res, next) => {
  if(req.session.userid){
    res.locals.session = req.session
  }
  
  next()
})

// Routes
app.use('/', postRoutes)
app.use('/posts', postRoutes)
app.use('/', authRoutes)

app.get('/', PostController.showPosts)

conn
.sync()
//.sync({force: true})
.then(() => {
  app.listen(3002, () => console.log('>> server on'))
})
.catch((err) => console.log('>> db err: ' + err))