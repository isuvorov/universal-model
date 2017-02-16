import React, { Component } from 'react'
import A from 'lsk-general/blocks/General/A'
export default class AdminPanel extends Component { //eslint-disable-line
  render() {
    return (
      <div>
        <div>Hello World!</div>
        <A href='test2' styles={{}}>Test2</A>
      </div>
    );
  }
}
