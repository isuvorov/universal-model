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
      events_all: 0,
      events_today: 0,
      events_week: 0,
      events_month: 0,
    }
  }
  componentDidMount() {
    this.updateData()
  }
  async getData() {
    const [ events, stats ] = await Promise.all(
      [
        this.api.getEvents({
          populate: 'owner',
        }),
        this.api.get('/events/stats'),
      ]
    )
    return { events, ...stats }
  }
  async updateData() {
    const data = await this.getData()
    if (typeof data === 'object') {
      this.setState(data)
    }
  }
  @autobind
  formatDataOwner(cell, row) {
    if (row && row.from && row.from.name) {
      return row.from.name
    }
    return null
  }
  @autobind
  handleRemoveEvent(event) {
    return () => {
      if (confirm(`Вы действительно хотите удалить групповую встречу "${event.title}"?`)) {
        return this.api.removeEvent(event.id)
      } else {
        return null
      }
    }
  }
  formatDataCountParticipants(cell, row) {
    if (row && Array.isArray(row.participants)) {
      return row.participants.length
    }
    return 0
  }
  @autobind
  controlButtons(cell, row) {
    return <div>
      <Link className='btn btn-warning' href={`/admin/events/${row.id}`}>
        <i className='fa fa-pencil-square-o' />
      </Link>
      <Button className='btn btn-danger' onClick={
        this.handleRemoveEvent(row)
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
          <h1>Групповые встречи</h1>
        </section>
        <StatTile
          width='3'
          theme='bg-blue'
          icon='fa fa-users'
          subject='Всего'
          stats={this.state.events_all}
        />
        <StatTile
          width='3'
          theme='bg-green'
          icon='fa fa-users'
          subject='Cегодня'
          stats={this.state.events_today}
        />
        <StatTile
          width='3'
          theme='bg-yellow'
          icon='fa fa-users'
          subject='На этой неделе'
          stats={this.state.events_week}
        />
        <StatTile
          width='3'
          theme='bg-red'
          icon='fa fa-users'
          subject='В этом месяце'
          stats={this.state.events_month}
        />
        <div>
          <If condition={this.state.events}>
            <BootstrapTable data={this.state.events} search pagination>
              <TableHeaderColumn dataField='id'
                isKey
                hidden
                >ID
              </TableHeaderColumn>
              <TableHeaderColumn
                dataSort
                dataField='language'
                filter={ { type: 'RegexFilter', delay: 1000 } }
                >Язык
              </TableHeaderColumn>
              <TableHeaderColumn
                dataSort
                dataField='title'
                filter={ { type: 'RegexFilter', delay: 1000 } }
              >Название
              </TableHeaderColumn>
              <TableHeaderColumn
                dataSort
                dataField='startDate'
                filter={ { type: 'RegexFilter', delay: 1000 } }
              >Время встречи</TableHeaderColumn>
              <TableHeaderColumn
                dataSort
                filterFormatted
                dataField='participants'
                filter={{
                  type: 'NumberFilter',
                  delay: 1000,
                  numberComparators: [ '=', '>', '<=' ]
                }}
                dataFormat={this.formatDataCountParticipants}
              >Количество участников
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
