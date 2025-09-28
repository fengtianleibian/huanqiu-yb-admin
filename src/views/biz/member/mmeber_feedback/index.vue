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
      <el-form-item label="用户名" prop="memberName">
        <el-input
          v-model="queryParams.memberName"
          placeholder="请输入用户名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="反馈类型" prop="feedbackType">
        <el-select v-model="queryParams.feedbackType" placeholder="请选择反馈类型" clearable>
          <el-option
            v-for="item in feedbackTypeOptions"
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

    <el-table v-loading="loading" :data="memberFeedbackList" style="width: 100%">
      <el-table-column label="用户ID" align="center" prop="memberId"/>
      <el-table-column label="用户名" align="center" prop="memberName" show-overflow-tooltip/>
      <el-table-column label="反馈类型" align="center" prop="feedbackType">
        <template slot-scope="scope">
          <el-tag type="primary">{{ getFeedbackTypeName(scope.row.feedbackType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="标题" align="center" prop="title" show-overflow-tooltip/>
      <el-table-column label="内容" align="center" prop="content" show-overflow-tooltip/>
      <el-table-column label="人员类型" align="center" prop="type">
        <template slot-scope="scope">
          <el-tag :type="scope.row.type === 1 ? 'success' : 'warning'">
            {{ scope.row.type === 1 ? '会员' : '客服' }}
          </el-tag>
        </template>
      </el-table-column>
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
import {listMemberFeedback, getFeedbackTypeList} from "@/api/biz/memberFeedback";

export default {
  name: "MemberFeedback",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户反馈表格数据
      memberFeedbackList: [],
      // 反馈类型选项
      feedbackTypeOptions: [],
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        parentId: 0,
        memberId: undefined,
        memberName: undefined,
        feedbackType: undefined,
        beginTime: undefined,
        endTime: undefined
      }
    };
  },
  created() {
    this.getFeedbackTypeList();
    this.getList();
  },
  methods: {
    /** 查询反馈类型列表 */
    getFeedbackTypeList() {
      getFeedbackTypeList().then(response => {
        if (response.code === 200) {
          this.feedbackTypeOptions = response.content || [];
        }
      }).catch(() => {
        this.feedbackTypeOptions = [];
      });
    },
    /** 查询用户反馈列表 */
    getList() {
      this.loading = true;
      this.addDateRange();
      listMemberFeedback(this.queryParams).then(response => {
        if (response.code === 200) {
          this.memberFeedbackList = response.content && response.content.list ? response.content.list : [];
          this.total = response.content && response.content.total ? response.content.total : 0;
          this.loading = false;
        } else {
          this.$modal.msgError(response.message);
        }
      }).catch(() => {
        this.memberFeedbackList = [];
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
    /** 获取反馈类型名称 */
    getFeedbackTypeName(feedbackType) {
      const typeOption = this.feedbackTypeOptions.find(item => item.type === String(feedbackType));
      return typeOption ? typeOption.content : '未知';
    }
  }
};
</script>

<style scoped>
</style>
