import { expect } from 'chai'

import { packet } from '../../src/decorators'
import { FrameType } from '../../src/frame-type'

describe('Decorator', function () {
  describe('#packet()', function () {
    class Clazz {
      public command
      public reqData

      handleCommand(command, reqData) {
        this.command = command
        this.reqData = reqData

        return {
          errorCode: ''
        }
      }

      @packet(FrameType.FAS_GetboardInfo, 'char')
      decorated_char(x) {}

      @packet(FrameType.FAS_GetboardInfo, 'bool')
      decorated_bool(x) {}

      @packet(FrameType.FAS_GetboardInfo, 'int')
      decorated_int(x) {}

      @packet(FrameType.FAS_GetboardInfo, 'float')
      decorated_float(x) {}

      @packet(FrameType.FAS_GetboardInfo, 'double')
      decoratedDouble(x) {}

      @packet(FrameType.FAS_GetboardInfo, 'string')
      decorated_string(x) {}

      @packet(FrameType.FAS_GetboardInfo, 'bools')
      decorated_bools(x) {}

      @packet(FrameType.FAS_GetboardInfo, 'ints')
      decorated_ints(x) {}

      @packet(FrameType.FAS_GetboardInfo, 'floats')
      decorated_floats(x) {}

      @packet(FrameType.FAS_GetboardInfo, 'doubles')
      decoratedDoubles(x) {}
    }

    it('should have same charater value in request data', async function () {
      var decorated = new Clazz()

      await decorated.decorated_char('A')

      expect(decorated.command).to.equal(FrameType.FAS_GetboardInfo)
      expect(String.fromCharCode(decorated.reqData.readUInt8(0))).to.equal('A')
    })

    it('should have same 32bit integer value in request data', async function () {
      var decorated = new Clazz()

      await decorated.decorated_int(0x71)

      expect(decorated.command).to.equal(FrameType.FAS_GetboardInfo)
      expect(decorated.reqData.readInt32LE(0)).to.equal(0x71)
    })

    it('should have same boolean value in request data', async function () {
      var decorated = new Clazz()

      await decorated.decorated_bool(true)

      expect(decorated.command).to.equal(FrameType.FAS_GetboardInfo)
      expect(decorated.reqData.readUInt8(0)).to.equal(1)
    })

    it('should have same float value in request data', async function () {
      var decorated = new Clazz()

      await decorated.decorated_float(62431)

      expect(decorated.command).to.equal(FrameType.FAS_GetboardInfo)
      expect(decorated.reqData.readFloatLE(0)).to.equal(62431)
    })

    it('should have same double value in request data', async function () {
      var decorated = new Clazz()

      await decorated.decoratedDouble(0.00001234)

      expect(decorated.command).to.equal(FrameType.FAS_GetboardInfo)
      expect(decorated.reqData.readDoubleLE(0)).to.equal(0.00001234)
    })

    it('should have same string value in request data', async function () {
      var decorated = new Clazz()

      await decorated.decorated_string('ABC')

      expect(decorated.command).to.equal(FrameType.FAS_GetboardInfo)
      expect(String.fromCharCode(decorated.reqData.readUInt8(0))).to.equal('A')
    })

    it('should have same 32bit integers value in request data', async function () {
      var decorated = new Clazz()

      await decorated.decorated_ints([0x71])

      expect(decorated.command).to.equal(FrameType.FAS_GetboardInfo)
      expect(decorated.reqData.readInt32LE(0)).to.equal(0x71)
    })

    it('should have same booleans value in request data', async function () {
      var decorated = new Clazz()

      await decorated.decorated_bools([true])

      expect(decorated.command).to.equal(FrameType.FAS_GetboardInfo)
      expect(decorated.reqData.readUInt8(0)).to.equal(1)
    })

    it('should have same floats value in request data', async function () {
      var decorated = new Clazz()

      await decorated.decorated_floats([62431])

      expect(decorated.command).to.equal(FrameType.FAS_GetboardInfo)
      expect(decorated.reqData.readFloatLE(0)).to.equal(62431)
    })

    it('should have same doubles value in request data', async function () {
      var decorated = new Clazz()

      var value = await decorated.decoratedDoubles([0.00001234])

      expect(decorated.command).to.equal(FrameType.FAS_GetboardInfo)
      expect(decorated.reqData.readDoubleLE(0)).to.equal(0.00001234)
    })
  })

  describe('#packet() with echo response data', function () {
    class Clazz {
      public command

      handleCommand(command, reqData) {
        this.command = command

        return {
          errorCode: '',
          resData: reqData,
          resDataSize: reqData.length
        }
      }

      @packet(FrameType.FAS_GetboardInfo, 'char', 'char')
      decorated_char(x): any {}

      @packet(FrameType.FAS_GetboardInfo, 'bool', 'bool')
      decorated_bool(x): any {}

      @packet(FrameType.FAS_GetboardInfo, 'int', 'int')
      decorated_int(x): any {}

      @packet(FrameType.FAS_GetboardInfo, 'float', 'float')
      decorated_float(x): any {}

      @packet(FrameType.FAS_GetboardInfo, 'double', 'double')
      decoratedDouble(x): any {}

      @packet(FrameType.FAS_GetboardInfo, 'string', 'string')
      decorated_string(xs): any {}

      @packet(FrameType.FAS_GetboardInfo, 'bools', 'bools')
      decorated_bools(xs): any {}

      @packet(FrameType.FAS_GetboardInfo, 'ints', 'ints')
      decorated_ints(xs): any {}

      @packet(FrameType.FAS_GetboardInfo, 'floats', 'floats')
      decorated_floats(xs): any {}

      @packet(FrameType.FAS_GetboardInfo, 'doubles', 'doubles')
      decoratedDoubles(xs): any {}
    }

    it('should have same charater value in data', async function () {
      var decorated = new Clazz()

      var value = await decorated.decorated_char('A')

      expect(decorated.command).to.equal(FrameType.FAS_GetboardInfo)
      expect(value).to.equal('A')
    })

    it('should have same 32bit integer value in data', async function () {
      var decorated = new Clazz()

      var value = await decorated.decorated_int(0x71)

      expect(decorated.command).to.equal(FrameType.FAS_GetboardInfo)
      expect(value).to.equal(0x71)
    })

    it('should have same boolean value in data', async function () {
      var decorated = new Clazz()

      var value = await decorated.decorated_bool(true)

      expect(decorated.command).to.equal(FrameType.FAS_GetboardInfo)
      expect(value).to.equal(true)
    })

    it('should have same float value in data', async function () {
      var decorated = new Clazz()

      var value = await decorated.decorated_float(62431)

      expect(decorated.command).to.equal(FrameType.FAS_GetboardInfo)
      expect(value).to.equal(62431)
    })

    it('should have same double value in data', async function () {
      var decorated = new Clazz()

      var value = await decorated.decoratedDouble(0.00001234)

      expect(decorated.command).to.equal(FrameType.FAS_GetboardInfo)
      expect(value).to.equal(0.00001234)
    })

    it('should have same string value in data', async function () {
      var decorated = new Clazz()

      var value = await decorated.decorated_string('ABC')

      expect(decorated.command).to.equal(FrameType.FAS_GetboardInfo)
      expect(value).to.equal('ABC')
    })

    it('should have same 32bit integers value in data', async function () {
      var decorated = new Clazz()

      var value = await decorated.decorated_ints([0x71, 0x72])

      expect(decorated.command).to.equal(FrameType.FAS_GetboardInfo)
      expect(value[0]).to.equal(0x71)
    })

    it('should have same booleans value in data', async function () {
      var decorated = new Clazz()

      var value = await decorated.decorated_bools([true, false])

      expect(decorated.command).to.equal(FrameType.FAS_GetboardInfo)
      expect(value[0]).to.equal(true)
    })

    it('should have same floats value in data', async function () {
      var decorated = new Clazz()

      var value = await decorated.decorated_floats([62431, 62432])

      expect(decorated.command).to.equal(FrameType.FAS_GetboardInfo)
      expect(value[0]).to.equal(62431)
    })

    it('should have same doubles value in data', async function () {
      var decorated = new Clazz()

      var value = await decorated.decoratedDoubles([0.00001234, 0.00001235])

      expect(decorated.command).to.equal(FrameType.FAS_GetboardInfo)
      expect(value[0]).to.equal(0.00001234)
    })
  })

  describe('#packet() without request data', function () {
    class Clazz {
      public command
      public resData

      handleCommand(command) {
        this.command = command
        var resData

        switch (command) {
          case 1: // char
            resData = Buffer.alloc(1, 'A'.charCodeAt(0))
            break
          case 2: // bool
            resData = Buffer.alloc(1, 1)
            break
          case 3: // int
            resData = Buffer.alloc(4)
            resData.writeInt32LE(0x71)
            break
          case 4: // float
            resData = Buffer.alloc(4)
            resData.writeFloatLE(12345)
            break
          case 5: // double
            resData = Buffer.alloc(8)
            resData.writeDoubleLE(0.0001234)
            break
          case 11: // string
            resData = Buffer.alloc(2 * 1)
            resData.writeUInt8('A'.charCodeAt(0), 0)
            resData.writeUInt8('B'.charCodeAt(0), 1)
            break
          case 12: // bools
            resData = Buffer.alloc(2 * 1)
            resData.writeUInt8(1, 0)
            resData.writeUInt8(0, 1)
            break
          case 13: // integers
            resData = Buffer.alloc(2 * 4)
            resData.writeInt32LE(0x71, 0)
            resData.writeInt32LE(0x72, 4)
            break
          case 14: // floats
            resData = Buffer.alloc(2 * 4)
            resData.writeFloatLE(12345, 0)
            resData.writeFloatLE(12346, 4)
            break
          case 15: // doubles
            resData = Buffer.alloc(2 * 8)
            resData.writeDoubleLE(0.0001234, 0)
            resData.writeDoubleLE(0.0001235, 8)
            break
        }

        return {
          errorCode: '',
          resData,
          resDataSize: resData.length
        }
      }

      @packet(1, null, 'char')
      decorated_char(): any {}

      @packet(2, null, 'bool')
      decorated_bool(): any {}

      @packet(3, null, 'int')
      decorated_int(): any {}

      @packet(4, null, 'float')
      decorated_float(): any {}

      @packet(5, null, 'double')
      decoratedDouble(): any {}

      @packet(11, null, 'string')
      decorated_string(): any {}

      @packet(12, null, 'bools')
      decorated_bools(): any {}

      @packet(13, null, 'ints')
      decorated_ints(): any {}

      @packet(14, null, 'floats')
      decorated_floats(): any {}

      @packet(15, null, 'doubles')
      decoratedDoubles(): any {}
    }

    it('should have same charater value in data', async function () {
      var decorated = new Clazz()

      var value = await decorated.decorated_char()

      expect(value).to.equal('A')
    })

    it('should have same 32bit integer value in data', async function () {
      var decorated = new Clazz()

      var value = await decorated.decorated_int()

      expect(value).to.equal(0x71)
    })

    it('should have same boolean value in data', async function () {
      var decorated = new Clazz()

      var value = await decorated.decorated_bool()

      expect(value).to.equal(true)
    })

    it('should have same float value in data', async function () {
      var decorated = new Clazz()

      var value = await decorated.decorated_float()

      expect(value).to.equal(12345)
    })

    it('should have same double value in data', async function () {
      var decorated = new Clazz()

      var value = await decorated.decoratedDouble()

      expect(value).to.equal(0.0001234)
    })

    it('should have same string value in data', async function () {
      var decorated = new Clazz()

      var value = await decorated.decorated_string()

      expect(value).to.equal('AB')
    })

    it('should have same 32bit integers value in data', async function () {
      var decorated = new Clazz()

      var value = await decorated.decorated_ints()

      expect(value[0]).to.equal(0x71)
    })

    it('should have same booleans value in data', async function () {
      var decorated = new Clazz()

      var value = await decorated.decorated_bools()

      expect(value[0]).to.equal(true)
    })

    it('should have same floats value in data', async function () {
      var decorated = new Clazz()

      var value = await decorated.decorated_floats()

      expect(value[0]).to.equal(12345)
    })

    it('should have same doubles value in data', async function () {
      var decorated = new Clazz()

      var value = await decorated.decoratedDoubles()

      expect(value[0]).to.equal(0.0001234)
    })
  })
})
