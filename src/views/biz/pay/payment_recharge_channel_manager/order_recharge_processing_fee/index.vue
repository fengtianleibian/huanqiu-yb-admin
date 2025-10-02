<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option label="正常" :value="0"></el-option>
          <el-option label="停用" :value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 每日免费次数显示 -->
    <el-row :gutter="10" class="mb8" v-if="firstRecordDailyFreeCount !== undefined">
      <el-col :span="24">
        <el-alert
          title="每日免费次数"
          type="info"
          :description="`当前每日免费次数：${firstRecordDailyFreeCount === -1 ? '不限制' : firstRecordDailyFreeCount + ' 次'}`"
          show-icon
          :closable="false">
        </el-alert>
      </el-col>
    </el-row>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['order_processing_fee:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['order_processing_fee:update']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['order_processing_fee:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-edit"
          size="mini"
          @click="handleUpdateFreeCount"
          v-hasPermi="['order_processing_fee:update']"
        >修改每日免费次数
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="feeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="金额范围" align="center">
        <template slot-scope="scope">
          {{ scope.row.down }} - {{ scope.row.up }}
        </template>
      </el-table-column>
      <el-table-column label="手续费类型" align="center" prop="processingFeeType">
        <template slot-scope="scope">
          <el-tag :type="scope.row.processingFeeType === 1 ? 'success' : 'warning'">
            {{ scope.row.processingFeeType === 1 ? '百分比' : '固定' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="手续费" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.processingFeeType === 1">
            {{ scope.row.processingFeePercentage }}%
          </span>
          <span v-else>
            {{ scope.row.processingFeeFixe }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
            {{ scope.row.status === 0 ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark"/>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['order_processing_fee:update']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['order_processing_fee:remove']"
          >删除
          </el-button>
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

    <!-- 添加或修改订单手续费对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="下限" prop="down">
          <el-input-number v-model="form.down" :precision="2" :step="1" :min="0" style="width: 100%"/>
        </el-form-item>
        <el-form-item label="上限" prop="up">
          <el-input-number v-model="form.up" :precision="2" :step="1" :min="0" style="width: 100%"/>
        </el-form-item>
        <el-form-item label="手续费类型" prop="processingFeeType">
          <el-radio-group v-model="form.processingFeeType">
            <el-radio :label="1">百分比</el-radio>
            <el-radio :label="2">固定</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="手续费(%)" prop="processingFeePercentage" v-if="form.processingFeeType === 1">
          <el-input-number v-model="form.processingFeePercentage" :precision="2" :step="0.01" :min="0" :max="100"
                           style="width: 100%"/>
        </el-form-item>
        <el-form-item label="手续费(固定)" prop="processingFeeFixe" v-if="form.processingFeeType === 2">
          <el-input-number v-model="form.processingFeeFixe" :precision="2" :step="0.01" :min="0"
                           style="width: 100%"/>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="0">正常</el-radio>
            <el-radio :label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 修改每日免费次数对话框 -->
    <el-dialog title="修改每日免费次数" :visible.sync="freeCountDialogOpen" width="400px" append-to-body>
      <el-form ref="freeCountForm" :model="freeCountForm" :rules="freeCountRules" label-width="120px">
        <el-form-item label="每日免费次数" prop="count">
          <el-input-number v-model="freeCountForm.count" :min="-1" :step="1" style="width: 100%"/>
          <div style="color: #909399; font-size: 12px; margin-top: 5px;">
            提示：-1 表示不限制免费次数
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFreeCountForm">确 定</el-button>
        <el-button @click="cancelFreeCountForm">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listOrderProcessingFee,
  getOrderProcessingFee,
  delOrderProcessingFee,
  addOrderProcessingFee,
  updateOrderProcessingFee,
  updateFreeCountForDay
} from "@/api/biz/orderProcessingFee";

export default {
  name: "OrderProcessingFee",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 订单手续费表格数据
      feeList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        type: 1,
        status: undefined
      },
      // 表单参数
      form: {},
      // 每日免费次数对话框显示状态
      freeCountDialogOpen: false,
      // 每日免费次数表单参数
      freeCountForm: {
        count: 0
      },
      // 每日免费次数表单校验
      freeCountRules: {
        count: [
          {required: true, message: "每日免费次数不能为空", trigger: "blur"},
          {validator: (rule, value, callback) => {
            if (value === undefined || value === null || value === '') {
              callback(new Error('每日免费次数不能为空'));
            } else if (value < -1) {
              callback(new Error('每日免费次数不能小于-1'));
            } else {
              callback();
            }
          }, trigger: 'blur'}
        ]
      },
      // 表单校验
      rules: {
        down: [
          {required: true, message: "下限不能为空", trigger: "blur"}
        ],
        up: [
          {required: true, message: "上限不能为空", trigger: "blur"}
        ],
        processingFeeType: [
          {required: true, message: "手续费类型不能为空", trigger: "change"}
        ],
        status: [
          {required: true, message: "状态不能为空", trigger: "change"}
        ]
      }
    };
  },
  computed: {
    // 获取第一条记录的每日免费次数
    firstRecordDailyFreeCount() {
      if (this.feeList && this.feeList.length > 0) {
        return this.feeList[0].freeCountForDay;
      }
      return undefined;
    }
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询订单手续费列表 */
    getList() {
      this.loading = true;
      listOrderProcessingFee(this.queryParams).then(response => {
        if (response.code === 200) {
          this.feeList = response.content.list;
          this.total = response.content.total;
          this.loading = false;
        } else {
          this.$modal.msgError(response.message);
          this.loading = false;
        }
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
        up: undefined,
        down: undefined,
        processingFeeType: 1,
        processingFeePercentage: undefined,
        processingFeeFixe: undefined,
        status: 0,
        type: 1,
        remark: undefined
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams.type = 1; // 确保重置后type保持为代收
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加订单手续费";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getOrderProcessingFee(id).then(response => {
        if (response.code === 200) {
          this.form = response.content;
          this.open = true;
          this.title = "修改订单手续费";
        } else {
          this.$modal.msgError(response.message);
        }
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateOrderProcessingFee(this.form).then(response => {
              if (response.code === 200) {
                this.$modal.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.$modal.msgError(response.message);
              }
            });
          } else {
            addOrderProcessingFee(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除选中的订单手续费数据项？').then(function () {
        return delOrderProcessingFee(ids);
      }).then(response => {
        if (response.code === 200) {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        } else {
          this.$modal.msgError(response.message);
        }
      }).catch(() => {
      });
    },
    /** 修改每日免费次数按钮操作 */
    handleUpdateFreeCount() {
      this.freeCountForm.count = this.firstRecordDailyFreeCount;
      this.freeCountDialogOpen = true;
    },
    /** 取消修改每日免费次数 */
    cancelFreeCountForm() {
      this.freeCountDialogOpen = false;
      this.resetFreeCountForm();
    },
    /** 重置每日免费次数表单 */
    resetFreeCountForm() {
      this.freeCountForm = {
        count: 0
      };
      this.resetForm("freeCountForm");
    },
    /** 提交修改每日免费次数 */
    submitFreeCountForm() {
      this.$refs["freeCountForm"].validate(valid => {
        if (valid) {
          updateFreeCountForDay(this.freeCountForm.count, 1).then(response => {
            if (response.code === 200) {
              this.$modal.msgSuccess("修改成功");
              this.freeCountDialogOpen = false;
              this.getList();
            } else {
              this.$modal.msgError(response.message);
            }
          });
        }
      });
    }
  }
};
</script>
