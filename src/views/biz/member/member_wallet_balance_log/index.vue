<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="用户ID" prop="memberId">
        <el-input
          v-model="queryParams.memberId"
          placeholder="请输入用户ID"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="操作类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择操作类型" clearable>
          <el-option
            v-for="item in typeOptions"
            :key="item.type"
            :label="item.content"
            :value="item.type"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRange"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="memberWalletBalanceLogList" style="width: 100%">
      <el-table-column label="ID" align="center" prop="id"/>
      <el-table-column label="用户ID" align="center" prop="memberId"/>
      <el-table-column label="操作前资金" align="center" prop="balanceBefore">
        <template slot-scope="scope">
          <span>{{ formatNumber(scope.row.balanceBefore) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作资金" align="center" prop="balance">
        <template slot-scope="scope">
          <span :class="scope.row.balance > 0 ? 'text-success' : 'text-danger'">
            {{ scope.row.balance > 0 ? '+' : '' }}{{ formatNumber(scope.row.balance) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作后资金" align="center" prop="balanceAfter">
        <template slot-scope="scope">
          <span>{{ formatNumber(scope.row.balanceAfter) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作类型" align="center" prop="type">
        <template slot-scope="scope">
          <el-tag type="primary">{{ getTypeName(scope.row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip/>
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import {listMemberWalletBalanceLog, getBalanceLogTypeList} from "@/api/biz/memberWalletBalanceLog";

export default {
  name: "MemberWalletBalanceLog",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户钱包余额日志表格数据
      memberWalletBalanceLogList: [],
      // 操作类型选项
      typeOptions: [],
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        memberId: undefined,
        type: undefined,
        beginTime: undefined,
        endTime: undefined
      }
    };
  },
  created() {
    this.getTypeList();
    this.getList();
  },
  methods: {
    /** 查询操作类型列表 */
    getTypeList() {
      getBalanceLogTypeList().then(response => {
        if (response.code === 200) {
          this.typeOptions = response.content || [];
        }
      }).catch(() => {
        this.typeOptions = [];
      });
    },
    /** 查询用户钱包余额日志列表 */
    getList() {
      this.loading = true;
      this.addDateRange();
      listMemberWalletBalanceLog(this.queryParams).then(response => {
        if (response.code === 200) {
          this.memberWalletBalanceLogList = response.content && response.content.list ? response.content.list : [];
          this.total = response.content && response.content.total ? response.content.total : 0;
          this.loading = false;
        } else {
          this.$modal.msgError(response.message);
        }
      }).catch(() => {
        this.memberWalletBalanceLogList = [];
        this.total = 0;
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.queryParams.beginTime = undefined;
      this.queryParams.endTime = undefined;
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 添加日期范围 */
    addDateRange() {
      if (this.dateRange != null && this.dateRange.length === 2) {
        this.queryParams.beginTime = this.dateRange[0];
        this.queryParams.endTime = this.dateRange[1];
      }
    },
    /** 格式化数字显示 */
    formatNumber(value) {
      if (value == null) return '0.00';
      return Number(value).toFixed(2);
    },
    /** 获取操作类型名称 */
    getTypeName(type) {
      const typeOption = this.typeOptions.find(item => item.type === String(type));
      return typeOption ? typeOption.content : '未知';
    }
  }
};
</script>

<style scoped>
.text-success {
  color: #67c23a;
}

.text-danger {
  color: #f56c6c;
}
</style>
