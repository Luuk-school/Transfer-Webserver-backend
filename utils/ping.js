const express = require('express')
const ping = express()
const POD_NAME = process.env.POD_NAME || require('os').hostname()

ping.get('/', (req, res) => {
  console.log(`[${new Date().toISOString()}] /ping aangeroepen op pod: ${POD_NAME}`)
  
  res.json({
    pod: POD_NAME,
    status: 'pong',
    timestamp: new Date().toISOString()
  })
})

module.exports = ping