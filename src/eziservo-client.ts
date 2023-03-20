import AwaitLock from 'await-lock'
import { Socket } from 'net'
import PromiseSocket from 'promise-socket'

import { mutex, packet } from './decorators'
import { IEziServo } from './eziservo-interface'
import { FrameType } from './frame-type'
import { buildReqPacket, parsePacketHeader, SIZE_DATA_TCP_MAX, SIZE_FRAMELENGTH_OFFSET, SIZE_HEADER } from './packet'

/* Indy Client Class */
export class EziServo implements IEziServo {
  public lock
  public socket
  public serverIp
  public servoModel
  public syncNo

  private _lock
  private _serverPort

  constructor(serverIp, servoModel = 'Plus-E') {
    this._lock = new AwaitLock()

    this.lock = this._lock
    this.socket
    this.serverIp = serverIp
    this._serverPort = 2002
    this.servoModel = servoModel
    this.syncNo = 0
  }

  async connect() {
    const socket = new Socket()
    socket.setKeepAlive(true, 60000)

    this.socket = new PromiseSocket(socket)

    await this.socket.connect(this._serverPort, this.serverIp)

    console.log(`Connect: Server IP (${this.serverIp})`)
  }

  disconnect() {
    this.socket && this.socket.destroy()
    this.socket = null
    // this._lock?.release()
  }

  shutdown() {
    this.disconnect()
  }

  async _sendMessage(buf) {
    await this.socket.write(buf)
  }

  async _recvMessage() {
    var message = await this.socket.read()
    if (!message) {
      throw new Error('socket closed')
    }
    return message
  }

  @mutex
  async handleCommand(command, reqBuffer?, reqBufferSize?): Promise<{ errorCode; resData; resDataSize; resStatus }> {
    if (!this.socket) {
      throw new Error('socket closed normally')
    }

    var { header: reqHeader, buffer } = buildReqPacket(this, command, reqBuffer, reqBufferSize)
    await this._sendMessage(buffer)

    // receive data from ezi
    var recvMsg = await this._recvMessage()
    //var recvMsg = Buffer.from([0xaa, 0x9, 0xee, 0x00, 0x01, 0x10, 0x33, 0x34, 0x35, 0x36, 0x00])

    var resHeader = parsePacketHeader(recvMsg)

    // receive data from socket
    var resDataSize = resHeader.frameLength

    if (resDataSize > SIZE_DATA_TCP_MAX || resDataSize < 0) {
      console.log(`Response data size is invalid ${resDataSize} (max: {}): Disconnected`)
    } else if (resDataSize > 0) {
      var resStatus = recvMsg[SIZE_HEADER]
      var resData = recvMsg.slice(SIZE_HEADER, SIZE_HEADER + resDataSize - SIZE_FRAMELENGTH_OFFSET)
    }

    // TODO: check recv status here...
    let errorCode = 0

    return {
      errorCode,
      resData,
      resDataSize,
      resStatus
    }
  }

  @packet(FrameType.FAS_GetboardInfo, null, 'string')
  getBoardInfo() {}

  @packet(FrameType.FAS_GetMotorInfo, null, 'string')
  getMotorInfo() {}

  @packet(FrameType.FAS_SaveAllParameters, null, null)
  saveAllParameters() {}

  @packet(FrameType.FAS_GetRomParameter, 'char', 'int')
  getRomParameters(paramNum) {}

  @packet(FrameType.FAS_SetParameter, ['char', 'int'], null)
  setParameters(paramNum, paramValue) {}

  @packet(FrameType.FAS_GetParameter, 'char', 'int')
  getParameters(paramNum) {}

  @packet(FrameType.FAS_SetIOOutput, ['bools', 'bools'], null)
  setIOOutput(setMask, clearMask) {}

  @packet(FrameType.FAS_SetIOInput, ['bools', 'bools'], null)
  setIOInput(setMask, clearMask) {}

  @packet(FrameType.FAS_GetIOInput, null, 'bools')
  getIOInput() {}

  @packet(FrameType.FAS_GetIOOutput, null, 'bools')
  getIOOutput() {}

  @packet(FrameType.FAS_SetIOAssignMap, ['char', 'bools', 'bool'], null)
  setIOAssignMap(ioNum, ioPinMasking, level) {}

  @packet(FrameType.FAS_GetIOAssignMap, 'char', ['bools', 'char'])
  getIOAssignMap(ioNum) {}

  @packet(FrameType.FAS_IOAssignMapReadROM, null, 'char')
  ioAssignMapReadROM() {}

  @packet(FrameType.FAS_TriggerOutput_RunA, ['char', 'int', 'int', 'int', 'char', 'int'], 'char')
  triggerOutputRunA(startOrFin, startPos, pulsePeriod, pulseWidth, outputPin = 0, dummy = 0) {}

  @packet(FrameType.FAS_TriggerOutput_Status, null, 'char')
  triggerOutputStatus() {}

  @packet(FrameType.FAS_SetTriggerOutputEx, ['char', 'char', 'word', 'char', 'ints'], null)
  setTriggerOutputEx(userOut, startOrFin, outputOnTime, outPosCnt, outPosArr) {}

  @packet(FrameType.FAS_GetTriggerOutputEx, 'char', ['char', 'word', 'char', 'ints'])
  getTriggerOutputEx(userOut) {}

  @packet(FrameType.FAS_ServoEnable, 'bool', null)
  setServoEnable(flag) {}

  @packet(FrameType.FAS_ServoAlarmReset, null, null)
  setServoAlarmReset() {}

  @packet(FrameType.FAS_GetAlarmType, null, 'char')
  getAlaramType() {}

  @packet(FrameType.FAS_MoveStop, null, null)
  stopMove() {}

  @packet(FrameType.FAS_EmergencyStop, null, null)
  stopEmergency() {}

  @packet(FrameType.FAS_MoveOriginSingleAxis, null, null)
  moveOriginSingleAxis() {}

  @packet(FrameType.FAS_MoveSingleAxisAbsPos, ['int', 'int'], null)
  moveSingleAxisAbsPos(absPos, drvSpeed) {}

  @packet(FrameType.FAS_MoveSingleAxisIncPos, ['int', 'int'], null)
  moveSingleAxisIncPos(relPos, drvSpeed) {}

  @packet(FrameType.FAS_MoveToLimit, ['int', 'char'], null)
  moveToLimit(drvSpeed, drvDirection) {}

  @packet(FrameType.FAS_MoveVelocity, ['int', 'char'], null)
  moveVelocity(drvSpeed, drvDirection) {}

  @packet(FrameType.FAS_PositionAbsOverride, 'int', null)
  overridePositionAbs(changedPos) {}

  @packet(FrameType.FAS_PositionIncOverride, 'int', null)
  overridePositionInc(changedPos) {}

  @packet(FrameType.FAS_VelocityOverride, 'int', null)
  overrideVelocity(changedVel) {}

  @packet(FrameType.FAS_GetAllStatus, null, ['int', 'bools', 'bools', 'bools', 'uint', 'int', 'int', 'int'])
  getAllStatus() {}
}
