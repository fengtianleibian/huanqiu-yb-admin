<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="等级名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入等级名称"
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
          v-hasPermi="['member_vip_level:add']"
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
          v-hasPermi="['member_vip_level:edit']"
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
          v-hasPermi="['member_vip_level:remove']"
        >删除
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="memberVipLevelList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="等级名称" align="center" prop="name"/>
      <el-table-column label="等级值" align="center" prop="vip"/>
      <el-table-column label="会员数量" align="center" prop="memberCount"/>
      <el-table-column label="存款金额" align="center" prop="depositAmount">
        <template slot-scope="scope">
          <span style="color: #8B4513;">{{ scope.row.depositAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="升级彩金奖励" align="center" width="120" prop="upgradeBonus"/>
      <el-table-column label="升级彩金打码倍数" align="center" width="130" prop="upgradeBonusMultiple"/>
      <el-table-column label="周俸禄" align="center" prop="weekBonus">
        <template slot-scope="scope">
          <span style="color: #8B4513;">{{ scope.row.weekBonus }}</span>
        </template>
      </el-table-column>
      <el-table-column label="周俸禄所需充值" align="center" width="120" prop="weekBonusNeedRecharge"/>
      <el-table-column label="周俸禄打码倍数" align="center" width="120" prop="weekBonusMultiple"/>
      <el-table-column label="月俸禄" align="center" prop="monthBonus">
        <template slot-scope="scope">
          <span style="color: #8B4513;">{{ scope.row.monthBonus }}</span>
        </template>
      </el-table-column>
      <el-table-column label="月俸禄所需充值" align="center" width="120" prop="monthBonusNeedRecharge"/>
      <el-table-column label="月俸禄打码倍数" align="center" width="120" prop="monthBonusMultiple"/>
      <el-table-column label="备注" align="center" show-overflow-tooltip prop="remark"/>
      <el-table-column label="创建时间" align="center" width="160" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="120" class-name="small-padding fixed-width" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['member_vip_level:edit']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['member_vip_level:remove']"
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

    <!-- 添加或修改用户等级对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="140px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="等级名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入等级名称"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="等级值" prop="vip">
              <el-input-number v-model="form.vip" :min="1" style="width: 100%"
                               placeholder="请输入等级值"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="存款金额" prop="depositAmount">
              <el-input-number v-model="form.depositAmount" :min="0" :precision="2" style="width: 100%"
                               placeholder="请输入存款金额"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="升级彩金奖励" prop="upgradeBonus">
              <el-input-number v-model="form.upgradeBonus" :min="0" :precision="2" style="width: 100%"
                               placeholder="请输入升级彩金奖励"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="升级彩金打码倍数" prop="upgradeBonusMultiple">
              <el-input-number v-model="form.upgradeBonusMultiple" :min="1" :precision="2" style="width: 100%"
                               placeholder="请输入打码倍数"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="周俸禄" prop="weekBonus">
              <el-input-number v-model="form.weekBonus" :min="0" :precision="2" style="width: 100%"
                               placeholder="请输入周俸禄"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="月俸禄" prop="monthBonus">
              <el-input-number v-model="form.monthBonus" :min="0" :precision="2" style="width: 100%"
                               placeholder="请输入月俸禄"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="周俸禄所需充值" prop="weekBonusNeedRecharge">
              <el-input-number v-model="form.weekBonusNeedRecharge" :min="0" :precision="2" style="width: 100%"
                               placeholder="请输入所需充值"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="月俸禄所需充值" prop="monthBonusNeedRecharge">
              <el-input-number v-model="form.monthBonusNeedRecharge" :min="0" :precision="2" style="width: 100%"
                               placeholder="请输入所需充值"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="周俸禄打码倍数" prop="weekBonusMultiple">
              <el-input-number v-model="form.weekBonusMultiple" :min="1" :precision="2" style="width: 100%"
                               placeholder="请输入打码倍数"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="月俸禄打码倍数" prop="monthBonusMultiple">
              <el-input-number v-model="form.monthBonusMultiple" :min="1" :precision="2" style="width: 100%"
                               placeholder="请输入打码倍数"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input type="textarea" :rows="3" v-model="form.remark" placeholder="请输入备注"/>
            </el-form-item>
          </el-col>
        </el-row>
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
  listMemberVipLevel,
  getMemberVipLevel,
  delMemberVipLevel,
  addMemberVipLevel,
  updateMemberVipLevel
} from "@/api/biz/member_vip_level";

export default {
  name: "MemberVipLevel",
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
      // 用户等级表格数据
      memberVipLevelList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          {required: true, message: "等级名称不能为空", trigger: "blur"}
        ],
        vip: [
          {required: true, message: "等级值不能为空", trigger: "blur"}
        ],
        depositAmount: [
          {required: true, message: "存款金额不能为空", trigger: "blur"}
        ],
        upgradeBonus: [
          {required: true, message: "升级彩金奖励不能为空", trigger: "blur"}
        ],
        upgradeBonusMultiple: [
          {required: true, message: "升级彩金打码倍数不能为空", trigger: "blur"}
        ],
        weekBonus: [
          {required: true, message: "周俸禄不能为空", trigger: "blur"}
        ],
        weekBonusNeedRecharge: [
          {required: true, message: "周俸禄所需充值不能为空", trigger: "blur"}
        ],
        weekBonusMultiple: [
          {required: true, message: "周俸禄打码倍数不能为空", trigger: "blur"}
        ],
        monthBonus: [
          {required: true, message: "月俸禄不能为空", trigger: "blur"}
        ],
        monthBonusNeedRecharge: [
          {required: true, message: "月俸禄所需充值不能为空", trigger: "blur"}
        ],
        monthBonusMultiple: [
          {required: true, message: "月俸禄打码倍数不能为空", trigger: "blur"}
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询用户等级列表 */
    getList() {
      this.loading = true;
      listMemberVipLevel(this.queryParams).then(response => {
        if (response.code === 200) {
          this.memberVipLevelList = response.content.list;
          this.total = response.content.total;
          this.loading = false;
        } else {
          this.$modal.msgError(response.message);
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
        name: undefined,
        vip: 1,
        memberCount: 0,
        depositAmount: 0,
        upgradeBonus: 0,
        upgradeBonusMultiple: 1,
        weekBonus: 0,
        weekBonusNeedRecharge: 0,
        weekBonusMultiple: 1,
        monthBonus: 0,
        monthBonusNeedRecharge: 0,
        monthBonusMultiple: 1,
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
      this.title = "添加用户等级";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getMemberVipLevel(id).then(response => {
        if (response.code === 200) {
          this.form = response.content;
          this.open = true;
          this.title = "修改用户等级";
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
            updateMemberVipLevel(this.form).then(response => {
              if (response.code === 200) {
                this.$modal.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.$modal.msgError(response.message);
              }
            });
          } else {
            addMemberVipLevel(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除用户等级编号为"' + ids + '"的数据项？').then(function () {
        return delMemberVipLevel(ids);
      }).then(response => {
        if (response.code === 200) {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        } else {
          this.$modal.msgError(response.message);
        }
      }).catch(() => {
        this.$modal.msgError(response.message);
      });
    }
  }
};
</script>
