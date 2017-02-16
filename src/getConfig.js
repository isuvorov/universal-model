export default function getConfig(model = {}, params = {}) {
  const configName = params.config || '_universal';
  const modelConfig = model[configName] || {};

  return {
    ...modelConfig,
    ...params,
  };
}
