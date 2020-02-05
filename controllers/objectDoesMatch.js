// Compares an object to another

const OPERATORS_COMPARISON = [
  '$eq',
  '$gt',
  '$gte',
  '$lt',
  '$lte',
  '$ne',
];

module.exports = (query, obj) => {
  let match = true;
  for (let key in query) {
    const criteria = query[key];
    if (typeof criteria === 'object') {
      match = compareCriteria(criteria, obj[key]);
      if (!match) break;
    } else {
      if (obj[key] !== query[key]) {
        match = false;
        break;
      }
    }
  }
  return match;
};

const compareCriteria = (criteria, test) => {
  let match = true;
  for (const [ operator, value ] of Object.entries(criteria)) {
    match = compareValue(operator, value, test);
    if (!match) break;
  }
  return match;
}

const compareValue = (operator, value, test) => {
  if (!OPERATORS_COMPARISON.includes(operator)) {
    return false;
  }
  if (operator === '$eq' && test === value) {
    return true;
  }
  if (operator === '$gt' && test > value) {
    return true;
  }
  if (operator === '$gte' && test >= value) {
    return true;
  }
  if (operator === '$lt' && test < value) {
    return true;
  }
  if (operator === '$lte' && test <= value) {
    return true;
  }
  if (operator === '$ne' && test !== value) {
    return true;
  }
  return false;
}
