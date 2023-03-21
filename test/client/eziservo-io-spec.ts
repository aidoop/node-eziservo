import { EziServo } from '../../src/eziservo-client'
import { EZISERVO_IP, EZISERVO_NAME } from '../settings'

describe('EziServo', function () {
  describe('#IO', function () {
    this.timeout(60000)

    it('should handle Input ports without any exception', async () => {
      var client = new EziServo(EZISERVO_IP, EZISERVO_NAME)
      await client.connect()

      await client.setIOInput(0x1, 0x1)
      let inputs = await client.getIOInput()
      console.log('inputs: ', inputs)

      await client.setIOOutput(0x1, 0x0)
      let outputs = await client.getIOOutput()
      console.log('outputs: ', outputs)

      await client.setIOAssignMap(0, 0x00, true)
      let ioAssigns = await client.getIOAssignMap(0)
      console.log('ioAssigns: ', ioAssigns)

      let readRomValue = await client.ioAssignMapReadROM()
      console.log('ioAssignMapReadROM: ', readRomValue)

      await client.triggerOutputRunA(0, 0, 8000000, 500)

      console.log('triggerOutputStatus: ', await client.triggerOutputStatus())

      client.disconnect()
    })
  })
})
