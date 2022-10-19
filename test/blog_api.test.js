const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const api = supertest(app)
const helper = require("./test_helper")



beforeEach(async () => {
  await Blog.deleteMany({})
  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
  
},100000)
describe('when there is initially some blogs saved', () => {
 
  test('Blogs are returned as json', async () => {

    await api
      .get('/api/Blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  }, 100000)


  test('all Blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  }, 100000)
})


test('all Blogs have id', async () => {
  const response = await api.get('/api/blogs')

  response.body.forEach((blog) => { expect(blog.id).toBeDefined() })
}, 100000)


describe('addition of a new blog', () => {
  test('a valid blog can be added', async () => {
    
    const userfirst = {username:"joe",password:"1234asd"}
    await api.post("/api/users").send(userfirst);
  const  loggeduser= await api.post("/api/login").send(userfirst)
    console.log(loggeduser);
    
 




     
      
   const newBlog = {
      title: 'async/await simplifies making async calls',
      author: "nonexistent",
      url: "bo",
      likes: 0
    }
  

    await api
      .post('/api/blogs')
      .set("Authorization", `bearer ${loggeduser._body.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.BlogsInDb()
    const contents = blogsAtEnd.map(r => { return ({ title: r.title, author: r.author, url: r.url, likes: r.likes }) })




    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    expect(contents).toContainEqual(
      {
        title: 'async/await simplifies making async calls',
        author: "nonexistent",
        url: "bo",
        likes: 0,


      }
    )

  }, 100000)

  test('blog without url  is not added', async () => {
    const userfirst = {username:"jeff",password:"1234asasd"}
    await api.post("/api/users").send(userfirst);
  const  loggeduser= await api.post("/api/login").send(userfirst)

     
     
    let newBlog = {
      title: "random",
      author: "unknown",
      likes: 0
    }

    await api
      .post('/api/blogs')
      .set("Authorization", `bearer ${loggeduser._body.token}`)
      .send(newBlog)
      .expect(400)

    let response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)

  }, 100000)

  test('blog without title is not added', async () => {
    const userfirst = {username:"claire",password:"12sad334asasd"}
    await api.post("/api/users").send(userfirst);
  const  loggeduser= await api.post("/api/login").send(userfirst)
    let newBlog = {
      url: "random",
      author: "unknown",
      likes: 0
    }

    await api
      .post('/api/blogs')
      .set("Authorization", `bearer ${loggeduser._body.token}`)
      .send(newBlog)
      .expect(400)

    let response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)

  }, 100000)


  test('blog without token is not added', async () => {
    
    let newBlog = {
      title:"dsfa",
      url: "randomw",
      author: "unknown",
      likes: 0
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)

    let response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)

  }, 100000)


  test('a blog without likes is added with 0 likes', async () => {
    const userfirst = {username:"maya",password:"12sad334asasd"}
    await api.post("/api/users").send(userfirst);
  const  loggeduser= await api.post("/api/login").send(userfirst)
    let newBlog = {
      url: "unique",
      author: "unique",
      title: "unique"

    }

    await api
      .post('/api/blogs')
      .set("Authorization", `bearer ${loggeduser._body.token}`)
      .send(newBlog)
      .expect(201)

    const blogsAtEnd = await helper.BlogsInDb()
    const contents = blogsAtEnd.map(r => { return ({ title: r.title, author: r.author, url: r.url, likes: r.likes }) })




    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    expect(contents).toContainEqual(
      {
        url: "unique",
        author: "unique",
        title: "unique",
        likes: 0,


      })

  })

})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const userfirst = {username:"johnny",password:"123fdsttt"}
    await api.post("/api/users").send(userfirst);
  const  loggeduser= await api.post("/api/login").send(userfirst)
  let newBlog = {
    url: "unique3",
    author: "unique21",
    title: "unique44",
    likes: 12

  }
  
  await api
      .post('/api/blogs')
      .set("Authorization", `bearer ${loggeduser._body.token}`)
      .send(newBlog)
      .expect(201)

    const blogsAtStart = await helper.BlogsInDb()
    const blogToDelete = blogsAtStart[blogsAtStart.length-1]
    console.log(blogToDelete);

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set("Authorization", `bearer ${loggeduser._body.token}`)
      .expect(204)

    const blogsAtEnd = await helper.BlogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length 
    )

    //const contents = blogsAtEnd.map(r => { return ({ title: r.title, author: r.author, url: r.url, likes: r.likes }) })

    expect(blogsAtEnd).not.toContainEqual(blogToDelete)
  })
})


describe('update  a blog', () => {
  test('succeeds with status code 200 if id is valid', async () => {
    
    const blogsAtStart = await helper.BlogsInDb()
    const blogToUpdate = {...blogsAtStart[0],likes:123}

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(200)

    const blogsAtEnd = await helper.BlogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length 
    )

   // const contents = blogsAtEnd.map(r => { return ({ title: r.title, author: r.author, url: r.url, likes: r.likes }) })

    expect(blogsAtEnd).toContainEqual(blogToUpdate)
  })
})




afterAll(() => {
  mongoose.connection.close()
})