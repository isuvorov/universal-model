import React, { Component } from 'react';
import UniversalCounter from '../../../../../UniversalCounter';
import { autobind } from 'core-decorators';
export default class PetPage extends Component {

  constructor() {
    super();
    this.state = {
      counter: 0,
    };
  }

  componentDidMount() {
    this.update();
  }

  @autobind
  async increment() {
    const counter = await UniversalCounter.increment();
    this.setState({ counter });
  }

  @autobind
  async update() {
    const counter = await UniversalCounter.get();
    console.log(counter)
    this.setState({ counter });
  }

  render() {
    return (
      <div>
        Counter
        <button>
          {this.state.counter}
        </button>
        <button onClick={this.increment}>
          ++
        </button>
        <hr />
        <button onClick={this.update}>
          update
        </button>
      </div>
    );
  }
}
