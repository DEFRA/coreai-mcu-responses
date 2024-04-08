const sorters = {
  lines: (a, b) => a.from - b.from
}

const groupLocations = (citation) => {
  const { content } = citation

  return content.reduce((acc, content) => {
    const { loc } = content

    for (const key of Object.keys(loc)) {
      acc[key] = acc[key] || []
      acc[key].push({ ...loc[key] })
    };

    return acc
  }, {})
}

const groupCitations = (citations) => {
  const grouped = citations.reduce((acc, citation) => {
    const { pageContent } = citation
    const { blobMetadata, loc } = citation.metadata

    let group = acc.find(group => group.title === blobMetadata.title)

    if (!group) {
      group = { ...blobMetadata, content: [] }
      acc.push(group)
    }

    group.content.push({ pageContent, loc })
    group.locations = groupLocations(group)

    return acc
  }, [])

  for (const citation of grouped) {
    const { locations } = citation

    if (locations) {
      for (const key of Object.keys(locations)) {
        if (sorters[key] != null) {
          locations[key].sort(sorters[key])
        }
      }
    }
  }

  return grouped
}

module.exports = {
  groupCitations
}
