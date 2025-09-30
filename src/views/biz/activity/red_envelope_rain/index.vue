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
          v-hasPermi="['activity_red_envelope_rain:add']"
        >新增</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="activityRedEnvelopeRainList" style="width: 100%">
      <el-table-column label="充值金额下限" align="center" prop="rechargeAmountDown">
        <template slot-scope="scope">
          <span>¥{{ formatMoney(scope.row.rechargeAmountDown) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="充值金额上限" align="center" prop="rechargeAmountUp">
        <template slot-scope="scope">
          <span>¥{{ formatMoney(scope.row.rechargeAmountUp) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="赠送金额最低" align="center" prop="giftAmountDown">
        <template slot-scope="scope">
          <span class="text-success">¥{{ formatMoney(scope.row.giftAmountDown) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="赠送金额最高" align="center" prop="giftAmountUp">
        <template slot-scope="scope">
          <span class="text-success">¥{{ formatMoney(scope.row.giftAmountUp) }}</span>
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
            v-hasPermi="['activity_red_envelope_rain:update']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['activity_red_envelope_rain:remove']"
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

    <!-- 添加或修改红包雨对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="充值金额下限" prop="rechargeAmountDown">
          <el-input
            v-model="form.rechargeAmountDown"
            placeholder="请输入充值金额下限"
            type="number"
            :min="0"
            :step="0.01"
          >
            <template slot="prepend">¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="充值金额上限" prop="rechargeAmountUp">
          <el-input
            v-model="form.rechargeAmountUp"
            placeholder="请输入充值金额上限"
            type="number"
            :min="0"
            :step="0.01"
          >
            <template slot="prepend">¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="赠送金额最低" prop="giftAmountDown">
          <el-input
            v-model="form.giftAmountDown"
            placeholder="请输入赠送金额最低"
            type="number"
            :min="0"
            :step="0.01"
          >
            <template slot="prepend">¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="赠送金额最高" prop="giftAmountUp">
          <el-input
            v-model="form.giftAmountUp"
            placeholder="请输入赠送金额最高"
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
import { listActivityRedEnvelopeRain, getActivityRedEnvelopeRain, delActivityRedEnvelopeRain, addActivityRedEnvelopeRain, updateActivityRedEnvelopeRain } from "@/api/biz/activityRedEnvelopeRain";

export default {
  name: "ActivityRedEnvelopeRain",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 红包雨表格数据
      activityRedEnvelopeRainList: [],
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
        rechargeAmountDown: [
          { required: true, message: "充值金额下限不能为空", trigger: "blur" },
          { 
            validator: (rule, value, callback) => {
              if (value !== undefined && value !== null && value !== '') {
                const numValue = parseFloat(value);
                if (isNaN(numValue) || numValue < 0) {
                  callback(new Error("充值金额下限必须大于等于0"));
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
        rechargeAmountUp: [
          { required: true, message: "充值金额上限不能为空", trigger: "blur" },
          { 
            validator: (rule, value, callback) => {
              if (value !== undefined && value !== null && value !== '') {
                const numValue = parseFloat(value);
                if (isNaN(numValue) || numValue < 0) {
                  callback(new Error("充值金额上限必须大于等于0"));
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
        giftAmountDown: [
          { required: true, message: "赠送金额最低不能为空", trigger: "blur" },
          { 
            validator: (rule, value, callback) => {
              if (value !== undefined && value !== null && value !== '') {
                const numValue = parseFloat(value);
                if (isNaN(numValue) || numValue < 0) {
                  callback(new Error("赠送金额最低必须大于等于0"));
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
        giftAmountUp: [
          { required: true, message: "赠送金额最高不能为空", trigger: "blur" },
          { 
            validator: (rule, value, callback) => {
              if (value !== undefined && value !== null && value !== '') {
                const numValue = parseFloat(value);
                if (isNaN(numValue) || numValue < 0) {
                  callback(new Error("赠送金额最高必须大于等于0"));
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
    /** 查询红包雨列表 */
    getList() {
      this.loading = true;
      listActivityRedEnvelopeRain(this.queryParams).then(response => {
        if (response.code === 200) {
          this.activityRedEnvelopeRainList = response.content && response.content.list ? response.content.list : [];
          this.total = response.content && response.content.total ? response.content.total : 0;
          this.loading = false;
        } else {
          this.$modal.msgError(response.message);
        }
      }).catch(() => {
        this.activityRedEnvelopeRainList = [];
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
        rechargeAmountDown: undefined,
        rechargeAmountUp: undefined,
        giftAmountDown: undefined,
        giftAmountUp: undefined
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
      this.title = "添加红包雨";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getActivityRedEnvelopeRain(id).then(response => {
        if (response.code === 200) {
          this.form = response.content;
          this.open = true;
          this.title = "修改红包雨";
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
          // 验证充值金额上下限
          if (parseFloat(this.form.rechargeAmountDown) >= parseFloat(this.form.rechargeAmountUp)) {
            this.$modal.msgError("充值金额下限必须小于上限");
            return;
          }
          
          // 验证赠送金额上下限
          if (parseFloat(this.form.giftAmountDown) >= parseFloat(this.form.giftAmountUp)) {
            this.$modal.msgError("赠送金额最低必须小于最高");
            return;
          }
          
          if (this.form.id != null) {
            updateActivityRedEnvelopeRain(this.form).then(response => {
              if (response.code === 200) {
                this.$modal.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.$modal.msgError(response.message);
              }
            });
          } else {
            addActivityRedEnvelopeRain(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除红包雨编号为"' + ids + '"的数据项？').then(function() {
        return delActivityRedEnvelopeRain(ids);
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
