<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="域名" prop="domain">
        <el-input
          v-model="queryParams.domain"
          placeholder="请输入域名"
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
          v-hasPermi="['domain:add']"
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
          v-hasPermi="['domain:edit']"
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
          v-hasPermi="['domain:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-refresh"
          size="mini"
          @click="handleRefreshCache"
          v-hasPermi="['domain:remove']"
        >刷新缓存
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="domainList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="ID" align="center" prop="id"/>
      <el-table-column label="域名" align="center" prop="domain"/>
      <el-table-column label="默认代理" align="center" prop="defaultProxy"/>
      <el-table-column label="默认代理ID" align="center" prop="defaultProxyId"/>
      <el-table-column label="默认会员类型" align="center" prop="defaultMemberType">
        <template slot-scope="scope">
          <span>{{ getMemberTypeText(scope.row.defaultMemberType) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip/>
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['domain:edit']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['domain:remove']"
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

    <!-- 添加或修改域名对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="域名" prop="domain">
          <el-input v-model="form.domain" placeholder="请输入域名"/>
        </el-form-item>
        <el-form-item label="默认代理" prop="defaultProxy">
          <el-input v-model="form.defaultProxy" placeholder="请输入默认代理"/>
        </el-form-item>
        <el-form-item label="会员类型" prop="defaultMemberType">
          <el-select v-model="form.defaultMemberType" placeholder="请选择默认会员类型" style="width: 100%">
            <el-option label="会员账号" :value="0"></el-option>
            <el-option label="代理账号" :value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" :rows="3"/>
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
  listDomain,
  getDomain,
  delDomain,
  addDomain,
  updateDomain,
  refreshCache
} from "@/api/biz/domain";

export default {
  name: "Domain",
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
      // 域名表格数据
      domainList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        domain: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        domain: [
          {required: true, message: "域名不能为空", trigger: "blur"},
        ],
        defaultProxy: [
          {required: true, message: "默认代理不能为空", trigger: "blur"}
        ],
        defaultProxyId: [
          {required: true, message: "默认代理ID不能为空", trigger: "blur"}
        ],
        defaultMemberType: [
          {required: true, message: "默认会员类型不能为空", trigger: "change"}
        ],
        remark: [
          {max: 500, message: "备注长度不能超过500个字符", trigger: "blur"}
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询域名列表 */
    getList() {
      this.loading = true;
      listDomain(this.queryParams).then(response => {
        if (response.code === 200) {
          this.domainList = response.content.list;
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
        domain: undefined,
        defaultProxy: undefined,
        defaultProxyId: undefined,
        defaultMemberType: undefined,
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
      this.title = "添加域名";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getDomain(id).then(response => {
        if (response.code === 200) {
          this.form = response.content;
          this.open = true;
          this.title = "修改域名";
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
            updateDomain(this.form).then(response => {
              if (response.code === 200) {
                this.$modal.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.$modal.msgError(response.message);
              }
            });
          } else {
            addDomain(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除域名编号为"' + ids + '"的数据项？').then(function () {
        return delDomain(ids);
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
    },
    /** 刷新缓存按钮操作 */
    handleRefreshCache() {
      this.$modal.confirm('是否确认刷新域名缓存？').then(function () {
        return refreshCache();
      }).then(response => {
        if (response.code === 200) {
          this.$modal.msgSuccess("刷新缓存成功");
        } else {
          this.$modal.msgError(response.message);
        }
      }).catch(() => {
        this.$modal.msgError(response.message);
      });
    },
    /** 获取会员类型文本 */
    getMemberTypeText(type) {
      const typeMap = {
        0: '会员账号',
        1: '代理账号'
      };
      return typeMap[type] || '未知';
    }
  }
};
</script>
