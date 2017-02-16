import React, { Component } from 'react'
import StatTile from '~/App/components/AdminPanel/StatTile'
import Api from '~/App/components/AdminPanel/api'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
import { autobind } from 'core-decorators'
import Link from 'lsk-general/General/Link'
import { Button } from 'react-bootstrap'
export default class ProfilesPage extends Component {
  constructor() {
    super()
    this.api = new Api({
      path: '/api/v2/admin',
    })
    const tests = []
    for(let i = 0; i < 100; i++) {
      tests.push({ id: i })
    }
    this.state = {
      profiles: [],
      profiles_all: 0,
      profiles_today: 0,
      profiles_week: 0,
      profiles_month: 0,
      profiles_year: 0,
      profiles_online: 0,
      devices: {
        ios: 0,
        android: 0,
      },
      tests,
    }
  }
  componentDidMount() {
    this.updateData()
  }
  async getData() {
    return this.api.get('/profiles/stats')
  }
  async updateData() {
    const data = await this.getData()
    if (typeof data === 'object') {
      this.setState(data)
    }
  }
  @autobind
  handleRemoveProfile(profile) {
    return () => {
      if (confirm(`Вы действительно хотите удалить пользователя ${profile.name}`)) {
        return this.api.removeProfile(profile.id)
      } else {
        return null
      }
    }
  }
  formatDataIsOnline(cell, row) {
    if (row.isOnline) {
      return 'Да'
    }
    return 'Нет'
  }
  formatDataIsDeleted(cell, row) {
    if (row.deleted) {
      return 'Да'
    }
    return 'Нет'
  }
  @autobind
  controlButtons(cell, row) {
    return <div>
      <Link className='btn btn-warning' href={`/admin/profiles/${row.id}`}>
        <i className='fa fa-pencil-square-o' />
      </Link>
      <Button className='btn btn-danger' onClick={
        this.handleRemoveProfile(row)
      }>
        <i className='fa fa-times' />
      </Button>
    </div>
    return
  }
  render() {
    return (
      <div>
        <section className='content-header' style={
          { 'marginBottom': '20px'}
        }>
          <h1>Пользователи</h1>
        </section>
        <StatTile
          width='3'
          theme='bg-green'
          icon='fa fa-user-plus'
          subject='Сегодня'
          stats={this.state.profiles_today}
        />
        <StatTile
          width='3'
          theme='bg-yellow'
          icon='fa fa-user-plus'
          subject='За неделю'
          stats={this.state.profiles_week}
        />
        <StatTile
          width='3'
          theme='bg-yellow'
          icon='fa fa-user-plus'
          subject='За месяц'
          stats={this.state.profiles_month}
        />
        <StatTile
          width='3'
          theme='bg-yellow'
          icon='fa fa-user-plus'
          subject='За год'
          stats={this.state.profiles_year}
        />
        <StatTile
          width='3'
          theme='bg-blue'
          icon='fa fa-user-plus'
          subject='Всего'
          stats={this.state.profiles_all}
        />
        <StatTile
          width='3'
          theme='bg-red'
          icon='fa fa-user-plus'
          subject='Онлайн'
          stats={this.state.profiles_online}
        />
        <StatTile
          width='3'
          theme='bg-red'
          icon='fa fa-mobile'
          subject='IOS'
          stats={this.state.devices.ios}
        />
        <StatTile
          width='3'
          theme='bg-red'
          icon='fa fa-mobile'
          subject='Android'
          stats={this.state.devices.android}
        />
        <div>
          <If condition={this.state.profiles.length > 0}>
            <BootstrapTable data={this.state.profiles} search pagination>
              <TableHeaderColumn dataField='id'
                dataSort
                isKey
                filter={ { type: 'TextFilter', delay: 1000 } }
                hidden
                >ID</TableHeaderColumn>
              <TableHeaderColumn
                dataSort
                dataField='name'
                filter={ { type: 'RegexFilter', delay: 1000 } }
              >Имя
              </TableHeaderColumn>
              <TableHeaderColumn
                dataSort
                dataField='email'
                filter={ { type: 'RegexFilter', delay: 1000 } }
              >Email</TableHeaderColumn>
              <TableHeaderColumn
                dataSort
                dataField='isOnline'
                filter={ { type: 'RegexFilter', delay: 1000 } }
                dataFormat={this.formatDataIsOnline}
              >Онлайн
              </TableHeaderColumn>
              <TableHeaderColumn
                dataSort
                dataField='isOnline'
                filterFormatted
                dataField='participants'
                filter={ { type: 'RegexFilter', delay: 1000 } }
                dataFormat={this.formatDataIsDeleted}
              >Удален
              </TableHeaderColumn>
              <TableHeaderColumn
                dataFormat={this.controlButtons}
              >
              </TableHeaderColumn>
            </BootstrapTable>
          </If>
        </div>
      </div>
    )
  }
}
