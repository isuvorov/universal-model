import getApiV2 from '../v2';
import asyncRouter from 'lego-starter-kit/utils/AsyncRouter';
import getMessagesApi from './messages/messages.api';
import getProfilesApi from './profiles/profiles.api';
import getTestsApi from './tests/tests.api';
import UniversalModel from '../../UniversalModel';
import UniversalCounter from '../../UniversalCounter';
import UniversalPet from '../../UniversalPet';
import UniversalQ from '../../UniversalQ';
export default function getApiV3(ctx, params) {
  const apiV2 = getApiV2(ctx, params);
  const api = asyncRouter();
  api.use('/messages', getMessagesApi(ctx));
  api.use('/profiles', getProfilesApi(ctx));
  api.use('/tests', getTestsApi(ctx));
  api.post('/universal', UniversalModel.getRouter({
    models: {
      UniversalPet,
      UniversalCounter,
      UniversalQ,
    },
    ctx,
  }));
  api.use(apiV2);
  return api;
}
