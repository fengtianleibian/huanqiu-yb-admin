<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="通道名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入通道名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['payment_channel:add']"
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
          v-hasPermi="['payment_channel:update']"
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
          v-hasPermi="['payment_channel:remove']"
        >删除
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="channelList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="通道名称" align="center" prop="name" :show-overflow-tooltip="true"/>
      <el-table-column label="渠道商名称" align="center" prop="paymentChannelProviderName" :show-overflow-tooltip="true"/>
      <el-table-column label="通道编码" align="center" prop="payCode" :show-overflow-tooltip="true"/>
      <el-table-column label="类型" align="center" prop="type">
        <template slot-scope="scope">
          <el-tag :type="scope.row.type === 1 ? 'success' : 'warning'">
            {{ scope.row.type === 1 ? '充值' : '提现' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="下限" align="center" prop="down"/>
      <el-table-column label="上限" align="center" prop="up"/>
      <el-table-column label="创建订单数" align="center" prop="createCount"/>
      <el-table-column label="成功订单数" align="center" prop="successCount"/>
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
            {{ scope.row.status === 0 ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['payment_channel:update']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['payment_channel:remove']"
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

    <!-- 添加或修改代收代付通道对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="通道名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入通道名称"/>
        </el-form-item>
        <el-form-item label="三方渠道商" prop="paymentChannelProviderId">
          <el-select
            v-model="form.paymentChannelProviderId"
            placeholder="请选择三方渠道商"
            filterable
            style="width: 100%"
            @change="handleProviderChange"
          >
            <el-option
              v-for="item in providerList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="通道编码" prop="payCode">
          <el-input v-model="form.payCode" placeholder="请输入通道编码"/>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :label="1">充值</el-radio>
            <el-radio :label="2">提现</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="下限" prop="down">
          <el-input-number v-model="form.down" :precision="2" :step="1" :min="0" style="width: 100%"/>
        </el-form-item>
        <el-form-item label="上限" prop="up">
          <el-input-number v-model="form.up" :precision="2" :step="1" :min="0" style="width: 100%"/>
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
  </div>
</template>

<script>
import {
  listPaymentChannel,
  getPaymentChannel,
  delPaymentChannel,
  addPaymentChannel,
  updatePaymentChannel
} from "@/api/biz/paymentChannel";
import { listAllPaymentChannelProvider } from "@/api/biz/paymentChannelProvider";

export default {
  name: "PaymentChannel",
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
      // 代收代付通道表格数据
      channelList: [],
      // 三方渠道商列表
      providerList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          {required: true, message: "通道名称不能为空", trigger: "blur"}
        ],
        paymentChannelProviderId: [
          {required: true, message: "请选择三方渠道商", trigger: "change"}
        ],
        payCode: [
          {required: true, message: "通道编码不能为空", trigger: "blur"}
        ],
        type: [
          {required: true, message: "请选择类型", trigger: "change"}
        ],
        down: [
          {required: true, message: "下限不能为空", trigger: "blur"}
        ],
        up: [
          {required: true, message: "上限不能为空", trigger: "blur"}
        ],
        status: [
          {required: true, message: "状态不能为空", trigger: "change"}
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getProviderList();
  },
  methods: {
    /** 查询代收代付通道列表 */
    getList() {
      this.loading = true;
      listPaymentChannel(this.queryParams).then(response => {
        if (response.code === 200) {
          this.channelList = response.content.list;
          this.total = response.content.total;
          this.loading = false;
        } else {
          this.$modal.msgError(response.message);
          this.loading = false;
        }
      });
    },
    /** 获取三方渠道商列表 */
    getProviderList() {
      listAllPaymentChannelProvider().then(response => {
        if (response.code === 200) {
          this.providerList = response.content;
        } else {
          this.$modal.msgError(response.message);
        }
      });
    },
    /** 三方渠道商选择变化 */
    handleProviderChange(value) {
      const provider = this.providerList.find(item => item.id === value);
      if (provider) {
        this.form.paymentChannelProviderName = provider.name;
      }
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
        name: undefined,
        paymentChannelProviderId: undefined,
        paymentChannelProviderName: undefined,
        payCode: undefined,
        up: undefined,
        down: undefined,
        createCount: 0,
        successCount: 0,
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
      this.title = "添加代收代付通道";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getPaymentChannel(id).then(response => {
        if (response.code === 200) {
          this.form = response.content;
          this.open = true;
          this.title = "修改代收代付通道";
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
            updatePaymentChannel(this.form).then(response => {
              if (response.code === 200) {
                this.$modal.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.$modal.msgError(response.message);
              }
            });
          } else {
            addPaymentChannel(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除选中的代收代付通道数据项？').then(function () {
        return delPaymentChannel(ids);
      }).then(response => {
        if (response.code === 200) {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        } else {
          this.$modal.msgError(response.message);
        }
      }).catch(() => {
      });
    }
  }
};
</script>
