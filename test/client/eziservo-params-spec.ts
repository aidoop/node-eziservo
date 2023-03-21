import { expect } from 'chai'

import { EziServo } from '../../src/eziservo-client'
import { EZISERVO_IP, EZISERVO_NAME } from '../settings'

describe('EziServo', function () {
  describe('#Parameters', function () {
    this.timeout(10000)

    it('should change parameters in RAM', async () => {
      var client = new EziServo(EZISERVO_IP, EZISERVO_NAME)
      await client.connect()

      let romParams = await client.getRomParameters(0)
      console.log(romParams)

      let origValue, checkValue
      origValue = await client.getParameters(0)

      await client.setParameters(0, 7)
      checkValue = await client.getParameters(0)
      expect(checkValue).to.be.equal(7)

      await client.setParameters(0, origValue)
      checkValue = await client.getParameters(0)
      expect(checkValue).to.be.equal(origValue)

      client.disconnect()
    })
  })
})
