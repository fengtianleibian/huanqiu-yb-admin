<template>
  <div class="app-container">
    <!-- 标签页切换 -->
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="充值渠道" name="recharge">
        <payment-recharge-channel ref="rechargeChannel" />
      </el-tab-pane>
      <el-tab-pane label="代收手续费" name="processingFee">
        <order-processing-fee ref="processingFee" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import PaymentRechargeChannel from './payment_recharge_channel/index.vue'
import OrderProcessingFee from './order_processing_fee/index.vue'

export default {
  name: "PaymentChannelManager",
  components: {
    PaymentRechargeChannel,
    OrderProcessingFee
  },
  data() {
    return {
      activeTab: 'recharge' // 默认激活充值渠道标签页
    }
  },
  methods: {
    handleTabClick(tab) {
      // 标签页切换时的处理逻辑
      console.log('切换到标签页:', tab.name)
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.el-tabs {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.el-tabs__content {
  padding: 20px;
}
</style>
