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
    this.state = {
      requestId: props.requestId,
      request: null,
    }
  }
  getRequest() {
    return this.api.getRequest(this.state.requestId)
    .then(request => {
      console.log(request)
      this.setState({ request })
    })
  }
  @autobind
  updateRequest() {
    console.log(this.refs.form.getData(), 1111)
    return this.api
    .updateRequest(this.state.requestId, this.refs.form.getData())
    .then(res => {
      if (!res.code || res.code === 200) {
        alert('Сохранено!')
      } else {
        alert(res.message)
      }
    })
  }
  componentDidMount() {
    this.getRequest()
  }
  render() {
    const { request } = this.state
    return (
      <div>
        <If condition={this.state.request}>
          <Form
            ref='form'
            submitButton={
              <Button type='submit' bsStyle='success'>
                Изменить
              </Button>
            }
            onSubmit={this.updateRequest}
            data={request}
            fields={[
              {
                name: 'from',
                title: 'from',
                control: {
                  placeholder: 'ID ползователя, от которого идет запрос о встрече',
                },
              },
              {
                name: 'to',
                title: 'to',
                control: {
                  placeholder: 'ID ползователя, к которому идет запрос о встрече',
                },
              },
              {
                name: 'help',
                title: 'Тип запросы',
                control: {
                  placeholder: 'help_me/help_you',
                },
              },
              {
                name: 'sender',
                title: 'sender',
                control: {
                  placeholder: 'ID пользователя, который изначально послал запрос',
                },
              },
              {
                name: 'reviewer',
                title: 'reviewer',
                control: {
                  placeholder: 'ID пользователя, который в данный момент должен ответить',
                },
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
