import AwaitLock from 'await-lock'
import { Socket } from 'net'
import PromiseSocket from 'promise-socket'

import { mutex, packet } from './decorators'
import { IEziServo } from './eziservo-interface'
import { FrameType } from './frame-type'
import {
  buildReqPacket,
  parsePacketHeader,
  SIZE_DATA_TCP_MAX,
  SIZE_FRAMELEN_HEADER,
  SIZE_HEADER,
  SIZE_STATUS
} from './packet'

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
  async handleCommand(command, reqBuffer?, reqBufferSize?): Promise<{ errorCode; resData; resDataSize }> {
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
      var resData = recvMsg.slice(SIZE_HEADER + SIZE_STATUS, resDataSize + SIZE_FRAMELEN_HEADER)
    }

    // TODO: check recv status here...
    let errorCode = resStatus

    return {
      errorCode,
      resData,
      resDataSize
    }
  }

  @packet(FrameType.FAS_GetboardInfo, null, 'string')
  getBoardInfo() {}

  @packet(FrameType.FAS_GetMotorInfo, null, 'string')
  getMotorInfo() {}

  @packet(FrameType.FAS_SaveAllParameters, null, null)
  saveAllParameters() {}

  @packet(FrameType.FAS_GetRomParameter, 'byte', 'int')
  getRomParameters(paramNum) {}

  @packet(FrameType.FAS_SetParameter, ['byte', 'int'], null)
  setParameters(paramNum, paramValue) {}

  @packet(FrameType.FAS_GetParameter, 'byte', 'int')
  getParameters(paramNum) {}

  @packet(FrameType.FAS_SetIOOutput, ['uint', 'uint'], null)
  setIOOutput(setMask, clearMask) {}

  @packet(FrameType.FAS_SetIOInput, ['uint', 'uint'], null)
  setIOInput(setMask, clearMask) {}

  @packet(FrameType.FAS_GetIOInput, null, 'uint')
  getIOInput() {}

  @packet(FrameType.FAS_GetIOOutput, null, 'uint')
  getIOOutput() {}

  @packet(FrameType.FAS_SetIOAssignMap, ['byte', 'uint', 'bool'], null)
  setIOAssignMap(ioNum, ioPinMasking, level) {}

  @packet(FrameType.FAS_GetIOAssignMap, 'byte', ['uint', 'bool'])
  getIOAssignMap(ioNum) {}

  @packet(FrameType.FAS_IOAssignMapReadROM, null, 'byte')
  ioAssignMapReadROM() {}

  // TODO: 패킷이 문서의 내용과 다름. 문서는 1 byte의 값을 준다고 되어 있지만 실제로 받아보면 아무런 결과 값을 주지 않는다.
  @packet(FrameType.FAS_TriggerOutput_RunA, ['byte', 'uint', 'uint', 'uint', 'byte', 'uint'], null /*'byte'*/)
  triggerOutputRunA(startOrFin, startPos, pulsePeriod, pulseWidth, outputPin = 0, dummy = 0) {}

  @packet(FrameType.FAS_TriggerOutput_Status, null, 'byte')
  triggerOutputStatus() {}

  @packet(FrameType.FAS_SetTriggerOutputEx, ['byte', 'byte', 'uint16', 'byte', 'ints'], null)
  setTriggerOutputEx(userOut, startOrFin, outputOnTime, outPosCnt, outPosArr) {}

  @packet(FrameType.FAS_GetTriggerOutputEx, 'byte', ['byte', 'uint16', 'byte', 'ints'])
  getTriggerOutputEx(userOut) {}

  @packet(FrameType.FAS_ServoEnable, 'bool', null)
  setServoEnable(flag) {}

  @packet(FrameType.FAS_ServoAlarmReset, null, null)
  setServoAlarmReset() {}

  @packet(FrameType.FAS_GetAlarmType, null, 'byte')
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

  @packet(FrameType.FAS_MoveToLimit, ['int', 'byte'], null)
  moveToLimit(drvSpeed, drvDirection) {}

  @packet(FrameType.FAS_MoveVelocity, ['int', 'byte'], null)
  moveVelocity(drvSpeed, drvDirection) {}

  @packet(FrameType.FAS_PositionAbsOverride, 'int', null)
  overridePositionAbs(changedPos) {}

  @packet(FrameType.FAS_PositionIncOverride, 'int', null)
  overridePositionInc(changedPos) {}

  @packet(FrameType.FAS_VelocityOverride, 'int', null)
  overrideVelocity(changedVel) {}

  @packet(FrameType.FAS_MoveSingleAxisAbsPosEx, ['int', 'int', 'int', 'uint16', 'uint16', 'buffer'], null)
  moveSingleAxisAbsPosEx(absPos, drvVelocity, flag, customAccelTime, customDecelTime, buffer) {}

  @packet(FrameType.FAS_MoveSingleAxisIncPosEx, ['int', 'int', 'int', 'uint16', 'uint16', 'buffer'], null)
  moveSingleAxisAbsIncEx(relPos, drvVelocity, flag, customAccelTime, customDecelTime, buffer) {}

  @packet(FrameType.FAS_MoveVelocityEx, ['int', 'byte', 'uint', 'uint16', 'buffer'], null)
  moveVelocityEx(drvVel, drvDir, flag, customAccelDecelTime, buffer) {}

  @packet(FrameType.FAS_GetAxisStatus, null, 'uint')
  getAxisStatus() {}

  @packet(FrameType.FAS_GetIOAxisStatus, null, ['byte', 'uint', 'uint', 'uint'])
  getIOAxisStatus() {}

  @packet(FrameType.FAS_GetMotionStatus, null, ['byte', 'uint', 'uint', 'uint', 'int', 'uint'])
  getMotionStatus() {}

  @packet(FrameType.FAS_GetAllStatus, null, ['byte', 'uint', 'uint', 'uint', 'uint', 'int', 'int', 'int', 'int'])
  getAllStatus() {}

  @packet(FrameType.FAS_SetCommandPos, 'uint', null)
  setCommandPos(pos) {}

  @packet(FrameType.FAS_GetCommandPos, null, 'int')
  getCommandPos() {}

  @packet(FrameType.FAS_SetActualPos, 'uint', null)
  setActualPos(pos) {}

  @packet(FrameType.FAS_GetActualPos, null, 'uint')
  getActualPos() {}

  @packet(FrameType.FAS_GetPosError, null, 'uint')
  getPosError() {}

  @packet(FrameType.FAS_GetActualVel, null, 'uint')
  getActualVel() {}

  @packet(FrameType.FAS_ClearPosition, null, null)
  clearPos() {}

  @packet(FrameType.FAS_MovePause, 'byte', null)
  movePause(pause) {}

  @packet(FrameType.FAS_PosTableReadItem, 'uint16', 'buffer')
  posTableReadItem(ptNum) {}

  @packet(FrameType.FAS_PosTableWriteItem, ['uint16', 'buffer'], 'byte')
  posTableWriteItem(ptNum, value) {}

  @packet(FrameType.FAS_PosTableReadROM, null, 'byte')
  posTableReadRom() {}

  @packet(FrameType.FAS_PosTableWriteROM, null, 'byte')
  posTableWriteRom() {}

  @packet(FrameType.FAS_PosTableRunItem, 'uint16', null)
  posTableRunItem(ptNum) {}

  @packet(FrameType.FAS_PosTableReadOneItem, ['uint16', 'uint16'], 'uint32')
  posTableReadOneItem(ptNum, offset) {}

  @packet(FrameType.FAS_PosTableWriteOneItem, ['uint16', 'uint16', 'uint'], 'byte')
  posTableWriteOneItem(ptNum, offset, value) {}

  @packet(FrameType.FAS_MovePush, ['uint', 'uint', 'int', 'uint16', 'uint16', 'uint16', 'uint', 'int', 'uint16'], null)
  movePush(startPos, drvVel, absPos, accelTime, dcelTime, pushTorque, pushDrvVel, pushAbsPos, pushMode) {}

  @packet(FrameType.FAS_GetPushStatus, null, 'byte')
  getPushStatus() {}
}
