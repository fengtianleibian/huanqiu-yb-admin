import {getToken} from '@/utils/auth'

const WebSocketPlugin = {
  install(Vue) {

    var token = getToken()

    const socket = new WebSocket('ws://127.0.0.1:10000/socket?Token=' + token);

    socket.onopen = () => {
      console.log('WebSocket连接已打开');
    };

    socket.onmessage = event => {
      console.log('收到消息:', event.data);
      Vue.prototype.$socket.$emit('message', event.data);
    };

    socket.onclose = () => {
      console.log('WebSocket连接已关闭');
      // 可以在此处理连接关闭的逻辑，例如尝试重新连接
    };

    Vue.prototype.$socket = socket;
  },
};

export default WebSocketPlugin;
