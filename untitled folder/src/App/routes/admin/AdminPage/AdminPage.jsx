import { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { autobind } from 'core-decorators'
import AdminPanel from '../../../components/AdminPanel'

export default class LoginPage extends Component {
  render() {
    return (
      <If condition={typeof window !== 'undefined'}>
        <AdminPanel>
          {this.props.children}
        </AdminPanel>
      </If>
    );
  }
}
