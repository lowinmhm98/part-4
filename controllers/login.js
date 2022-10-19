const jwt = require('jsonwebtoken')

const bcrypt = require('bcryptjs')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  console.log("i'm in")
  const { username, password } = request.body
  console.log(request.body)
  const user = await User.findOne({ username })
  console.log(user)
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }
 console.log(process.env.SECRET)
  const token = jwt.sign(
    userForToken, 
   process.env.SECRET,
    { expiresIn: 60*60 }
  )

  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter