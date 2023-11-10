const express = require('express')
const path = require('path')
const crypto = require('crypto')

const app = express()
const localPort = 1337
const port = process.env.PORT || localPort
// process.env.npm_package_version

app.get('/health', (_req, res) => res.sendStatus(200))

app.use('/:room', express.static(path.join(__dirname, 'client')))

app.get('/', (_req, res) => {
  res.redirect(crypto.randomBytes(3).toString('hex'))
})

const http = require('http').Server(app)

const io = require('socket.io')(http, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    transports: ['websocket', 'polling'],
    credentials: true
  },
  allowEIO3: true
})

// const rooms = {}
const users = {}

// const voteDistribution = new Map([
//   [0, 0],
//   [1, 0],
//   [2, 0],
//   [3, 0],
//   [4, 0],
//   [5, 0]
// ])

// const voteDistribution = new Map([
//   [0, 0],
//   [1, 0],
//   [2, 0],
//   [3, 0],
//   [4, 0],
//   [5, 0]
// ])

const addUser = (socket, room) => {
  const socketId = socket.id
  socket.join(room)
  users[socketId] = { room: room, vote: null }
  console.log(`${socketId} joined ${room}`)
}

const removeUser = (socketId) => delete users[socketId]

const average = (scores) =>
  scores.length > 0
    ? (
        scores.reduce((a, b) => a + b) /
        scores.filter((score) => score !== null).length
      ).toFixed(1)
    : Number.parseFloat(0).toFixed(1)

const scores = (users, room) =>
  Object.entries(users)
    .filter((user) => user[1].room === room)
    .map((user) => user[1].vote)
    .filter((vote) => vote !== null)

// const getVoteCount = scores(users, room).length

const updateDistribution = (listOfVotes) => {
  listOfVotes.forEach((vote) => {
    voteDistribution.has(vote)
      ? voteDistribution.set(vote, voteDistribution.get(vote) + 1)
      : voteDistribution.set(vote, 1)
  })
}

io.on('connection', (socket) => {
  socket.on('joinRoom', (room) => {
    addUser(socket, room)

    const roomSize = io.sockets.adapter.rooms.get(room).size
    io.to(room).emit('getUsers', roomSize)

    console.log(users)

    const avg = average(scores(users, room))
    io.to(room).emit('getAverage', avg)

    const voteCount = scores(users, room).length
    io.to(room).emit('getVoteCount', voteCount)
  })

  socket.on('reset', async () => {
    const room = await users[socket.id].room
    io.to(room).emit('reset', true)

    const usersInRoom = Object.entries(users).filter(
      (user) => user[1].room === room
    )

    usersInRoom.forEach((user) => {
      user[1].vote = null
    })

    io.to(room).emit('getAverage', average(0))
    io.to(room).emit('getVoteCount', 0)

    console.log(usersInRoom)
    console.log('cleared')
  })

  socket.on('vote', async (vote) => {
    // Check if the user exists before attempting to access their properties
    if (users[socket.id]) {
        const room = users[socket.id].room;
        io.to(room).emit('vote', vote);

        users[socket.id].vote = parseInt(vote);
        console.log(users);

        const avg = average(scores(users, room));
        io.to(room).emit('getAverage', avg);

        const voteCount = scores(users, room).length;
        io.to(room).emit('getVoteCount', voteCount);
    } else {
        console.log(`User ${socket.id} not found. Possible session timeout.`);
    }
  });


  socket.on('disconnect', async () => {
    if (users[socket.id]) {
      const room = users[socket.id].room;
      removeUser(socket.id);
      const roomObj = io.sockets.adapter.rooms.get(room);
      if (roomObj) {
        io.to(room).emit('getUsers', roomObj.size);
        const avg = average(scores(users, room));
        io.to(room).emit('getAverage', avg);
        const voteCount = scores(users, room).length;
        io.to(room).emit('getVoteCount', voteCount);
      } else {
        console.log(`Room ${room} is now empty and can be cleaned up.`);
      }
    }
  });
})

http.listen(port, () => console.log(`Listening on port ${port}`))
