const base = {
  'author': 'author',
  'title': 'title',
  'summary': 'summary',
  'key_points': 'keyPoints',
  'key_facts': 'keyFacts',
  'sentiment': 'sentiment',
  'category': 'category'
}

const map = (summary, lookup) => {
  const obj = {}

  for (const key in summary) {
    obj[lookup[key]] = summary[key]
  }

  return obj
}

const mapSummaryToBase = (summary) => map(summary, base)

module.exports = {
  mapSummaryToBase
}
