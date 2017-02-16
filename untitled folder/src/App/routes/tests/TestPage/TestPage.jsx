import { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { autobind } from 'core-decorators';
import UniversalModel from '../../../XyuUniversalModel';

export default class TestPage extends Component {
  constructor() {
    super();
    this.model = new UniversalModel();
  }
  componentDidMount() {
    console.log('UniversalModel');
    return this.model.find()
    .then(res => console.log(res));
  }
  render() {
    return (
      <div>Test Page!</div>
    );
  }
}
