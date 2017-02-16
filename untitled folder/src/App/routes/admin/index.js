import AdminPage from './AdminPage'
import AdminLogin from './AdminPage/pages/login'
import ProfilesListPage from './AdminPage/pages/profiles/list'
import ProfilePage from './AdminPage/pages/profiles/edit'
import NewProfilePage from './AdminPage/pages/profiles/create'
import RequestsListPage from './AdminPage/pages/requests/list'
import RequestsPage from './AdminPage/pages/requests/edit'
import EventsListPage from './AdminPage/pages/events/list'
import EventsPage from './AdminPage/pages/events/edit'
export default {
  children: [
    {
      path: '/',
      action(state) {
        return state.ctx.history.push('/admin/profiles')
      },
    },
    {
      path: '/login',
      action(state) {
      //   console.log(await state.ctx.provider.auth.login({ login: 'admin',
      // password: 'hijay_password'}))
        return {
          title: 'Авторизация',
          component: <AdminLogin auth={state.ctx.provider.auth} history={state.ctx.history}/>,
        }
      },
    },
    {
      path: '/profiles/create',
      action() {
        return {
          title: 'Admin Page',
          component: <AdminPage>
            <NewProfilePage />
          </AdminPage>,
        }
      },
    },
    {
      path: '/profiles/:id',
      action(req) {
        return {
          title: 'Admin Page',
          component: <AdminPage>
            <ProfilePage profileId={req.params.id} />
          </AdminPage>,
        }
      },
    },
    {
      path: '/profiles',
      async action(req) {
        await req.ctx.provider.auth.checkIsAuth(() => {
          return req.ctx.history.push('/admin/login')
        })
        return {
          title: 'Admin Page',
          component: <AdminPage>
            <ProfilesListPage />
          </AdminPage>,
        }
      },
    },
    {
      path: '/requests',
      action() {
        return {
          title: 'Admin Page',
          component: <AdminPage>
            <RequestsListPage />
          </AdminPage>,
        }
      },
    },
    {
      path: '/requests/:id',
      action(req) {
        return {
          title: 'Admin Page',
          component: <AdminPage>
            <RequestsPage requestId={req.params.id} />
          </AdminPage>,
        }
      },
    },
    {
      path: '/events',
      action() {
        return {
          title: 'Admin Page',
          component: <AdminPage>
            <EventsListPage />
          </AdminPage>,
        }
      },
    },
    {
      path: '/events/:id',
      action(req) {
        return {
          title: 'Admin Page',
          component: <AdminPage>
            <EventsPage eventId={req.params.id} />
          </AdminPage>,
        }
      },
    },
    // {
    //   path: '/requests/:id',
    //   action(req) {
    //     return {
    //       title: 'Admin Page',
    //       component: <AdminPage>
    //         <EventsPage eventId={req.params.id} />
    //       </AdminPage>,
    //     }
    //   },
    // },
    {
      path: '*',
      action() {
        throw new Error('Not found in auth')
      },
    },
  ],
  action: () => console.log('checking child routes for /posts'),
};
