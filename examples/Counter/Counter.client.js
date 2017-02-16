import Api from '../api/api.client';
import UniversalCounter from './UniversalCounter';


// ...
ctx.api = new Api({
  base: '/api/v3',
});
//
ctx.universalParams = {
  api: ctx.api,
  route: 'universal',
};
///
ctx.api.setToken('#adsasdasda');
// ...




export default class UniversalCounterClient extends UniversalCounter {

}

UniversalCounterClient.init(ctx.universalParams);
