/* Robot Type */
export const ROBOT_INDY7 = 'NRMK-Indy7'
export const ROBOT_INDYRP2 = 'NRMK-IndyRP2'
export const ROBOT_INDY12 = 'NRMK-Indy12'

/* DirectVariableType */
export enum DirectVariableType {
  ERROR = -1,
  BYTE = 0,
  WORD = 1,
  DWORD = 2,
  LWORD = 3,
  FLOAT = 4,
  DFLOAT = 5,
  MODBUS_REG = 10
}

/* End Tool Type */
export enum EndToolType {
  NPN,
  PNP,
  NoUse,
  eModi
}

/* Task Base Mode */
export enum TaskBaseMode {
  REFERENCE_BODY,
  END_EFFECT_TOOL_TIP
}

/* Indy Client Interface */
export interface IEziServo {
  lock
  socket
  serverIp
  servoModel

  connect()
  disconnect()
  shutdown()
  handleCommand(command, reqData, reqDataSize): Promise<{ errorCode; resData; resDataSize; resStatus }>
}
