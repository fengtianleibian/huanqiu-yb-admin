<template>
  <div class="app-container">

    <!--搜索-->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选状态" clearable size="small">
          <el-option label="正常" :value="0"/>
          <el-option label="停用" :value="1"/>
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker v-model="dateRange"
                        style="width: 207px"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        type="daterange"
                        range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"
                        :default-time="['00:00:00', '23:59:59']"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--操作-->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['banner:add']"
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
          v-hasPermi="['banner:remove']"
        >删除
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--表单-->
    <el-table v-loading="loading" :data="carouselList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="名称" align="center" prop="name" :show-overflow-tooltip="true"/>
      <el-table-column label="图片" align="center" prop="url">
        <template v-slot="scope">
          <el-image style="width: 120px; height: 60px" :src="scope.row.url"></el-image>
        </template>
      </el-table-column>
      <el-table-column label="显示区域" align="center" prop="area">
        <template v-slot="scope">
          <span v-if="scope.row.area === 1">PC</span>
          <span v-if="scope.row.area === 2">手机</span>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort"/>
      <el-table-column label="开始时间" align="center" prop="beginTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.beginTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" align="center" prop="endTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.endTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template v-slot="scope">
          <span v-if="scope.row.status === 0"><el-tag type="success">正常</el-tag></span>
          <span v-if="scope.row.status === 1"><el-tag type="danger">停用</el-tag></span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width"
      >
        <template v-slot="scope">
          <el-button size="mini" type="text" @click="handleUpdate(scope.row)"
                     v-hasPermi="['banner:edit']">
            <el-tag type="info">编辑</el-tag>
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

    <!-- 添加或修改轮播图对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入名称"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="显示区域" prop="area">
              <el-select v-model="form.area" placeholder="请选择显示区域" clearable style="width: 100%">
                <el-option label="PC" :value="1"/>
                <el-option label="手机" :value="2"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" :min="0" :max="999" placeholder="请输入排序" style="width: 100%"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态" clearable style="width: 100%">
                <el-option label="正常" :value="0"/>
                <el-option label="停用" :value="1"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="开始时间" prop="beginTime">
              <el-date-picker
                v-model="form.beginTime"
                type="datetime"
                placeholder="选择开始时间"
                value-format="yyyy-MM-dd HH:mm:ss"
                style="width: 100%">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                v-model="form.endTime"
                type="datetime"
                placeholder="选择结束时间"
                value-format="yyyy-MM-dd HH:mm:ss"
                style="width: 100%">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="轮播图" prop="url">
              <el-upload class="upload-demo" drag :action=uploadUrl :headers="headers" :on-success="handleAvatarSuccess"
                         :on-remove="handlerRemover" :on-change="handlerChange" :before-upload="handlerBeforeUpload"
                         multiple>
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">拖拽文件上传<em>点击上传</em></div>
                <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过1024kb</div>
              </el-upload>
              <img v-if="form.url" :src="form.url" style="width: 100px;height: 50px;">
              <i class="el-icon-circle-close" v-if="form.url && isImg" @click="delUrlFun"
                 style="position: absolute"></i>
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
import {addBanner, delBanner, listBanner, updateBanner, info} from "@/api/biz/banner";
import {getToken} from "@/utils/auth";

export default {
  name: "Carousel",
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
      // 岗位表格数据
      carouselList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        id: undefined,
        name: undefined,
        status: undefined,
        createTime: [],
      },
      // 日期范围
      dateRange: [],
      //上次组件
      uploadUrl: process.env.VUE_APP_BASE_API + 'system/api/banner/upload',
      isLock: false,
      isImg: true,
      // 表单参数
      form: {
        id: undefined,
        name: undefined,
        status: undefined,
        area: undefined,
        url: undefined,
        sort: 0,
        beginTime: undefined,
        endTime: undefined
      },
      // 表单校验
      rules: {
        name: [
          {required: true, message: "名称不能为空", trigger: "blur"}
        ],
        url: [
          {required: true, message: "图片不能为空", trigger: "blur"}
        ],
        area: [
          {required: true, message: "显示区域不能为空", trigger: "change"}
        ],
        status: [
          {required: true, message: "状态不能为空", trigger: "change"}
        ],
        sort: [
          {required: true, message: "排序不能为空", trigger: "blur"}
        ],
        beginTime: [
          {required: true, message: "开始时间不能为空", trigger: "change"},
          {
            validator: (rule, value, callback) => {
              if (value && this.form.endTime && new Date(value) >= new Date(this.form.endTime)) {
                callback(new Error('开始时间必须早于结束时间'));
              } else {
                callback();
              }
            },
            trigger: 'change'
          }
        ],
        endTime: [
          {required: true, message: "结束时间不能为空", trigger: "change"},
          {
            validator: (rule, value, callback) => {
              if (value && this.form.beginTime && new Date(value) <= new Date(this.form.beginTime)) {
                callback(new Error('结束时间必须晚于开始时间'));
              } else {
                callback();
              }
            },
            trigger: 'change'
          }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  computed: {
    headers() {
      const token = getToken();
      return {
        Token: token
      };
    },
  },
  methods: {
    /** 查询岗位列表 */
    getList() {
      this.loading = true;
      if (this.dateRange && this.dateRange.length === 2) {
        this.queryParams.beginTime = this.dateRange[0];
        this.queryParams.endTime = this.dateRange[1];
      } else {
        this.queryParams.beginTime = undefined;
        this.queryParams.endTime = undefined;
      }
      listBanner(this.queryParams).then(response => {
        if (response.code === 200) {
          this.carouselList = response.content.list;
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
      this.dateRange = [];
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
      this.isLock = false
      this.open = true;
      this.title = "添加轮播图";
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.isLock = false

      info(row.id).then(response => {
        if (response.code === 200) {
          this.form = response.content;
          this.title = "编辑轮播图";
          this.open = true;
        } else {
          this.$modal.msgError(response.message);
        }
      });
    },

    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        name: undefined,
        status: undefined,
        area: undefined,
        url: undefined,
        sort: 0,
        beginTime: undefined,
        endTime: undefined
      };
      this.resetForm("form");
    },


    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },

    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateBanner(this.form).then(response => {
              if (response.code === 200) {
                this.$modal.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.$modal.msgError(response.message);
              }
            });
          } else {
            addBanner(this.form).then(response => {
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


    // 图片上传之前
    handlerBeforeUpload(file) {
      var img = file.name.substring(file.name.lastIndexOf('.') + 1)
      const suffix = img === 'jpg'
      const suffix2 = img === 'png'
      const suffix3 = img === 'jpeg'
      const isLt1M = file.size / 1024 / 1024 < 10;
      if (!suffix && !suffix2 && !suffix3) {
        this.$message.error("只能上传图片");
        return false
      }
      if (!isLt1M) {
        this.$message.error("上传图片大小1兆");
        return false
      }
      this.isLock = true
      this.isImg = false
      return suffix || suffix2 || suffix3
    },
    // 上传成功
    handleAvatarSuccess(res, file) {
      if (res.code === 200) {
        this.form.url = res.content;
        this.$refs.form.validateField('url')
        this.isLock = false
      } else {
        this.msgError(res.message)
      }
    },
    // 删除文件列表时执行的钩子
    handlerRemover(res, file) {
      this.form.url = undefined
      this.$refs.form.validateField('url')
    },
    // 文件列表改变时执行的钩子
    handlerChange(res, file) {
      if (file.length > 1) {
        file.splice(0, 1)
      }
    },
    //   删除图片
    delUrlFun() {
      this.form.url = undefined
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      const bannerIds = row.id || this.ids;
      this.$modal.confirm('是否确认删除编号为"' + bannerIds + '"的数据项？').then(function () {
        return delBanner(bannerIds);
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
  }
};
</script>
