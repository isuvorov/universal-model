import React, { Component } from 'react'
import StatTile from '~/App/components/AdminPanel/StatTile'
import Api from '~/App/components/AdminPanel/api'
import Form from 'lsk-general/General/Form'
import { Button } from 'react-bootstrap'
import { autobind } from 'core-decorators'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
export default class EventPage extends Component {
  constructor(props) {
    super()
    this.api = new Api({
      path: '/api/v2/admin',
    })
    this.state = {
      eventId: props.eventId,
      event: null,
    }
  }
  getEvent() {
    return this.api.getEvent(this.state.eventId)
    .then(event => {
      console.log(event)
      this.setState({ event })
    })
  }
  @autobind
  updateEvent() {
    console.log(this.refs.form.getData(), 1111)
    return this.api
    .updateEvent(this.state.eventId, this.refs.form.getData())
    .then(res => {
      if (!res.code || res.code === 200) {
        alert('Сохранено!')
      } else {
        alert(res.message)
      }
    })
  }
  componentDidMount() {
    this.getEvent()
  }
  render() {
    const { event } = this.state
    return (
      <div>
        <If condition={this.state.event}>
          <Form
            ref='form'
            submitButton={
              <Button type='submit' bsStyle='success'>
                Изменить
              </Button>
            }
            onSubmit={this.updateEvent}
            data={event}
            fields={[
              {
                name: 'title',
                title: 'Название',
              },
              {
                name: 'language',
                title: 'Язык',
              },
              {
                name: 'description',
                title: 'Описание',
              },
              {
                name: 'owner',
                title: 'ID создателя встречи',
              },
              {
                name: 'coverImage',
                title: 'ссылка на картинку',
              },
              {
                name: 'startDate',
                title: 'Время встречи',
              },
              {
                name: 'status',
                title: 'Статус',
                control: {
                  placeholder: 'ACCEPTED/REJECTED/REVIEW',
                },
              },
              {
                name: 'place.id',
                title: 'ID места встречи',
              },
              {
                name: 'place.name',
                title: 'Название места встречи',
              },
              {
                name: 'place.address',
                title: 'Адрес места встречи',
              },
              {
                name: 'place.lat',
                title: 'Координата места встречи(lat)',
              },
              {
                name: 'place.lng',
                title: 'Координата места встречи(lng)',
              },
              {
                name: 'place.photo',
                title: 'Фото места встречи',
              },
            ]}
          />
        </If>
      </div>
    )
  }
}
