const Post = require('../models/Post');
const User = require('../models/User');
const { Op } = require('sequelize')
const moment = require('moment');

class PostController {
  static async showPosts(req, res) {

    let search = ''

    if(req.query.search){
      search = req.query.search
    }

    let order = req.query.order === 'old' ? 'ASC' : 'DESC'
    const postsData = await Post.findAll({ 
      include: User,
      where: { title: { [Op.like]: `%${search}%`} },
      order: [['createdAt', order]]
     })
    
    const posts = postsData.map(result => {
      let post = result.get({ plain: true });
      post.createdAt = formatTimeAgo(post.createdAt);
      return post;
    });

    const postsQnt = posts.length
    const emptyPosts = postsQnt === 0

    res.render('posts/home', {posts, search, postsQnt, emptyPosts});
  }

  static async profile(req, res){ 
    const userid = req.session.userid

    const user = await User.findOne({where: {id: userid}, include: Post, plain: true})

    if(!user){ res.redirect('/login') }

    const userPosts = user.Posts.map((result) => result.dataValues)

    let emptyPosts = userPosts.length === 0;

    res.render('posts/profile', {posts: userPosts, emptyPosts})
  }

  static async createPost(req, res){
    res.render('posts/create')
  }

  static async registerPost(req, res){
    const post = {
      title: req.body.post,
      UserId: req.session.userid
    }

    if(post.title.length === 0){
      req.flash('message', " Can't share an empty post, right?")
      res.render('posts/create', {error: true})
      return
    }

    try{
      await Post.create(post)

      req.flash('message', 'Post registered succesfully')

      req.session.save(() => {
        res.redirect('/profile')
      })
    }catch(e){
      console.log(e)
    }
  }

  static async removePost(req, res) {
    const userId = req.session.userid;
    const postId = req.body.id;

    const user = await User.findOne({ where: {id: userId }, include: Post, plain: true });

    if(!user) {
        res.redirect('/login');
        return;
    }

    try {
        await Post.destroy({ where: { id: postId, UserId: userId } })
        req.session.save(() => {
          res.redirect('/profile')
        })
    } catch(err) {
        console.log(`>> remove post error: ${err}`);
    }
}

  static async editPost(req, res){
    const userId = req.session.userid
    const postId = req.params.id

    Post.findOne({ where: { id: postId }, raw: true })
    .then((post) => {
        const ownerId = post.UserId;
        if(userId !== ownerId) {
            res.redirect('/posts/dashboard');

            return;
        }
        res.render('posts/edit', { post })
    })
    .catch((err) => console.log(`>> edit error: ${err}`))
  }

  static async saveEdit(req, res) {
    const postId = req.body.id;

    const post = {
        title: req.body.post
    }

    Post.update(post, { where: { id: postId } })
        .then(() => {
            req.session.save(() => {
                res.redirect('/profile')
            })
        })
        .catch((err) => console.log(`>> update error: ${err}`));
}
}

function formatTimeAgo(createdAt) {
  const createdDate = moment(createdAt);
  const now = moment();
  
  const secs = now.diff(createdDate, 'seconds')
  const min = now.diff(createdDate, 'minutes');
  const hour = now.diff(createdDate, 'hours');
  const days = now.diff(createdDate, 'days');
 if(min == 0){
  return `${secs}s ago`;
 }
 if (min < 60) {
    return `${min} minutes ago`;
  } 
  if (hour < 24) {
    return `${hour} hours ago`;
  }else{
    return `${days} days ago`;
  }
}

module.exports = PostController;
