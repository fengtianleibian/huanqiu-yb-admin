<template>
  <div class="app-container">

    <!--搜索-->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="活动标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入活动标题"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable size="small">
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
          v-hasPermi="['activity:add']"
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
          v-hasPermi="['activity:remove']"
        >删除
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--表单-->
    <el-table v-loading="loading" :data="activityList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="活动标题" align="center" prop="title" :show-overflow-tooltip="true"/>
      <el-table-column label="PC图片" align="center" prop="titlePcImg">
        <template v-slot="scope">
          <el-image style="width: 120px; height: 60px" :src="scope.row.titlePcImg" v-if="scope.row.titlePcImg"></el-image>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="手机图片" align="center" prop="titlePhoneImg">
        <template v-slot="scope">
          <el-image style="width: 120px; height: 60px" :src="scope.row.titlePhoneImg" v-if="scope.row.titlePhoneImg"></el-image>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="内容图片" align="center" prop="contentImg">
        <template v-slot="scope">
          <el-image style="width: 120px; height: 60px" :src="scope.row.contentImg" v-if="scope.row.contentImg"></el-image>
          <span v-else>-</span>
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
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" @click="handleUpdate(scope.row)"
                     v-hasPermi="['activity:update']">
            <el-tag type="info">编辑</el-tag>
          </el-button>
          <el-button size="mini" type="text" @click="handleDelete(scope.row)"
                     v-hasPermi="['activity:remove']">
            <el-tag type="danger">删除</el-tag>
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

    <!-- 添加或修改活动对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="活动标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入活动标题"/>
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
        
        <!-- PC默认图片 -->
        <el-row>
          <el-col :span="24">
            <el-form-item label="PC默认图片" prop="titlePcImg">
              <el-upload 
                class="upload-demo" 
                drag 
                :action="uploadUrl" 
                :headers="headers" 
                :on-success="(res, file) => handleImageSuccess(res, file, 'titlePcImg')"
                :on-remove="(file, fileList) => handleImageRemove(file, fileList, 'titlePcImg')"
                :on-change="handleImageChange"
                :before-upload="handleBeforeUpload"
                :show-file-list="false">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">拖拽文件上传<em>点击上传</em></div>
                <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过10MB</div>
              </el-upload>
              <div v-if="form.titlePcImg" class="image-preview">
                <img :src="form.titlePcImg" style="width: 200px;height: 100px;margin-top: 10px;">
                <i class="el-icon-circle-close" @click="removeImage('titlePcImg')" style="position: absolute; top: 10px; right: 10px; cursor: pointer;"></i>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 手机默认图片 -->
        <el-row>
          <el-col :span="24">
            <el-form-item label="手机默认图片" prop="titlePhoneImg">
              <el-upload 
                class="upload-demo" 
                drag 
                :action="uploadUrl" 
                :headers="headers" 
                :on-success="(res, file) => handleImageSuccess(res, file, 'titlePhoneImg')"
                :on-remove="(file, fileList) => handleImageRemove(file, fileList, 'titlePhoneImg')"
                :on-change="handleImageChange"
                :before-upload="handleBeforeUpload"
                :show-file-list="false">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">拖拽文件上传<em>点击上传</em></div>
                <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过10MB</div>
              </el-upload>
              <div v-if="form.titlePhoneImg" class="image-preview">
                <img :src="form.titlePhoneImg" style="width: 200px;height: 100px;margin-top: 10px;">
                <i class="el-icon-circle-close" @click="removeImage('titlePhoneImg')" style="position: absolute; top: 10px; right: 10px; cursor: pointer;"></i>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 内容图片 -->
        <el-row>
          <el-col :span="24">
            <el-form-item label="内容图片" prop="contentImg">
              <el-upload 
                class="upload-demo" 
                drag 
                :action="uploadUrl" 
                :headers="headers" 
                :on-success="(res, file) => handleImageSuccess(res, file, 'contentImg')"
                :on-remove="(file, fileList) => handleImageRemove(file, fileList, 'contentImg')"
                :on-change="handleImageChange"
                :before-upload="handleBeforeUpload"
                :show-file-list="false">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">拖拽文件上传<em>点击上传</em></div>
                <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过10MB（可选）</div>
              </el-upload>
              <div v-if="form.contentImg" class="image-preview">
                <img :src="form.contentImg" style="width: 200px;height: 100px;margin-top: 10px;">
                <i class="el-icon-circle-close" @click="removeImage('contentImg')" style="position: absolute; top: 10px; right: 10px; cursor: pointer;"></i>
              </div>
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
import {addActivity, delActivity, listActivity, updateActivity, getActivity, uploadActivity} from "@/api/biz/activity";
import {getToken} from "@/utils/auth";

export default {
  name: "Activity",
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
      // 活动表格数据
      activityList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: undefined,
        status: undefined,
        beginTime: undefined,
        endTime: undefined,
      },
      // 日期范围
      dateRange: [],
      // 上传组件
      uploadUrl: process.env.VUE_APP_BASE_API + 'system/api/activity/upload',
      // 表单参数
      form: {
        id: undefined,
        title: undefined,
        titlePcImg: undefined,
        titlePhoneImg: undefined,
        contentImg: undefined,
        status: 0,
        sort: 0,
        beginTime: undefined,
        endTime: undefined
      },
      // 表单校验
      rules: {
        title: [
          {required: true, message: "活动标题不能为空", trigger: "blur"}
        ],
        titlePcImg: [
          {required: true, message: "PC默认图片不能为空", trigger: "blur"}
        ],
        titlePhoneImg: [
          {required: true, message: "手机默认图片不能为空", trigger: "blur"}
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
    /** 查询活动列表 */
    getList() {
      this.loading = true;
      if (this.dateRange && this.dateRange.length === 2) {
        this.queryParams.beginTime = this.dateRange[0];
        this.queryParams.endTime = this.dateRange[1];
      } else {
        this.queryParams.beginTime = undefined;
        this.queryParams.endTime = undefined;
      }
      listActivity(this.queryParams).then(response => {
        if (response.code === 200) {
          this.activityList = response.content.list;
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
      this.open = true;
      this.title = "添加活动";
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      getActivity(row.id).then(response => {
        if (response.code === 200) {
          this.form = response.content;
          this.title = "编辑活动";
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
        title: undefined,
        titlePcImg: undefined,
        titlePhoneImg: undefined,
        contentImg: undefined,
        status: 0,
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
            updateActivity(this.form).then(response => {
              if (response.code === 200) {
                this.$modal.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.$modal.msgError(response.message);
              }
            });
          } else {
            addActivity(this.form).then(response => {
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
    handleBeforeUpload(file) {
      var img = file.name.substring(file.name.lastIndexOf('.') + 1)
      const suffix = img === 'jpg'
      const suffix2 = img === 'png'
      const suffix3 = img === 'jpeg'
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!suffix && !suffix2 && !suffix3) {
        this.$message.error("只能上传图片");
        return false
      }
      if (!isLt10M) {
        this.$message.error("上传图片大小不能超过10MB");
        return false
      }
      return suffix || suffix2 || suffix3
    },
    
    // 上传成功
    handleImageSuccess(res, file, fieldName) {
      if (res.code === 200) {
        this.form[fieldName] = res.content;
        this.$refs.form.validateField(fieldName)
      } else {
        this.$message.error(res.message)
      }
    },
    
    // 删除文件列表时执行的钩子
    handleImageRemove(file, fileList, fieldName) {
      this.form[fieldName] = undefined
      this.$refs.form.validateField(fieldName)
    },
    
    // 文件列表改变时执行的钩子
    handleImageChange(res, file) {
      if (file.length > 1) {
        file.splice(0, 1)
      }
    },
    
    // 删除图片
    removeImage(fieldName) {
      this.form[fieldName] = undefined
      this.$refs.form.validateField(fieldName)
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      const activityIds = row.id || this.ids;
      this.$modal.confirm('是否确认删除编号为"' + activityIds + '"的数据项？').then(function () {
        return delActivity(activityIds);
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

<style scoped>
.image-preview {
  position: relative;
  display: inline-block;
}

.image-preview .el-icon-circle-close {
  color: #f56c6c;
  font-size: 20px;
}
</style>
