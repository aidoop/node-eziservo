import { EziServo } from '../../src/eziservo-client'
import { EZISERVO_IP, EZISERVO_NAME } from '../settings'

describe('EziServo', function () {
  describe('#connect()', function () {
    this.timeout(10000)

    it('should return binary string', async () => {
      var client = new EziServo(EZISERVO_IP, EZISERVO_NAME)
      await client.connect()

      // let board_info: unknown = await client.getBoardInfo()
      // console.log('board info: \n', board_info)

      // let axisStatus: any = await client.getAxisStatus()
      // console.log(axisStatus.toString(16))

      // // await client.setServoEnable(true)
      // // await sleep(1000)
      // await client.moveSingleAxisIncPos(100000, 50000)
      // await sleep(1000)
      // // await client.moveSingleAxisIncPos(1000000, 1000)
      // axisStatus = await client.getAxisStatus()
      // console.log(axisStatus.toString(16))

      let allStatus: any = await client.getAllStatus()
      allStatus.map(status => console.log(status.toString(16)))

      client.disconnect()
    })
  })
})
