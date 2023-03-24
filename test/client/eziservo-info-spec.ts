import { expect } from 'chai'

import { EziServo } from '../../src/eziservo-client'
import { EZISERVO_IP, EZISERVO_NAME, EZISERVO_PORT } from '../settings'

describe('EziServo', function () {
  describe('#getBoardInfo', function () {
    this.timeout(10000)

    it('should return string', async () => {
      var client = new EziServo(EZISERVO_IP, EZISERVO_PORT, EZISERVO_NAME)
      await client.connect()

      let board_info: unknown = await client.getBoardInfo()
      console.log('111', board_info)
      expect((board_info as string).indexOf('Ezi-SERVO')).to.be.greaterThan(0)

      client.disconnect()
    })
  })

  describe('#getMotorInfo', function () {
    this.timeout(10000)

    it('should return binary string', async () => {
      var client = new EziServo(EZISERVO_IP, EZISERVO_PORT, EZISERVO_NAME)
      await client.connect()

      let motor_info: unknown = await client.getMotorInfo()

      // TODO: check if this api is available
      console.log(motor_info)
      // expect((motor_info as string).indexOf("Ezi-SERVO")).to.be.greaterThan(0);

      client.disconnect()
    })
  })
})
