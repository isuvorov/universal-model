
export default function getDocs(ctx, params) {
    const paths = {
      "/user123": {
        "get": {
          "summary": "Позволяет получить список всех юзеров в системе\n",
          "tags": [
            "user"
          ],
          "responses": {
            "200": {
              "description": "Массив пользователей",
              "schema": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/User"
                }
              }
            }
          }
        },
      }
    }
    Object.assign(paths, require('./profiles.docs.js').default(ctx, params))
    // Object.assign(paths, require('./user.docs.js').default(ctx, params)),
    // Object.assign(paths, require('./user.docs.js').default(ctx, params)),

    return Object.assign({
      "swagger": "2.0",
      "info": {
        "title": "HiJay API",
        "description": "Move your app forward with the HiJay API",
        "version": "1.0.0"
      },
      // "host": "localhost:3000",
      "host": "hijay.mgbeta.ru",
      "schemes": ["https"],
      "basePath": "/api/v1",
      "produces": ["application/json"],
      paths: paths,
      definitions: {
        "User": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "description": "ID пользователя"
            },
            "username": {
              "type": "string",
              "description": "username"
            },
            "firstName": {
              "type": "string",
              "description": "firstName"
            },
            "lastName": {
              "type": "string",
              "description": "lastName"
            },
            "gender": {
              "type": "string",
              "description": "Пол пользователя. ['male', 'female']"
            },
            "email": {
              "type": "string",
              "description": "Email пользователя"
            },
            "about": {
              "type": "string",
              "description": "Описание пользователя"
            },
            "rating": {
              "type": "number"
            },
            "interestIds": {
              "type": "array",
              "description": "Массив ID инетересов пользователя",
              "items": {
                "$ref": "#/definitions/interestIds"
              }
            },
            "requestUserIds": {
              "type": "array",
              "description": "Массив ID пользователей, на которых подписан текущий пользователь",
              "items": {
                "$ref": "#/definitions/requestUserIds"
              }
            },
            "blockedUserIds": {
              "type": "array",
              "description": "Массив ID заблокировнных пользователей",
              "items": {
                "$ref": "#/definitions/blockedUserIds"
              }
            },
            "createdAt": {
              "type": "string",
              "format": "date",
              "description": "Дата создания"
            },
            "updatedAt": {
              "type": "string",
              "format": "date",
              "description": "Дата последнего изменения"
            }
          }
        },

      },
    }, params)
}
