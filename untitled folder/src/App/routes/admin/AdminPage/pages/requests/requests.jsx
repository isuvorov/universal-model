import React, { Component } from 'react'
import Api from '~/App/components/AdminPanel/api'
import StatTile from '~/App/components/AdminPanel/StatTile'
export default class ProfilesPage extends Component {
  constructor() {
    super()
    this.api = new Api({
      path: '/api/v2/admin',
    })
    this.state = {
      requests_all: 0,
      requests_today: 0,
      requests_week: 0,
      requests_month: 0,
    }
  }
  componentDidMount() {
    this.updateData()
  }
  async getData() {
    return this.api.get('/requests')
  }
  async updateData() {
    const data = await this.getData()
    console.log(data)
    if (typeof data === 'object') {
      this.setState(data)
    }
  }
  render() {
    return (
      <div>
        <section className='content-header' style={
          { 'marginBottom': '20px'}
        }>
          <h1>Встречи</h1>
        </section>
        <StatTile
          width='3'
          theme='bg-blue'
          icon='fa fa-handshake-o'
          subject='Всего'
          stats={this.state.requests_all}
        />
        <StatTile
          width='3'
          theme='bg-green'
          icon='fa fa-handshake-o'
          subject='Сегодня'
          stats={this.state.requests_today}
        />
        <StatTile
          width='3'
          theme='bg-yellow'
          icon='fa fa-handshake-o'
          subject='За неделю'
          stats={this.state.requests_week}
        />
        <StatTile
          width='3'
          theme='bg-red'
          icon='fa fa-handshake-o'
          subject='За месяц'
          stats={this.state.requests_month}
        />
      </div>
    )
  }
}
