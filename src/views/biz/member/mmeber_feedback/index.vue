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

    <el-table 
      v-loading="loading" 
      :data="memberFeedbackList" 
      style="width: 100%"
      row-key="id"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      :expand-row-keys="expandedRows"
      @expand-change="handleExpandChange"
    >
      <el-table-column type="expand" width="50">
        <template slot-scope="scope">
          <div class="feedback-detail">
            <div class="timeline">
              <!-- 用户原始反馈 -->
              <div class="timeline-item">
                <div class="timeline-marker is-first"></div>
                <div class="timeline-content">
                  <div class="timeline-time">{{ parseTime(scope.row.createTime) }} 首次反馈</div>
                  <div class="feedback-card">
                    <div class="feedback-user">
                      <span class="user-label">用户{{ scope.row.memberName }}反馈:</span>
                    </div>
                    <div class="feedback-content">{{ scope.row.content }}</div>
                  </div>
                </div>
              </div>
              <!-- 子反馈（客服回复） -->
              <div class="timeline-item" v-for="(item, index) in scope.row.children" :key="item.id">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                  <div class="timeline-time">{{ parseTime(item.createTime) }} 客服回复</div>
                  <div class="feedback-card">
                    <div class="feedback-user">
                      <span class="user-label">客服{{ item.memberName }}回复:</span>
                    </div>
                    <div class="feedback-content">{{ item.content }}</div>
                  </div>
                </div>
              </div>
              <div class="add-reply-section">
                <el-button 
                  type="primary" 
                  icon="el-icon-service" 
                  size="small" 
                  @click="handleAddReply(scope.row)"
                >
                  添加回复
                </el-button>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="标题" align="center" prop="title" show-overflow-tooltip/>
      <el-table-column label="反馈用户" align="center" prop="memberName" show-overflow-tooltip/>
      <el-table-column label="问题类型" align="center" prop="feedbackType">
        <template slot-scope="scope">
          <el-tag type="primary">{{ getFeedbackTypeName(scope.row.feedbackType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="反馈内容" align="center" prop="content" show-overflow-tooltip/>
      <el-table-column label="操作" align="center" width="100">
        <template slot-scope="scope">
          <el-button 
            type="danger" 
            icon="el-icon-delete" 
            size="mini" 
            @click="handleDelete(scope.row)"
          ></el-button>
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

    <!-- 添加回复弹窗 -->
    <el-dialog title="添加回复" :visible.sync="replyDialogVisible" width="600px">
      <el-form :model="replyForm" ref="replyForm" label-width="80px">
        <el-form-item label="回复内容:" prop="content">
          <el-input
            v-model="replyForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入回复内容"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="replyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReply">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {listMemberFeedback, getFeedbackTypeList, addFeedback, delFeedback} from "@/api/biz/memberFeedback";

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
      // 展开的行
      expandedRows: [],
      // 回复弹窗显示状态
      replyDialogVisible: false,
      // 回复表单
      replyForm: {
        content: '',
        parentId: null
      },
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
    },
    /** 处理表格展开变化 */
    handleExpandChange(row, expandedRows) {
      if (expandedRows.includes(row)) {
        // 展开时加载子反馈
        this.loadChildrenFeedback(row);
      }
    },
    /** 加载子反馈 */
    loadChildrenFeedback(parentRow) {
      const query = {
        pageNum: 1,
        pageSize: 1000,
        parentId: parentRow.id
      };
      listMemberFeedback(query).then(response => {
        if (response.code === 200) {
          const children = response.content && response.content.list ? response.content.list : [];
          this.$set(parentRow, 'children', children);
        }
      }).catch(() => {
        this.$set(parentRow, 'children', []);
      });
    },
    /** 处理添加回复 */
    handleAddReply(row) {
      this.replyForm.parentId = row.id;
      this.replyForm.content = '';
      this.replyDialogVisible = true;
    },
    /** 提交回复 */
    submitReply() {
      if (!this.replyForm.content.trim()) {
        this.$modal.msgError('请输入回复内容');
        return;
      }
      
      const feedbackData = {
        parentId: this.replyForm.parentId,
        content: this.replyForm.content,
        title: '客服回复'
      };
      
      addFeedback(feedbackData).then(response => {
        if (response.code === 200) {
          this.$modal.msgSuccess('回复成功');
          this.replyDialogVisible = false;
          // 重新加载当前展开行的子反馈
          const parentRow = this.memberFeedbackList.find(item => item.id === this.replyForm.parentId);
          if (parentRow) {
            this.loadChildrenFeedback(parentRow);
          }
        } else {
          this.$modal.msgError(response.message);
        }
      }).catch(() => {
        this.$modal.msgError('回复失败');
      });
    },
    /** 处理删除 */
    handleDelete(row) {
      this.$modal.confirm('是否确认删除该反馈？').then(() => {
        delFeedback(row.id).then(response => {
          if (response.code === 200) {
            this.$modal.msgSuccess('删除成功');
            this.getList();
          } else {
            this.$modal.msgError(response.message);
          }
        }).catch(() => {
          this.$modal.msgError('删除失败');
        });
      }).catch(() => {});
    }
  }
};
</script>

<style scoped>
.feedback-detail {
  padding: 20px;
  background-color: #f8f9fa;
}

.timeline {
  position: relative;
  padding-left: 20px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e4e7ed;
}

.timeline-item {
  position: relative;
  margin-bottom: 20px;
}

.timeline-marker {
  position: absolute;
  left: -12px;
  top: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #e4e7ed;
  border: 2px solid #fff;
}

.timeline-marker.is-first {
  background-color: #f56c6c;
}

.timeline-content {
  margin-left: 20px;
}

.timeline-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.feedback-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.feedback-user {
  margin-bottom: 8px;
}

.user-label {
  font-weight: 500;
  color: #303133;
}

.feedback-content {
  color: #606266;
  line-height: 1.5;
}

.add-reply-section {
  margin-top: 20px;
  padding-left: 20px;
}
</style>
