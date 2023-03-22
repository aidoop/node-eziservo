const { EziServo } = require('@things-factory/node-eziservo')

;(async function () {
  var client = new EziServo('192.168.0.2')
  await client.connect()

  console.log(await client.getBoardInfo())

  client.disconnect()
})()
