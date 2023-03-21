import Struct from 'struct'

import { IEziServo } from './eziservo-interface'

/* Robot Interface */
export const SIZE_HEADER = 5
export const SIZE_STATUS = 1
export const SIZE_FRAMELEN_HEADER = 3
export const SIZE_COMMAND = 4
export const SIZE_DATA_TCP_MAX = 259
export const SIZE_DATA_MAX = 200
export const SIZE_DATA_ASCII_MAX = 32
export const SIZE_PACKET = 256

/* Header foramt */
export const HeaderFrameFormat = Struct()
  .word8('header', 1)
  .word8('frameLength', 1)
  .word8('syncNo', 1)
  .word8('reserved', 1)
  .word8('frameType', 1)

/* packets */
export function parsePacketHeader(buffer) {
  HeaderFrameFormat._setBuff(buffer)
  return HeaderFrameFormat.fields
}

export function parseResPacket(buffer) {
  var header = parsePacketHeader(buffer)
  var data = buffer.slice(SIZE_HEADER)

  return {
    header,
    data
  }
}

// data type
export const DTYPESIZES = {
  char: 1,
  bool: 1,
  int: 4,
  float: 4,
  double: 8
}

export const DTRANSFORM = {
  char: {
    serializer(x) {
      return Buffer.from(Uint8Array.from([x.charCodeAt(0)]))
    },
    deserializer(buffer) {
      return String.fromCharCode(buffer.readUInt8(0))
    }
  },
  bool: {
    serializer(x) {
      return Buffer.alloc(1, x)
    },
    deserializer(buffer) {
      return !!buffer.readUInt8(0)
    }
  },
  byte: {
    serializer(x) {
      var buffer = Buffer.alloc(1)
      buffer.writeUint8(x)
      return buffer
    },
    deserializer(buffer) {
      return buffer.readUInt8(0)
    }
  },
  int: {
    serializer(x) {
      var buffer = Buffer.alloc(4)
      buffer.writeInt32LE(x)
      return buffer
    },
    deserializer(buffer) {
      return buffer.readUInt32LE(0)
    }
  },
  uint: {
    serializer(x) {
      var buffer = Buffer.alloc(4)
      buffer.writeUInt32LE(x)
      return buffer
    },
    deserializer(buffer) {
      return buffer.readUInt32LE(0)
    }
  },
  uint16: {
    serializer(x) {
      var buffer = Buffer.alloc(2)
      buffer.writeUInt16LE(x)
      return buffer
    },
    deserializer(buffer) {
      return buffer.readUInt16LE(0)
    }
  },
  float: {
    serializer(x) {
      var buffer = Buffer.alloc(4)
      buffer.writeFloatLE(x)
      return buffer
    },
    deserializer(buffer) {
      return buffer.readFloatLE(0)
    }
  },
  double: {
    serializer(x) {
      var buffer = Buffer.alloc(8)
      buffer.writeDoubleLE(x)
      return buffer
    },
    deserializer(buffer) {
      return buffer.readDoubleLE(0)
    }
  },
  string: {
    serializer(xs) {
      return Buffer.from(xs) /* default 'utf8' */
    },
    deserializer(buffer) {
      return buffer.toString() /* default 'utf8' */
    }
  },
  bools: {
    serializer(xs) {
      return Buffer.from(Uint8Array.from(xs.map(x => (x ? 1 : 0))))
    },
    deserializer(buffer) {
      var array = []
      array.push.apply(array, Uint8Array.from(buffer))
      return array.map(x => !!x)
    }
  },
  ints: {
    serializer(xs) {
      var buffer = Buffer.alloc(4 * xs.length)
      xs.forEach((x, i) => buffer.writeInt32LE(x, i * 4))
      return buffer
    },
    deserializer(buffer) {
      var array = []
      for (let i = 0; i < Math.floor(buffer.length / 4); i++) {
        array.push(buffer.readInt32LE(i * 4))
      }
      return array
    }
  },
  floats: {
    serializer(xs) {
      var buffer = Buffer.alloc(4 * xs.length)
      xs.forEach((x, i) => buffer.writeFloatLE(x, i * 4))
      return buffer
    },
    deserializer(buffer) {
      var array = []
      for (let i = 0; i < Math.floor(buffer.length / 4); i++) {
        array.push(buffer.readFloatLE(i * 4))
      }
      return array
    }
  },
  doubles: {
    serializer(xs) {
      var buffer = Buffer.alloc(8 * xs.length)
      xs.forEach((x, i) => buffer.writeDoubleLE(x, i * 8))
      return buffer
    },
    deserializer(buffer) {
      var array = []
      for (let i = 0; i < Math.floor(buffer.length / 8); i++) {
        array.push(buffer.readDoubleLE(i * 8))
      }
      return array
    }
  },
  buffer: {
    serializer(buffer) {
      return buffer || Buffer.alloc(0)
    },
    deserializer(buffer) {
      return buffer || Buffer.alloc(0)
    }
  }
}

export function getSerializer(type) {
  if (type instanceof Array) {
    return function (...args) {
      var serializers = type.map(t => getSerializer(t))
      var result = Buffer.concat(serializers.map((serializer, i) => serializer.apply(null, [args[i]])))
      console.log('array packet', args, result)
      return result
    }
  } else {
    var transformer = DTRANSFORM[type] || DTRANSFORM['buffer']
    return transformer.serializer
  }
}

export function getDeserializer(type) {
  if (type instanceof Array) {
    return function (buffer) {
      /* 주의 : deserializer는 array에 복수형 타입을 지원하지 않음 - 길이를 알 수 없기 때문. */
      var deserializers = type.map(t => getDeserializer(t))
      var offset = 0
      return deserializers.map((deserializer, i) => {
        var size = DTYPESIZES[type[i]]
        var value = deserializer.call(null, buffer.slice(offset, size))
        offset += size

        return value
      })
    }
  } else {
    var transformer = DTRANSFORM[type] || DTRANSFORM['buffer']
    return transformer.deserializer
  }
}

// packet util functions
export function buildReqPacket(
  client: IEziServo,
  command: number,
  reqData?: any,
  reqDataSize?: number
): { header: any; buffer: Buffer } {
  var header = HeaderFrameFormat.allocate().fields
  var buffer = HeaderFrameFormat.buffer()

  reqDataSize = reqDataSize || reqData?.length || 0

  header.header = 0xaa
  header.frameLength = reqDataSize ? reqDataSize + SIZE_FRAMELEN_HEADER : SIZE_FRAMELEN_HEADER
  header.syncNo = ++client.syncNo

  header.reserved = 0x00
  header.frameType = command
  header.dataSize = reqDataSize

  if (reqDataSize > 0) {
    return {
      header,
      buffer: Buffer.concat([buffer, reqData], buffer.length + reqDataSize)
    }
  }

  return {
    header,
    buffer
  }
}
