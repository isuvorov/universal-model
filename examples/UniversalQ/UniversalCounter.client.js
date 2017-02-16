import Api from '../api/api.client';
import UniversalCounter from './UniversalCounter';


export default class UniversalCounterClient extends UniversalCounter {
  
}

const api = new Api({
  base: '/api/v3/universal',
});
UniversalCounterClient.init({
  api,
});
