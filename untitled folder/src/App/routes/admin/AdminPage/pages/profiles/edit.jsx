import React, { Component } from 'react';
import StatTile from '~/App/components/AdminPanel/StatTile';
import Api from '~/App/components/AdminPanel/api';
import Form from 'lsk-general/General/Form';
import { Button } from 'react-bootstrap';
import { autobind } from 'core-decorators';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
export default class ProfilePage extends Component {
  constructor(props) {
    super();
    this.api = new Api({
      path: '/api/v2/admin',
    });
    this.state = {
      profileId: props.profileId,
      profile: null,
    };
  }
  componentDidMount() {
    this.getProfile();
  }
  getProfile() {
    return this.api.getProfile(this.state.profileId)
    .then((profile) => {
      console.log(profile);
      this.setState({ profile });
    });
  }
  @autobind
  updateProfile() {
    console.log(this.refs.form.getData(), 1111);
    return this.api
    .updateProfile(this.state.profileId, this.refs.form.getData())
    .then((res) => {
      if (!res.code || res.code === 200) {
        alert('Сохранено!');
      } else {
        alert(res.message);
      }
    });
  }
  render() {
    const { profile } = this.state;
    return (
      <div>
        <If condition={this.state.profile}>
          <Form
            ref="form"
            submitButton={
              <Button type="submit" bsStyle="success">
                Изменить
              </Button>
            }
            onSubmit={this.updateProfile}
            data={profile}
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
                name: 'loc[0]',
                title: 'Широта',
              },
              {
                name: 'loc[1]',
                title: 'Долгота',
              },
            ]}
          />
        </If>
      </div>
    );
  }
}
