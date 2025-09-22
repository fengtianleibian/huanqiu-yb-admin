<template>
  <div class="app-container">
    <div style="margin-bottom: 20px;">
      <el-input v-model="path" placeholder="请输入链接地址" style="width:500px;margin-right: 20px;"></el-input>
      <el-button @click="connection">连接</el-button>
    </div>
    <div>
      <el-input v-model="content" style="width:500px;" placeholder="请输入发送内容"></el-input>
      <el-button @click="sendMsg">发送</el-button>
    </div>
    <div style="margin-top: 20px;">
      <div v-for="(item, index) in wsMessage" :key="index">
        <span>{{ item.title }}:{{ item.content }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import {createSocket, sendWSPush} from "@/utils/websocket";

export default {
  name: "Post",
  data() {
    return {
      path: '',
      content: '',
      ws: null,
      wsMessage: [],
      heartInterval: null,
    };
  },
  mounted() {
    window.addEventListener('onmessageWS', this.socketMsg);
  },
  beforeDestroy() {
    window.removeEventListener('onmessageWS', this.socketMsg);

    // Clear the heartbeat interval when the component is destroyed
    if (this.heartInterval) {
      clearInterval(this.heartInterval);
    }
  },
  methods: {
    // 监听消息
    socketMsg(e) {
      console.log('消息体', e);
      let wsData = JSON.parse(e.detail.data.data);
      console.log('收到消息', wsData);
      this.wsMessage.push({title: '消息', content: wsData});
    },

    // 连接
    connection() {
      if (this.ws) {
        this.ws.close();
      }
      this.ws = createSocket(this.path);

      this.startHeartbeat();
    },

    // 发送消息
    sendMsg() {
      sendWSPush(this.content);
      this.wsMessage.push({title: '连接', content: this.content});
    },

    // 启动定时发送“heart”消息
    startHeartbeat() {
      this.heartInterval = setInterval(() => {
        sendWSPush('1|484274955144531968');
        this.wsMessage.push({title: '连接', content: this.content});
      }, 5000); // 每5秒发送一次
    },
  }
};
</script>
