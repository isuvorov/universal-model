import TestPage from './TestPage'
import PetPage from './TestPage/pages/pets'
export default {
  children: [
    {
      path: '/',
      action(req) {
        console.log('test')
        return {
          title: 'login',
          component: <TestPage />,
        }
      },
    },
    {
      path: '/pet',
      action(req) {
        console.log('pet')
        return {
          title: 'pet',
          component: <PetPage />,
        }
      },
    },
    {
      path: '*',
      action() {
        throw new Error('Not found in auth')
      },
    },
  ],
  action: () => console.log('checking child routes for /posts'),
};
