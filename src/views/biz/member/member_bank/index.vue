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
      <el-form-item label="银行卡号" prop="bankCardNum">
        <el-input
          v-model="queryParams.bankCardNum"
          placeholder="请输入银行卡号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="真实姓名" prop="realName">
        <el-input
          v-model="queryParams.realName"
          placeholder="请输入真实姓名"
          clearable
          @keyup.enter.native="handleQuery"
        />
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
          v-hasPermi="['member_bank:add']"
        >新增
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
          v-hasPermi="['member_bank:remove']"
        >删除
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="memberBankList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="ID" align="center" prop="id" width="80"/>
      <el-table-column label="用户ID" align="center" prop="memberId" width="100"/>
      <el-table-column label="真实姓名" align="center" prop="realName" width="120"/>
      <el-table-column label="银行卡号" align="center" prop="bankCardNum" width="180" show-overflow-tooltip/>
      <el-table-column label="银行名称" align="center" prop="bankName" width="120" show-overflow-tooltip/>
      <el-table-column label="开户支行" align="center" prop="bankBranch" width="150" show-overflow-tooltip/>
      <el-table-column label="是否启用" align="center" prop="isEnable" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.isEnable === 0" type="success">启用</el-tag>
          <el-tag v-else type="danger">禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip/>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="120" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['member_bank:update']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['member_bank:remove']"
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

    <!-- 添加或修改用户银行卡信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户ID" prop="memberId">
          <el-input v-model="form.memberId" placeholder="请输入用户ID" :disabled="form.id !== undefined"/>
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入真实姓名"/>
        </el-form-item>
        <el-form-item label="银行名称" prop="bankName">
          <el-input v-model="form.bankName" placeholder="请输入银行名称"/>
        </el-form-item>
        <el-form-item label="银行卡号" prop="bankCardNum">
          <el-input v-model="form.bankCardNum" placeholder="请输入银行卡号"/>
        </el-form-item>
        <el-form-item label="开户支行" prop="bankBranch">
          <el-input v-model="form.bankBranch" placeholder="请输入开户支行"/>
        </el-form-item>
        <el-form-item label="是否启用" prop="isEnable">
          <el-radio-group v-model="form.isEnable">
            <el-radio :label="0">启用</el-radio>
            <el-radio :label="1">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注"/>
        </el-form-item>
        <el-form-item label="谷歌验证码" prop="googlePassword">
          <el-input v-model="form.googlePassword" placeholder="请输入谷歌验证码" show-password/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog title="删除确认" :visible.sync="deleteDialogVisible" width="400px" append-to-body>
      <el-form ref="deleteForm" :model="deleteForm" :rules="deleteRules" label-width="100px">
        <el-form-item label="谷歌验证码" prop="googlePassword">
          <el-input v-model="deleteForm.googlePassword" placeholder="请输入谷歌验证码" show-password/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="confirmDelete">确认删除</el-button>
        <el-button @click="cancelDelete">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {listMemberBank, addMemberBank, updateMemberBank, delMemberBank} from "@/api/biz/memberBank";

export default {
  name: "MemberBank",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户银行卡信息表格数据
      memberBankList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 删除确认对话框
      deleteDialogVisible: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        memberId: undefined,
        bankCardNum: undefined,
        realName: undefined
      },
      // 表单参数
      form: {},
      // 删除表单参数
      deleteForm: {
        googlePassword: ''
      },
      // 表单校验
      rules: {
        memberId: [
          { required: true, message: "用户ID不能为空", trigger: "blur" }
        ],
        realName: [
          { required: true, message: "真实姓名不能为空", trigger: "blur" }
        ],
        bankCardNum: [
          { required: true, message: "银行卡号不能为空", trigger: "blur" }
        ],
        bankName: [
          { required: true, message: "银行名称不能为空", trigger: "blur" }
        ],
        isEnable: [
          { required: true, message: "是否启用不能为空", trigger: "change" }
        ],
        googlePassword: [
          { required: true, message: "谷歌验证码不能为空", trigger: "blur" }
        ]
      },
      // 删除表单校验
      deleteRules: {
        googlePassword: [
          { required: true, message: "谷歌验证码不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询用户银行卡信息列表 */
    getList() {
      this.loading = true;
      listMemberBank(this.queryParams).then(response => {
        if (response.code === 200) {
          this.memberBankList = response.content.list;
          this.total = response.content.total;
          this.loading = false;
        } else {
          this.$modal.msgError(response.message);
        }
      });
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
      this.ids = selection.map(item => item.id);
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "新增用户银行卡信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids[0];
      this.form = Object.assign({}, row);
      this.form.googlePassword = '';
      this.open = true;
      this.title = "修改用户银行卡信息";
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          const data = {
            memberBank: this.form,
            googlePassword: this.form.googlePassword
          };
          const isEdit = this.form.id !== undefined;
          const apiCall = isEdit ? updateMemberBank(data) : addMemberBank(data);
          const successMsg = isEdit ? "修改成功" : "新增成功";
          
          apiCall.then(response => {
            if (response.code === 200) {
              this.$modal.msgSuccess(successMsg);
              this.open = false;
              this.getList();
            } else {
              this.$modal.msgError(response.message);
            }
          });
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.deleteForm.googlePassword = '';
      this.deleteDialogVisible = true;
      this.deleteForm.ids = ids;
    },
    /** 确认删除 */
    confirmDelete() {
      this.$refs["deleteForm"].validate(valid => {
        if (valid) {
          delMemberBank(this.deleteForm.ids, this.deleteForm.googlePassword).then(response => {
            if (response.code === 200) {
              this.$modal.msgSuccess("删除成功");
              this.deleteDialogVisible = false;
              this.getList();
            } else {
              this.$modal.msgError(response.message);
            }
          });
        }
      });
    },
    /** 取消删除 */
    cancelDelete() {
      this.deleteDialogVisible = false;
      this.deleteForm = {
        googlePassword: ''
      };
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
        memberId: undefined,
        realName: undefined,
        bankCardNum: undefined,
        bankName: undefined,
        bankBranch: undefined,
        isEnable: 0,
        remark: undefined,
        googlePassword: undefined
      };
      this.resetForm("form");
    }
  }
};
</script>