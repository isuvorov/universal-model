# universal-model  [![npm version](https://badge.fury.io/js/universal-model.svg)](http://badge.fury.io/js/universal-model)
Write models and generate mongoose schemas and client-side on-rest models

# It's just a concept yet
Inspired by
* https://florianholzapfel.github.io/express-restify-mongoose/

## Why ?

* Модели монгуса не наследуемы
* По моделям монгуса сложно сторить JSON схемы
* Контроллеры постоянно получаются однотипными
* Фронт постоянно получается однотипным
* Потому что на фронте, чтото все равно нужно будет подключать для превалидации моделей
* Это чтото должно поддерживать асинхронные клиент-серверные валидаторы (например для проверки занят ли юзернейм)
* Когда получили данные с сервера аякс запросом работать как с моделью, а не как с куском JSON'a

## Мысли



## How to use

### Use like mongoose schema:


#### Write schema in models/User.js
`models/User.server.js`
```js
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
```


#### Working with model on server
`models/User.server.js`
```js
// Mongoose
// user.server.js
import mongoose from 'mongoose'
import User from '/models/User'

mongoose.connection(...)
/// etc

const MongooseUser = mongoose.model('User', User.getMongooseSchema())
// or
const MongooseUser = User.getMongooseModel(mongoose)

MongooseUser.findOne({
  username: 'isuvorov'
})
.then(user => {
  console.log(user);
})
export default MongooseUser
```

#### Make restful routes easy
```js
// Express restful route
import { restful } from 'universal-model'
import MongooseUser from '/models/MongooseUser'

const restfulRoute = restful(MongooseUser)
app.use('/api/user', restfulRoute)
// or
app.use('/api/user', restful(MongooseUser))
```

Its makes routes:
```
GET /api/user
GET /api/user/:id
POST /api/user
PUT /api/user/:id
DELETE /api/user/:id
```

#### Work on client-side

`models/User.client.js`
```js
import User from 'models/User'
const ClientUser = User.getClientModel({
  base: '/api/user'
})
export default ClientUser
```


`UserPage.jsx`
```js
import ClientUser from 'models/User.client.js'
ClientUser.findOne({
  username: 'isuvorov'
})
.then(user => {
  console.log(user);
})
```


# Мысли по universal-model
```js
class Request {

  isCollection = true;
  criteria = {};
  skip = 0;
  limit = 20;
  select = null;

  async fetch() {
    await fetch(this._base, {method: 'POST', body: this.getOptions()})

    if () {
      return res
    } else {
      return res[0]
    }
  }
  
  applyOptions() {
    
  }
  
  skip(skip) {
    this.skip = skip;
    return this;
  }
  
  find(criteria, options) {
    this.isCollection = true;
    this.criteria = criteria;
    this.applyOptions(options)
    return this;
  }
  
  findOne(criteria) {
    this.isCollection = false;
    this.criteria = criteria;
    this.applyOptions(options)
    return this;
    
  }
  findById(id) {
    return this.findOne({_id: id})
  }

}


// UM => 
// schema mongoose + как общаться
// static
// __v: 1 
class User exte{
  static _base = '/api/universal-model';
  static _model = '/api/user';


  firstname = 'isuvorov' 
  firstname = 'isuvorov' 

  
  constructor() {
    
    
  }
  save() {
    if ()
    return (new Request({
      _base: this._base,
      _model: this._model,
      _isNew: true,
    }))
    
  }
  static prepare() {
    return new Request({
      _base: this._base,
      _model: this._model,
    })
  }

  
  static findOne(...args) {
    return (new Request({
      _base: this._base,
      _model: this._model,
    })).findOne(...args)
  }


  
}

User.findOne({
  username: 'isuvorov',
})


const user = new User()
user.ignoreIfCollision().save(); // {ignore: 1}
user.acceptFriend({asd: 12312}) // async method
user.asdasd = 123123
user.save()
```


