import React from 'react'
import A from 'lego-starter-kit/ReactApp/components/A'

export default (props) =>
  <li>
    <A href={props.href || props.to}>
      {props.icon || <i className='fa fa-circle-o' />}
      <span>{props.children || ''}</span>
    </A>
  </li>
