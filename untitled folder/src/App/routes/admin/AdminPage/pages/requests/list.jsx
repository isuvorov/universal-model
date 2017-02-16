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
    this.state = {
      requests: null,
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
    const [ requests, stats ] = await Promise.all(
      [
        this.api.getRequests({
          populate: 'from to',
        }),
        this.api.get('/requests/stats'),
      ]
    )
    return { requests, ...stats }
  }
  async updateData() {
    const data = await this.getData()
    if (typeof data === 'object') {
      this.setState(data)
    }
  }
  @autobind
  formatDataFrom(cell, row) {
    if (row && row.from && row.from.name) {
      return row.from.name
    }
    return null
  }
  @autobind
  formatDataTo(cell, row) {
    if (row && row.to && row.to.name) {
      return row.to.name
    }
    return null
  }
  @autobind
  handleRemoveRequest(request) {
    return () => {
      let from = ''
      if (request.from && request.from.name) {
        from = request.from.name
      }
      let to = ''
      if (request.to && request.to.name) {
        to = request.to.name
      }
      if (confirm(`Вы действительно хотите удалить личную встречу между пользователями ${from} и ${to}?`)) {
        return this.api.removeRequest(request.id)
      } else {
        return null
      }
    }
  }
  @autobind
  controlButtons(cell, row) {
    return <div>
      <Link className='btn btn-warning' href={`/admin/requests/${row.id}`}>
        <i className='fa fa-pencil-square-o' />
      </Link>
      <Button className='btn btn-danger' onClick={
        this.handleRemoveRequest(row)
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
        <div>
          <If condition={this.state.requests}>
            <BootstrapTable data={this.state.requests} search pagination>
              <TableHeaderColumn dataField='id'
                dataSort
                isKey
                hidden
                >ID
              </TableHeaderColumn>
              <TableHeaderColumn
                dataSort
                filterFormatted
                dataField='from'
                filter={ { type: 'RegexFilter', delay: 1000 } }
                dataFormat={this.formatDataFrom}
                >От пользователя
              </TableHeaderColumn>
              <TableHeaderColumn
                dataSort
                filterFormatted
                dataField='to'
                filter={ { type: 'RegexFilter', delay: 1000 } }
                dataFormat={this.formatDataTo}
              >К пользователю
              </TableHeaderColumn>
              <TableHeaderColumn
                dataSort
                dataField='startDate'
                filter={ { type: 'RegexFilter', delay: 1000 } }
              >Время встречи</TableHeaderColumn>
              <TableHeaderColumn
                dataSort
                dataField='help'
                filter={ { type: 'RegexFilter', delay: 1000 } }
              >Тип встречи
              </TableHeaderColumn>
              {/* <TableHeaderColumn
                dataField='isOnline'
                filter={ { type: 'RegexFilter', delay: 1000 } }
                dataFormat={this.formatDataIsDeleted}
              >
              </TableHeaderColumn> */}
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
