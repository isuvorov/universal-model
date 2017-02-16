import React, { Component } from 'react'
import StatTile from '~/App/components/AdminPanel/StatTile'
import Api from '~/App/components/AdminPanel/api'
import Form from 'lsk-general/General/Form'
import { Button } from 'react-bootstrap'
import { autobind } from 'core-decorators'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
export default class ProfilePage extends Component {
  constructor(props) {
    super()
    this.api = new Api({
      path: '/api/v2/admin',
    })
  }
  @autobind
  createProfile() {
    console.log(this.refs.form.getData(), 1111)
    return this.api
    .createProfile(this.refs.form.getData())
    .then(res => {
      if (!res.code || res.code === 200) {
        alert('Профиль создан!')
      } else {
        alert(res.message)
      }
    })
  }
  render() {
    return (
      <div>
        <Form
          ref='form'
          submitButton={
            <Button type='submit' bsStyle='success'>
              Создать
            </Button>
          }
          onSubmit={this.createProfile}
          data={{}}
          fields={[
            {
              name: 'email',
              title: 'Email',
              control: {
                placeholder: 'Например, utkin@mail.ru',
                type: 'email',
              },
            },
            {
              name: 'firstName',
              title: 'Имя',
              control: {
                placeholder: 'Например, Игорь',
              },
            },
            {
              name: 'lastName',
              title: 'Фамилия',
              control: {
                placeholder: 'Например, Суворов',
              },
            },
            {
              name: 'avatar',
              title: 'Аватарка',
              control: {
                placeholder: '/static/default-avatar.png',
              },
            },
            {
              name: 'socialNetworkType',
              title: 'Тип соц.сети',
              control: {
                placeholder: 'vk/fb/local',
              },
            },
            {
              name: 'linkToSocialNetwork',
              title: 'ID в социальной сети',
            },
            {
              name: 'password',
              title: 'Пароль',
            },
            {
              name: 'description',
              title: 'Описание',
            },
            {
              name: 'nativeLanguage',
              title: 'Родной язык',
            },
            {
              name: 'learningLanguages',
              title: 'Список изучаемых языков',
            },
            {
              name: 'bdate',
              title: 'Дата рождения',
            },
            {
              name: 'city',
              title: 'Город',
            },
            {
              name: 'pubNub',
              title: 'pubNub',
            },
            {
              name: 'deleted',
              title: 'Аккаунт удален',
              control: {
                placeholder: 'true/false',
              },
            },
            {
              name: 'address',
              title: 'Адрес',
            },
            {
              name: 'lat',
              title: 'Широта',
            },
            {
              name: 'lng',
              title: 'Долгота',
            },
          ]}
        />
      </div>
    )
  }
}
