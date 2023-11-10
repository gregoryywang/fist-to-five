const users = {
  PI39yYpJkayvhMZMAAAF: { room: 'asdfsdfk', vote: 2 },
  fkfkkfs: { room: 'asdfsdfk', vote: 2 },
  'KxsGw7pQ82kH-65IAAAH': { room: 'asdfsdfk', vote: 3 },
  gg: { room: 'asdfsdfk', vote: 4 },
  sdf: { room: 'zzz', vote: 5 }
}

const average = (scores) =>
  scores.length > 0
    ? (
        scores.reduce((a, b) => a + b) /
        scores.filter((score) => score !== null).length
      ).toFixed(1)
    : Number.parseFloat(0).toFixed(1)

// const avg = average(
//   Object.entries(users)
//     .filter((user) => user[1].room === 'asdfsdfk')
//     .map((user) => user[1].vote)
//     .filter((vote) => vote !== null)
// )

const room = 'asdfsdfk'

console.log(Object.entries)

const listOfVotes = Object.entries(users)
  .filter((user) => user[1].room === room)
  .map((user) => user[1].vote)
  .filter((vote) => vote !== null)

const voteDistribution = new Map([
  [0, 0],
  [1, 0],
  [2, 0],
  [3, 0],
  [4, 0],
  [5, 0]
])

const updateDistribution = listOfVotes.forEach((vote) => {
  voteDistribution.has(vote)
    ? voteDistribution.set(vote, voteDistribution.get(vote) + 1)
    : voteDistribution.set(vote, 1)
})

console.log(listOfVotes)
console.log(voteDistribution)

for (const [key, value] of voteDistribution.entries()) {
  console.log(`${key} = ${'x'.repeat(value)}`)
}
