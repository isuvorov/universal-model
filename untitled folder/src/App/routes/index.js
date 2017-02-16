import HomePage from './HomePage'
import ErrorPage from './ErrorPage'
import Layout from '../components/Layout'
import config from '../../config/index.client'

export default {
  path: '/',
  children: [
    {
      path: '/',
      action(state) {
        return state.ctx.history.push('/tests')
      },
    },
    {
      path: '/tests',
      ...require('./tests').default,
    },
    {
      path: '/auth',
      ...require('./auth').default,
    },
    {
      path: '/admin',
      ...require('./admin').default,
    },
    {
      path: '*',
      action() {
        throw 'Not found';
      },
    },
  ],
  async action({ next }) {
    let route;
    try {
      route = await next();
    } catch (err) {
      route = {
        title: `Waiting...`,
        component: <div>Ща все будет</div>,
      }
    }
    if (!route) route = {}
    route.title = `${route.title || 'Untitled Page'} - ${config.siteTitle}`;
    route.description = route.description || config.siteTitle;
    route.component = <Layout>
      {route.component}
    </Layout>
    return route;
  },
};
