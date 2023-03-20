import { EziServo } from '../../src/eziservo-client'
import { EZISERVO_IP, EZISERVO_NAME } from '../settings'

describe('EziServo', function () {
  describe('#connect()', function () {
    this.timeout(10000)

    it('should return binary string', async () => {
      var client = new EziServo(EZISERVO_IP, EZISERVO_NAME)
      await client.connect()

      let board_info = await client.getBoardInfo()
      console.log(board_info)

      client.disconnect()
    })
  })
})
