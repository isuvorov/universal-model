import React, { Component, PropTypes } from 'react'
import CountUp from 'react-countup'
import { isNumeric } from 'validator'
export default class StatTile extends Component {
  // static propTypes = {
  //
  // }
  isNumber(number) {
    return typeof number === 'number' || isNumeric(number)
  }
  render() {
    return (
      <div className={'col-lg-' + this.props.width + ' col-xs-6'}>
        <div className={'small-box ' + this.props.theme}>
          <div className='inner'>
            <h3>
              <CountUp duration={1} start={0} end={this.props.stats} />
            </h3>
            <p>{this.props.subject}</p>
          </div>
          <div className='icon'>
            <i className={this.props.icon}></i>
          </div>
          <If condition={this.props.link}>
            <a href={this.props.link} className='small-box-footer'>
              <i className='fa fa-arrow-circle-right'></i>
            </a>
          </If>
        </div>
      </div>
    )
  }
}
