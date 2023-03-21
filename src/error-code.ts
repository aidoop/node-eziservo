/* Error codes */
const eziServoErrorString = {
  0x00: 'success',
  0x80: 'frame type error',
  0x81: 'data error',
  0x82: 'recv frame format error',
  0x85: 'drive command error',
  0x86: 'reset failure',
  0x87: 'servo on failure during alarm',
  0x88: 'servo on failure during emergency stop',
  0x89: 'servo on failure by external servo signal only'
}

export function getErrorCodeString(errorCode) {
  return eziServoErrorString[errorCode] || `unknown code error: ${errorCode}`
}
