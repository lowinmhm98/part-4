const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
  .find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
 

  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }

})
const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

blogsRouter.post('/',middleware.userExtractor, async (request, response) => {
  
  const body = request.body
  /*
  const token = getTokenFrom(request)
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  */
  const user = request.user
  
  const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user._id
  })

     
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
  
})

blogsRouter.delete('/:id',middleware.userExtractor, async (request, response) => {
  
 const blog= await Blog.findById(request.params.id)
 if ( blog.user.toString() === request.user.id.toString() ) {
  blog.delete()
  response.status(204).end()
 } else {
  return response.status(401).json({ error: 'You didnt create the blog' })

 }

  
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes
  }

  const updatedblog= await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.status(200).json(updatedblog);
})

module.exports = blogsRouter