import asyncRouter from 'lego-starter-kit/utils/AsyncRouter' // eslint-disable-line
import getController from './tests.controller';

export default(ctx, parent) => {
  const controller = getController(ctx, parent);

  const api = asyncRouter();

  return api;
};
