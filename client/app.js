const socket = io({ secure: true })
const roomName = window.location.pathname.replace(/\//g, '')

socket.emit('joinRoom', roomName)

const resetButton = document.querySelector('#reset-votes')

resetButton.addEventListener('click', () => {
  socket.emit('reset')
})

const buttons = document.querySelectorAll('input[type="button"].btn-cast')

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    socket.emit('vote', button.value)
  })
})

socket.on('getUsers', (text) => {
  document.querySelector('span#users').textContent = text
})

socket.on('getVoteCount', (voteCount) => {
  document.querySelector('span#voteCount').textContent = voteCount
})

socket.on('getAverage', (averageScore) => {
  document.querySelector('span#average').textContent = averageScore
})
