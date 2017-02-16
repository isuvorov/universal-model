import React, { Component } from 'react'
import StatTile from '~/App/components/AdminPanel/StatTile'
import Api from '~/App/components/AdminPanel/api'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
import { autobind } from 'core-decorators'
import Link from 'lsk-general/General/Link'
import { Button } from 'react-bootstrap'
import { inject, observer } from 'mobx-react'

export default class Login extends Component {
  constructor(props) {
    super()
    this.auth = props.auth
    this.history = props.history
    console.log(this.auth)
  }
  componentDidMount() {
    console.log(this)
    this.requestAuth()
  }
  async requestAuth() {
    const login = prompt('Ввелите логин: ', '')
    const password = prompt('Ввелите пароль: ', '')
    let res = {}
    try {
      res = await this.auth.login({
        login,
        password,
      })
      alert('Ура! Вы залогинились!')
      this.history.push('/admin')
    } catch (e) {
      console.log(e)
      const date1 = new Date().getTime()
      alert('Неправильный логин или пароль!')
      const date2 = new Date().getTime()
      if (date2 - date1 < 10) {
        return console.log('alert is disable')
      }
      return this.requestAuth()
    }
  }
  render() {
    return (
      <div>
      </div>
    )
  }
}
