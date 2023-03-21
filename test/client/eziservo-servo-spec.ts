import { EziServo } from '../../src/eziservo-client'
import { sleep } from '../../src/utils'
import { EZISERVO_IP, EZISERVO_NAME } from '../settings'

describe('EziServo', function () {
  describe('#servo, move, and alarm', function () {
    this.timeout(60000)

    it('should handle the functions for servo, move and alarm without any exception', async () => {
      var client = new EziServo(EZISERVO_IP, EZISERVO_NAME)
      await client.connect()

      // await client.setServoEnable(true)
      // await sleep(1000)
      // await client.setServoEnable(false)

      // await client.setServoAlarmReset()

      // console.log('getAlarmType: ', await client.getAlaramType())

      // await client.stopMove()

      // await client.stopEmergency()

      // await client.moveOriginSingleAxis()
      // await sleep(1000)

      // await client.moveSingleAxisAbsPos(8000, 500)
      // await sleep(1000)

      // await client.moveSingleAxisIncPos(8000, 500)
      // await sleep(1000)

      // await client.moveToLimit(500, 0)
      // await sleep(1000)

      // await client.moveVelocity(500, 0)
      // await sleep(1000)

      // await client.overridePositionAbs(1000)
      // await sleep(1000)

      // await client.overridePositionInc(1000)
      // await sleep(1000)

      // await client.overrideVelocity(50000)
      // await sleep(1000)

      await client.moveSingleAxisAbsPosEx(5000, 50000, 0x0001, 5000, 5000, Buffer.alloc(24))
      await sleep(1000)

      await client.moveSingleAxisAbsIncEx(5000, 50000, 0x0001, 5000, 5000, Buffer.alloc(24))
      await sleep(1000)

      client.disconnect()
    })
  })
})
