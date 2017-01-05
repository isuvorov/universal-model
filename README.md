# universal-model  [![npm version](https://badge.fury.io/js/universal-model.svg)](http://badge.fury.io/js/universal-model)
Write models and generate mongoose schemas and client-side on-rest models

# It's just a concept yet
Inspired by
* https://florianholzapfel.github.io/express-restify-mongoose/

## How to use

import { Schema } from 'universal-model'

const schema = new Schema({
  username: {
    type: String,
    required: true,
    index: { unique: true },
    tolowercase: true,
    trim: true,
  },
  password: {
    type: String,
  },
  name: {
    type: String,
  },
  role: {
    type: String,
  },
}, {
  collection: 'user',
  timestamps: true,
})

schema.statics.isValidEmail = function (email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email)
}
schema.statics.generatePassword = function (length = 10) {
  return Math.random().toString(36).substr(2, length)
}
schema.methods.toJSON = function () {
  return _.omit(this.toObject(), ['password'])
}

const SALT_WORK_FACTOR = 10
schema.pre('save', function (next) {
  if (!this.isModified('password')) return next()
  return bcryptGenSalt(SALT_WORK_FACTOR)
  .then(salt => {
    bcryptHash(this.password, salt)
    .then(hash => {
      this.password = hash
      next();
    })
  })
  .catch(next)
});

export default schema


/////
// Mongoose
// user.server.js
import schema from '/models/user'
const MongooseUser = mongoose.model('User', schema.getMongooseSchema())
MongooseUser.findOne({
  username: 'isuvorov'
})
.then(user => {
  console.log(user);
})
export MongooseUser

// Express restful route
import { restful } from 'universal-model'
const restfulRoute = restful(MongooseUser)
app.use('/api/user', restfulRoute)
// or
app.use('/api/user', restful(MongooseUser))

`GET /api/user`
`GET /api/user/:id`
`POST /api/user`
`PUT /api/user/:id`
`DELETE /api/user/:id`


//////////
///// On client
// user.client.js
import schema from '/models/user'
const ClientUser = schema.getClientModel({
  base: '/api/user'
})
export default ClientUser


// UsersPage
import ClientUser from 'user.client.js'
MongooseUser.findOne({
  username: 'isuvorov'
})
.then(user => {
  console.log(user);
})
