<template>
  <div class="app-container">
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户ID" prop="userId">
        <el-input v-model="queryParams.userId" placeholder="请输入用户ID" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="模板编码" prop="templateCode">
        <el-input v-model="queryParams.templateCode" placeholder="请输入模板编码" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="模版类型" prop="templateType">
        <el-select v-model="queryParams.templateType" placeholder="请选择模版类型" clearable size="small">
          <el-option label="通知公告" :value="1"/>
          <el-option label="系统消息" :value="2"/>
          <el-option label="订单消息" :value="3"/>
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker v-model="dateRange"
                        style="width: 240px"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        type="daterange"
                        range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"
                        :default-time="['00:00:00', '23:59:59']"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list">
      <el-table-column label="编号" align="center" prop="id"/>
      <el-table-column label="用户ID" align="center" prop="userId"/>
      <el-table-column label="模板编码" align="center" prop="templateCode"/>
      <el-table-column label="发送人名称" align="center" prop="templateNickname"/>
      <el-table-column label="模版内容" align="center" prop="templateContent"/>
      <el-table-column label="模版类型" align="center" prop="templateType">
        <template v-slot="scope">
          <span v-if="scope.row.templateType === 1"><el-tag type="primary">通知公告</el-tag></span>
          <span v-if="scope.row.templateType === 2"><el-tag type="info">系统消息</el-tag></span>
          <span v-if="scope.row.templateType === 3"><el-tag type="warning">订单消息</el-tag></span>
        </template>
      </el-table-column>
      <el-table-column label="是否已读" align="center" prop="readStatus">
        <template v-slot="scope">
          <span v-if="scope.row.readStatus === 0"><el-tag type="primary">未读</el-tag></span>
          <span v-if="scope.row.readStatus === 1"><el-tag type="danger">已读</el-tag></span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="阅读时间" align="center" prop="updateTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-view" @click="handleView(scope.row)">详细
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>

    <!-- 站内信详细-->
    <el-dialog :title="title" :visible.sync="open" width="700px" v-dialogDrag append-to-body>
      <el-form ref="form" :model="form" label-width="160px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="日志主键：">{{ form.id }}</el-form-item>
            <el-form-item label="发送时间：">{{ parseTime(form.createTime) }}</el-form-item>
            <el-form-item label="用户编号：">{{ form.userId }}</el-form-item>
            <el-form-item label="模板编号：">{{ form.templateId }}</el-form-item>
            <el-form-item label="模板编码：">{{ form.templateCode }}</el-form-item>
            <el-form-item label="模板类型：">
              <span v-if="form.templateType === 1"><el-tag type="primary">通知公告</el-tag></span>
              <span v-if="form.templateType === 2"><el-tag type="info">系统消息</el-tag></span>
              <span v-if="form.templateType === 3"><el-tag type="warning">订单消息</el-tag></span>
            </el-form-item>
            <el-form-item label="模版发送人名称：">{{ form.templateNickname }}</el-form-item>
            <el-form-item label="邮件内容：">{{ form.templateContent }}</el-form-item>
            <el-form-item label="模版参数：">{{ form.templateParams }}</el-form-item>
            <el-form-item label="是否已读：">
              <span v-if="form.readStatus === 0"><el-tag type="danger">未读</el-tag></span>
              <span v-if="form.readStatus === 1"><el-tag type="success">已读</el-tag></span>
            </el-form-item>
            <el-form-item label="阅读时间：">{{ parseTime(form.updateTime) }}</el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {getNotifyMessagePage} from "@/api/system/notify/message";

export default {
  name: "SystemNotifyMessage",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 站内信消息列表
      list: [],
      // 弹出层标题
      title: "站内信详细",
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        userId: null,
        userType: null,
        templateCode: null,
        templateType: null,
        createTime: [],
      },
      // 表单参数
      form: {},
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      // 执行查询
      getNotifyMessagePage(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        if (response.code === 200) {
          this.list = response.content.list;
          this.total = response.content.total;
          this.loading = false;
        } else {
          this.$modal.msgError(response.message);
        }
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 详细按钮操作 */
    handleView(row) {
      this.open = true;
      this.form = row;
    }
  }
};
</script>
