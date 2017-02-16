import React, { Component } from 'react'
// import { autobind } from 'core-decorators'
import { inject, observer } from 'mobx-react'
// import { Grid, Row, Col } from 'react-bootstrap';
// import Preloader from '../../components/Preloader'
// import Card from '../../components/Card'
import { AdminLTE, Header, Sidebar } from 'react-adminlte-dash'
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import AdminPage from './AdminPage';
import HelloWorld from './1';
import HelloWorld2 from './2';

import './AdminPanel.global.css'
let mainPath = '/admin';
export default class AdminPanel extends Component { //eslint-disable-line
  constructor(props) {
    super(props);
    this.state = {
      sidebarCollapse: false,
      sidebarMini: true,
    };
    this._sidebarToggle = this.sidebarToggle.bind(this);
  }
  sidebarToggle() {
    this.setState({
      sidebarCollapse: !this.state.sidebarCollapse,
    });
  }
  render() {
    return (
      <AdminPage>
        {/* <A href='asdasd/asdasd'>Test2</A> */}
        <HelloWorld />
      </AdminPage>
    )
  }
}
