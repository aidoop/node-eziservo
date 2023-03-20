const { EziServo } = require('@things-factory/node-eziservo')

;(async function () {
  var client = new EziServo('127.0.0.1')
  await client.connect()

  await client.getBoardInfo()

  client.disconnect()
})()
