import {getToken} from "@/utils/auth";

// 连接地址
let WSS_URL = ""
// socket实例
let Socket = ''
//心跳定时
let setIntervalWesocketPush = null

export function tokensFun(tokens) {
  WSS_URL = `ws://127.0.0.1:10000/socket?Token=${tokens}`
}

// 建立连接
export function createSocket(path) {
  if (path) WSS_URL = path
  if (!Socket) {
    Socket = new WebSocket(WSS_URL)
    Socket.onopen = onopenWS
    Socket.onmessage = onmessageWS
    Socket.onerror = onerrorWS
    Socket.onclose = oncloseWS
  } else {
    // console.log('websocket已连接')
    // sendWSPush()
  }
}

// 打开WS之后发送心跳
export function onopenWS() {
  sendPing() //发送心跳
}

// 连接失败重连
export function onerrorWS() {
  clearInterval(setIntervalWesocketPush)
  Socket.close()
  createSocket() //重连
}

// WS数据接收统一处理
export function onmessageWS(e) {
  window.dispatchEvent(new CustomEvent('onmessageWS', {
    detail: {
      data: e
    }
  }))
}

/**发送数据
 1. @param eventType
 */
export function sendWSPush(eventTypeArr, path) {
  const obj = eventTypeArr
  if (Socket !== null && Socket.readyState === 3) {
    Socket.close()
    createSocket() //重连
  } else if (Socket.readyState === 1) {
    Socket.send(obj)
  } else if (Socket.readyState === 0) {
    setTimeout(() => {
      Socket.send(obj)
    }, 5000)
  }
}


/**关闭WS */
export function oncloseWS() {
  clearInterval(setIntervalWesocketPush)
  // console.log('websocket已断开')
}

/**发送心跳 */
export function sendPing() {
  // Socket.send('ping')
  // setIntervalWesocketPush = setInterval(() => {
  //     Socket.send('ping')
  // }, 50000)
}
