import { EziServo } from '../../src/eziservo-client'
import { sleep } from '../../src/utils'
import { EZISERVO_IP, EZISERVO_NAME, EZISERVO_PORT } from '../settings'

describe('EziServo', function () {
  describe('#connect()', function () {
    this.timeout(10000)

    it('should return binary string', async () => {
      var client = new EziServo(EZISERVO_IP, EZISERVO_PORT, EZISERVO_NAME)
      await client.connect()

      await sleep(1000)

      client.disconnect()
    })
  })
})
