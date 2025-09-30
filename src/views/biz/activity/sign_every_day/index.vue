<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['activity_sign_every_day:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-edit"
          size="mini"
          @click="handleBatchUpdateCondition"
          v-hasPermi="['activity_sign_every_day:update']"
        >批量修改条件</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="activitySignEveryDayList" style="width: 100%">
      <el-table-column label="签到天数" align="center" prop="day">
        <template slot-scope="scope">
          <el-tag type="success">第 {{ scope.row.day }} 天</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="签到积分" align="center" prop="integral">
        <template slot-scope="scope">
          <span class="text-warning">{{ formatMoney(scope.row.integral) }} 积分</span>
        </template>
      </el-table-column>
      <el-table-column label="条件-日累计充值" align="center" prop="dayTotalRecharge">
        <template slot-scope="scope">
          <span>¥{{ formatMoney(scope.row.dayTotalRecharge) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="条件-日投注流水" align="center" prop="dayTotalWagering">
        <template slot-scope="scope">
          <span>¥{{ formatMoney(scope.row.dayTotalWagering) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['activity_sign_every_day:update']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['activity_sign_every_day:remove']"
          >删除</el-button>
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

    <!-- 批量修改签到条件对话框 -->
    <el-dialog title="批量修改签到条件" :visible.sync="batchConditionOpen" width="600px" append-to-body>
      <el-form ref="batchConditionForm" :model="batchConditionForm" :rules="batchConditionRules" label-width="140px">
        <el-alert
          title="提示：此操作将修改所有签到记录的条件设置"
          type="warning"
          :closable="false"
          style="margin-bottom: 20px">
        </el-alert>
        <el-form-item label="条件-日累计充值" prop="dayTotalRecharge">
          <el-input
            v-model="batchConditionForm.dayTotalRecharge"
            placeholder="请输入日累计充值金额"
            type="number"
            :min="0"
            :step="0.01"
          >
            <template slot="prepend">¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="条件-日投注流水" prop="dayTotalWagering">
          <el-input
            v-model="batchConditionForm.dayTotalWagering"
            placeholder="请输入日投注流水金额"
            type="number"
            :min="0"
            :step="0.01"
          >
            <template slot="prepend">¥</template>
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitBatchConditionForm">确 定</el-button>
        <el-button @click="cancelBatchCondition">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 添加或修改每日签到对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="140px">
        <el-form-item label="签到天数" prop="day">
          <el-input-number
            v-model="form.day"
            placeholder="请输入签到天数"
            :min="1"
            :max="365"
            :step="1"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="签到积分" prop="integral">
          <el-input
            v-model="form.integral"
            placeholder="请输入签到积分"
            type="number"
            :min="0"
            :step="0.01"
          >
            <template slot="append">积分</template>
          </el-input>
        </el-form-item>
        <el-form-item label="条件-日累计充值" prop="dayTotalRecharge">
          <el-input
            v-model="form.dayTotalRecharge"
            placeholder="请输入日累计充值金额"
            type="number"
            :min="0"
            :step="0.01"
          >
            <template slot="prepend">¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="条件-日投注流水" prop="dayTotalWagering">
          <el-input
            v-model="form.dayTotalWagering"
            placeholder="请输入日投注流水金额"
            type="number"
            :min="0"
            :step="0.01"
          >
            <template slot="prepend">¥</template>
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listActivitySignEveryDay, getActivitySignEveryDay, delActivitySignEveryDay, addActivitySignEveryDay, updateActivitySignEveryDay, batchUpdateSignEveryDayCondition } from "@/api/biz/activitySignEveryDay";

export default {
  name: "ActivitySignEveryDay",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 每日签到表格数据
      activitySignEveryDayList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 批量修改条件弹窗
      batchConditionOpen: false,
      // 批量修改条件表单
      batchConditionForm: {},
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        day: [
          { required: true, message: "签到天数不能为空", trigger: "blur" },
          { 
            validator: (rule, value, callback) => {
              if (value === undefined || value === null || value === '') {
                callback(new Error("签到天数不能为空"));
                return;
              }
              const numValue = parseInt(value);
              if (isNaN(numValue)) {
                callback(new Error("请输入有效的数字"));
              } else if (numValue < 1) {
                callback(new Error("签到天数必须大于0"));
              } else if (numValue > 365) {
                callback(new Error("签到天数不能超过365天"));
              } else {
                callback();
              }
            }, 
            trigger: "blur" 
          }
        ],
        integral: [
          { required: true, message: "签到积分不能为空", trigger: "blur" },
          { 
            validator: (rule, value, callback) => {
              if (value === undefined || value === null || value === '') {
                callback(new Error("签到积分不能为空"));
                return;
              }
              const numValue = parseFloat(value);
              if (isNaN(numValue)) {
                callback(new Error("请输入有效的数字"));
              } else if (numValue < 0) {
                callback(new Error("签到积分必须大于等于0"));
              } else {
                callback();
              }
            }, 
            trigger: "blur" 
          }
        ],
        dayTotalRecharge: [
          { required: true, message: "日累计充值不能为空", trigger: "blur" },
          { 
            validator: (rule, value, callback) => {
              if (value === undefined || value === null || value === '') {
                callback(new Error("日累计充值不能为空"));
                return;
              }
              const numValue = parseFloat(value);
              if (isNaN(numValue)) {
                callback(new Error("请输入有效的数字"));
              } else if (numValue < 0) {
                callback(new Error("日累计充值必须大于等于0"));
              } else {
                callback();
              }
            }, 
            trigger: "blur" 
          }
        ],
        dayTotalWagering: [
          { required: true, message: "日投注流水不能为空", trigger: "blur" },
          { 
            validator: (rule, value, callback) => {
              if (value === undefined || value === null || value === '') {
                callback(new Error("日投注流水不能为空"));
                return;
              }
              const numValue = parseFloat(value);
              if (isNaN(numValue)) {
                callback(new Error("请输入有效的数字"));
              } else if (numValue < 0) {
                callback(new Error("日投注流水必须大于等于0"));
              } else {
                callback();
              }
            }, 
            trigger: "blur" 
          }
        ]
      },
      // 批量修改条件校验规则
      batchConditionRules: {
        dayTotalRecharge: [
          { required: true, message: "日累计充值不能为空", trigger: "blur" },
          { 
            validator: (rule, value, callback) => {
              if (value === undefined || value === null || value === '') {
                callback(new Error("日累计充值不能为空"));
                return;
              }
              const numValue = parseFloat(value);
              if (isNaN(numValue)) {
                callback(new Error("请输入有效的数字"));
              } else if (numValue < 0) {
                callback(new Error("日累计充值必须大于等于0"));
              } else {
                callback();
              }
            }, 
            trigger: "blur" 
          }
        ],
        dayTotalWagering: [
          { required: true, message: "日投注流水不能为空", trigger: "blur" },
          { 
            validator: (rule, value, callback) => {
              if (value === undefined || value === null || value === '') {
                callback(new Error("日投注流水不能为空"));
                return;
              }
              const numValue = parseFloat(value);
              if (isNaN(numValue)) {
                callback(new Error("请输入有效的数字"));
              } else if (numValue < 0) {
                callback(new Error("日投注流水必须大于等于0"));
              } else {
                callback();
              }
            }, 
            trigger: "blur" 
          }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询每日签到列表 */
    getList() {
      this.loading = true;
      listActivitySignEveryDay(this.queryParams).then(response => {
        if (response.code === 200) {
          this.activitySignEveryDayList = response.content && response.content.list ? response.content.list : [];
          this.total = response.content && response.content.total ? response.content.total : 0;
          this.loading = false;
        } else {
          this.$modal.msgError(response.message);
        }
      }).catch(() => {
        this.activitySignEveryDayList = [];
        this.total = 0;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        day: undefined,
        integral: undefined,
        dayTotalRecharge: undefined,
        dayTotalWagering: undefined
      };
      this.resetForm("form");
      // 清除表单验证状态
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate();
        }
      });
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加每日签到";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getActivitySignEveryDay(id).then(response => {
        if (response.code === 200) {
          this.form = response.content;
          this.open = true;
          this.title = "修改每日签到";
          // 清除表单验证状态
          this.$nextTick(() => {
            if (this.$refs.form) {
              this.$refs.form.clearValidate();
            }
          });
        }
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateActivitySignEveryDay(this.form).then(response => {
              if (response.code === 200) {
                this.$modal.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.$modal.msgError(response.message);
              }
            });
          } else {
            addActivitySignEveryDay(this.form).then(response => {
              if (response.code === 200) {
                this.$modal.msgSuccess("新增成功");
                this.open = false;
                this.getList();
              } else {
                this.$modal.msgError(response.message);
              }
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除每日签到编号为"' + ids + '"的数据项？').then(function() {
        return delActivitySignEveryDay(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 格式化金额显示 */
    formatMoney(value) {
      if (value == null) return '0.00';
      return Number(value).toFixed(2);
    },
    /** 批量修改签到条件 */
    handleBatchUpdateCondition() {
      this.batchConditionForm = {
        dayTotalRecharge: undefined,
        dayTotalWagering: undefined
      };
      this.batchConditionOpen = true;
      // 清除表单验证状态
      this.$nextTick(() => {
        if (this.$refs.batchConditionForm) {
          this.$refs.batchConditionForm.clearValidate();
        }
      });
    },
    /** 批量修改条件-取消 */
    cancelBatchCondition() {
      this.batchConditionOpen = false;
      this.batchConditionForm = {};
      if (this.$refs.batchConditionForm) {
        this.$refs.batchConditionForm.clearValidate();
      }
    },
    /** 批量修改条件-提交 */
    submitBatchConditionForm() {
      this.$refs["batchConditionForm"].validate(valid => {
        if (valid) {
          this.$modal.confirm('是否确认批量修改所有签到记录的条件设置？').then(() => {
            batchUpdateSignEveryDayCondition(this.batchConditionForm).then(response => {
              if (response.code === 200) {
                this.$modal.msgSuccess("批量修改成功");
                this.batchConditionOpen = false;
                this.getList();
              } else {
                this.$modal.msgError(response.message);
              }
            });
          }).catch(() => {});
        }
      });
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

.text-warning {
  color: #e6a23c;
  font-weight: bold;
}
</style>