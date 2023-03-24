import { EziServo } from '../../src/eziservo-client'
import { sleep } from '../../src/utils'
import { EZISERVO_IP, EZISERVO_NAME, EZISERVO_PORT } from '../settings'

describe('EziServo', function () {
  describe('#connect()', function () {
    this.timeout(1000000)

    it('should return binary string', async () => {
      var client = new EziServo(EZISERVO_IP, EZISERVO_PORT, EZISERVO_NAME)
      await client.connect()

      await client.setServoEnable(true)
      await sleep(1000)

      let allStatus: any = await client.getAllStatus()
      allStatus.map(status => console.log(status.toString(16)))

      let axisStatus: any = await client.getAxisStatus()
      console.log(axisStatus.toString(16))

      let [commandPos, actualPos, cc, dd, ee]: any = await client.getMotionStatus()
      console.log('motion status: ', commandPos, actualPos)

      await client.moveSingleAxisAbsPos(10000, 2500)
      do {
        await sleep(500)
        axisStatus = await client.getAxisStatus()
        console.log('axisStatus: ', axisStatus.toString(16))
      } while ((axisStatus & 0x08000000) === 0x08000000)

      await client.movePush(1000, 2000, 1000, 1000, 1000, 40, 5000, 100000, 0)
      do {
        await sleep(500)
        axisStatus = await client.getAxisStatus()
        console.log('axisStatus: ', axisStatus.toString(16))
      } while ((axisStatus & 0x08000000) === 0x08000000)

      await client.setServoEnable(false)

      client.disconnect()
    })
  })
})
