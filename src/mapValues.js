export default function mapValues(object, iteratee) {
  const result = {};
  Object.keys(object).forEach((value, key, object) => {
    result[key] = iteratee(value, key, object);
  });
  return result;
}
