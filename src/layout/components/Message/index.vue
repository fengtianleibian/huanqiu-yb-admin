<template>
  <div>
    <el-popover placement="bottom" width="600" trigger="click">
      <!-- icon 展示 -->
      <el-badge slot="reference" :is-dot="unreadCount > 0" type="danger">
        <svg-icon icon-class="message" @click="getList"/>
      </el-badge>

      <!-- 弹出列表 -->
      <el-table v-loading="loading" :data="list">
        <el-table-column width="180" align="center" property="createTime" label="发送时间">
          <template v-slot="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" align="center" prop="templateType" width="100">
          <template v-slot="scope">
            <span v-if="scope.row.templateType === 1"><el-tag type="primary">通知公告</el-tag></span>
            <span v-if="scope.row.templateType === 2"><el-tag type="info">系统消息</el-tag></span>
            <span v-if="scope.row.templateType === 3"><el-tag type="warning">订单消息</el-tag></span>
          </template>
        </el-table-column>
        <el-table-column property="templateContent" align="center" label="内容"/>
      </el-table>

      <!-- 更多 -->
      <div style="text-align: right; margin-top: 10px">
        <el-button type="primary" size="mini" @click="goMyList">查看全部</el-button>
      </div>
    </el-popover>
  </div>
</template>

<script>
import {getUnreadNotifyMessageCount, getUnreadNotifyMessageList} from "@/api/system/notify/message";

export default {
  name: 'NotifyMessage',
  data() {
    return {
      // 遮罩层
      loading: false,
      // 列表
      list: [],
      // 未读数量,
      unreadCount: 0,
    }
  },
  created() {
    // 首次加载小红点
    this.getUnreadCount()
    // 轮询刷新小红点
    setInterval(() => {
      this.getUnreadCount()
    }, 1000 * 60 * 2)
  },
  methods: {
    getList: function () {
      this.loading = true;
      getUnreadNotifyMessageList().then(response => {
        if (response.code === 200) {
          this.list = response.content;
          this.loading = false;
          // 强制设置 unreadCount 为 0，避免小红点因为轮询太慢，不消除
          this.unreadCount = 0
        } else {
          this.$modal.msgError(response.message);
        }
      });
    },

    getUnreadCount: function () {
      // getUnreadNotifyMessageCount().then(response => {
      //
      //   if (response.code === 200) {
      //     this.unreadCount = response.content;
      //   } else {
      //     this.$modal.msgError(response.message);
      //   }
      // })
    },
    goMyList: function () {
      this.$router.push({
        name: 'MyNotifyMessage'
      });
    }
  }
}
</script>
<style>
.el-badge__content.is-fixed {
  top: 10px; /* 保证徽章的位置 */
}
</style>
