import React, { Component, PropTypes } from 'react'
import { AdminLTE, Header, Sidebar, SidebarMenuItem, HeaderLogo } from 'react-adminlte-dash'
import Link from 'lego-starter-kit/ReactApp/components/Link'
import A from 'lego-starter-kit/ReactApp/components/A'
import SidebarItem from './SidebarItem'
import './AdminPanel.global.css'
export default class AdminPanel extends Component { //eslint-disable-line
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string,
      PropTypes.array,
      PropTypes.number,
    ]),
  }
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
      <AdminLTE
        layout='fixed'
        sidebarCollapsed={this.state.sidebarCollapse}
        sidebarMini={this.state.sidebarMini}
        skin='blue'
      >
        <Header
          sidebarToggle={this._sidebarToggle}
          logo={<Header.Logo
            logoLg={<span><b>Hi</b>Jay</span>}
            logoSm={<span><b>H</b>J</span>}
          />
          }
        />
        {/* Left side column. contains the logo and sidebar */}
        <Sidebar>
          {/* sidebar menu: : style can be found in sidebar.less */}
          {/* Sidebar user panel */}
          <Sidebar.User
            userName='Admin'
            userStatus='online'
            userImageSrc='https://hijay.mgbeta.ru/storage/profile_583eca744b3c230011c25e53.png?timestamps=1484532358787'
          />

          {/* search form */}
          {/* <Sidebar.Search
            onSearch={value => (alert(`Searching for: ${value}`))}
          /> */}

          <Sidebar.Menu title='Навигация'>

            {/* <Sidebar.Menu.Item
              mainIcon='fa-dashboard'
              title='Dashboard'
            >
              <Sidebar.Menu.Item
                link='#'
                title='Dashboard v1'
              />
              <Sidebar.Menu.Item
                active
                link='#'
                title='Dashboard v2'
              />
            </Sidebar.Menu.Item>

            <Sidebar.Menu.Item
              labelText='4'
              labelType='primary'
              mainIcon='fa-files-o'
              title='Layout Options'
            >
              <Sidebar.Menu.Item
                link='#'
                title='Top Navigation'
              />
              <Sidebar.Menu.Item
                link='#'
                title='Boxed'
              />
              {/*
              <Sidebar.Menu.Item
                link='#'
                title='Collapsed Sidebar'
              />
            </Sidebar.Menu.Item> */}
            <SidebarItem
              href='/admin/profiles'
              icon={<i className='fa fa-circle-o' />}
            >
              Пользователи
            </SidebarItem>
            <SidebarItem
              href='/admin/requests'
              icon={<i className='fa fa-circle-o' />}
            >
              Встречи
            </SidebarItem>
            <SidebarItem
              to='/admin/events'
              icon={<i className='fa fa-circle-o' />}
            >
              Групповые встречи
            </SidebarItem>
          </Sidebar.Menu>
        </Sidebar>
        <div className='content-wrapper'>
          <section className='content'>
            {this.props.children}
          </section>
        </div>
      </AdminLTE>
    );
  }
}
