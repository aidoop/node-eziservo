import { getErrorCodeString } from './error-code'
import { getDeserializer, getSerializer } from './packet'

export const mutex = (target: Object, property: string, descriptor: TypedPropertyDescriptor<any>): any => {
  const method = descriptor.value

  descriptor.value = async function (...args) {
    await this.lock.acquireAsync()
    var retval = await method.apply(this, args)
    this.lock.release()

    return retval
  }

  return descriptor
}

export const packet =
  (command, reqDataType?, resDataType?) =>
  (target: Object, property: string, descriptor: TypedPropertyDescriptor<any>): any => {
    const method = descriptor.value

    descriptor.value = async function (...args) {
      var { serializer, deserializer } = (await method.apply(this, args)) || {}
      // var data = args[0]
      var reqData

      serializer = serializer || (reqDataType && getSerializer(reqDataType))
      if (serializer) {
        reqData = serializer.apply(null, args)
      }

      var { errorCode, resData, resDataSize } = await this.handleCommand(command, reqData)
      if (errorCode) {
        console.error(`received error code(${errorCode}, ${getErrorCodeString(errorCode)}) - command(${command})`)
        return errorCode
      }

      // TODO: handle error codes here.. need to consider it

      var result = resData
      if (resDataType) {
        result = getDeserializer(resDataType)(result)
      }
      if (deserializer) {
        result = deserializer(result)
      }

      return result
    }

    return descriptor
  }
