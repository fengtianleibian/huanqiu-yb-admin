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
          v-hasPermi="['activity_relief_fund:add']"
        >新增</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="activityReliefFundList" style="width: 100%">
      <el-table-column label="亏损金额下限" align="center" prop="lossAmountDown">
        <template slot-scope="scope">
          <span class="text-danger">¥{{ formatMoney(scope.row.lossAmountDown) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="亏损金额上限" align="center" prop="lossAmountUp">
        <template slot-scope="scope">
          <span class="text-danger">¥{{ formatMoney(scope.row.lossAmountUp) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="补偿金额" align="center" prop="compensationAmount">
        <template slot-scope="scope">
          <span class="text-success">¥{{ formatMoney(scope.row.compensationAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime">
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
            v-hasPermi="['activity_relief_fund:update']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['activity_relief_fund:remove']"
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

    <!-- 添加或修改转运金对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="亏损金额下限" prop="lossAmountDown">
          <el-input
            v-model="form.lossAmountDown"
            placeholder="请输入亏损金额下限"
            type="number"
            :min="0"
            :step="0.01"
          >
            <template slot="prepend">¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="亏损金额上限" prop="lossAmountUp">
          <el-input
            v-model="form.lossAmountUp"
            placeholder="请输入亏损金额上限"
            type="number"
            :min="0"
            :step="0.01"
          >
            <template slot="prepend">¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="补偿金额" prop="compensationAmount">
          <el-input
            v-model="form.compensationAmount"
            placeholder="请输入补偿金额"
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
import { listActivityReliefFund, getActivityReliefFund, delActivityReliefFund, addActivityReliefFund, updateActivityReliefFund } from "@/api/biz/activityReliefFund";

export default {
  name: "ActivityReliefFund",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 转运金表格数据
      activityReliefFundList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        lossAmountDown: [
          { required: true, message: "亏损金额下限不能为空", trigger: "blur" },
          { 
            validator: (rule, value, callback) => {
              if (value !== undefined && value !== null && value !== '') {
                const numValue = parseFloat(value);
                if (isNaN(numValue) || numValue < 0) {
                  callback(new Error("亏损金额下限必须大于等于0"));
                } else {
                  callback();
                }
              } else {
                callback();
              }
            }, 
            trigger: "blur" 
          }
        ],
        lossAmountUp: [
          { required: true, message: "亏损金额上限不能为空", trigger: "blur" },
          { 
            validator: (rule, value, callback) => {
              if (value !== undefined && value !== null && value !== '') {
                const numValue = parseFloat(value);
                if (isNaN(numValue) || numValue < 0) {
                  callback(new Error("亏损金额上限必须大于等于0"));
                } else {
                  callback();
                }
              } else {
                callback();
              }
            }, 
            trigger: "blur" 
          }
        ],
        compensationAmount: [
          { required: true, message: "补偿金额不能为空", trigger: "blur" },
          { 
            validator: (rule, value, callback) => {
              if (value !== undefined && value !== null && value !== '') {
                const numValue = parseFloat(value);
                if (isNaN(numValue) || numValue < 0) {
                  callback(new Error("补偿金额必须大于等于0"));
                } else {
                  callback();
                }
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
    /** 查询转运金列表 */
    getList() {
      this.loading = true;
      listActivityReliefFund(this.queryParams).then(response => {
        if (response.code === 200) {
          this.activityReliefFundList = response.content && response.content.list ? response.content.list : [];
          this.total = response.content && response.content.total ? response.content.total : 0;
          this.loading = false;
        } else {
          this.$modal.msgError(response.message);
        }
      }).catch(() => {
        this.activityReliefFundList = [];
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
        lossAmountDown: undefined,
        lossAmountUp: undefined,
        compensationAmount: undefined
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
      this.title = "添加转运金";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getActivityReliefFund(id).then(response => {
        if (response.code === 200) {
          this.form = response.content;
          this.open = true;
          this.title = "修改转运金";
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
          // 验证亏损金额上下限
          if (parseFloat(this.form.lossAmountDown) >= parseFloat(this.form.lossAmountUp)) {
            this.$modal.msgError("亏损金额下限必须小于上限");
            return;
          }
          
          if (this.form.id != null) {
            updateActivityReliefFund(this.form).then(response => {
              if (response.code === 200) {
                this.$modal.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.$modal.msgError(response.message);
              }
            });
          } else {
            addActivityReliefFund(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除转运金编号为"' + ids + '"的数据项？').then(function() {
        return delActivityReliefFund(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 格式化金额显示 */
    formatMoney(value) {
      if (value == null) return '0.00';
      return Number(value).toFixed(2);
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
