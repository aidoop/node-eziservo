/* Indy Client Interface */
export interface IEziServo {
  lock
  socket
  serverIp
  servoModel
  syncNo

  connect()
  disconnect()
  shutdown()
  handleCommand(command, reqData, reqDataSize): Promise<{ errorCode; resData; resDataSize }>
}
