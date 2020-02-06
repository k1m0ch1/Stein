// Compares an object to another

const OPERATORS_COMPARISON = [
  '$eq',
  '$gt',
  '$gte',
  '$lt',
  '$lte',
  '$ne',
];

const OPERATORS_LOGICAL = [
  '$and',
  '$not',
  '$nor',
  '$or',
];

const objectDoesMatch = (query, obj) => {
  try {
    let match = false;
    for (let key in query) {
      const criteria = query[key];
      if (OPERATORS_LOGICAL.includes(key)) {
        if (key === '$not') {
          match = compareNot(criteria, obj);
        } else {
          match = compareLogical(key, criteria, obj);
        }
        if (!match) break;
      } else if (typeof criteria === 'object') {
        match = compareCriteria(criteria, obj[key]);
        if (!match) break;
      } else {
        match = obj[key] === query[key];
        if (!match) break;
      }
    }
    return match;
  } catch (err) {
    return false;
  }
};

const compareNot = (query, obj) => {
  const match = objectDoesMatch(query, obj);
  return !match;
}

const compareLogical = (operator, queries, obj) => {
  let match = false;
  for (const query of queries) {
    match = objectDoesMatch(query, obj);
    if (operator === '$and' && !match) {
      break;
    }
    if (operator === '$or' && match) {
      break;
    }
    if (operator === '$nor') {
      match = !match;
      if (!match) break;
    }
  }
  return match;
}

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

module.exports = objectDoesMatch;
