<template>
  <div class="app-container">
    <!--查询-->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="站点ID" prop="siteId">
        <el-input
          v-model="queryParams.siteId"
          placeholder="请输入站点ID"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="站点名称" prop="siteName">
        <el-input
          v-model="queryParams.siteName"
          placeholder="请输入站点名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="站点状态" clearable>
          <el-option label="正常" :value="0"/>
          <el-option label="停用" :value="1"/>
        </el-select>
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
          v-hasPermi="['site:add']"
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
          v-hasPermi="['site:edit']"
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
          v-hasPermi="['site:remove']"
        >删除
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!--表单-->
    <el-table v-loading="loading" :data="siteList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="站点ID" align="center" prop="siteId"/>
      <el-table-column label="站点名称" align="center" prop="siteName"/>
      <el-table-column label="时区" align="center" prop="timeZone">
        <template slot-scope="scope">
          <span>UTC + {{ scope.row.timeZone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="默认库存金额" align="center" prop="baseInventory" width="120px"/>
      <el-table-column label="默认RTP" align="center" prop="baseRtp"/>
      <el-table-column label="默认高爆库存触发金额" align="center" prop="baseInventoryHeight" width="160px"/>
      <el-table-column label="高爆库存抽取时间间隔（分钟）" align="center" prop="inventoryHeightExtractionInterval"
                       width="220px"/>
      <el-table-column label="高爆库存抽取比例 (%)" align="center" prop="inventoryHeightExtractionRatio" width="180px"/>
      <el-table-column label="状态" align="center" prop="status">
        <template v-slot="scope">
          <span v-if="scope.row.status === 0"><el-tag type="success">正常</el-tag></span>
          <span v-if="scope.row.status === 1"><el-tag type="danger">停用</el-tag></span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="240px" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleDetail(scope.row)"
          >详情
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['site:edit']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['site:remove']"
          >删除
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-refresh"
            @click="handleSyncOdds(scope.row)"
            v-hasPermi="['site:syncOdds']"
            v-if="scope.row.siteId !== '0'"
          >同步库存
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--分页-->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 站点详情对话框 -->
    <el-dialog title="站点详情" :visible.sync="detailOpen" width="700px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="站点ID">{{ detailData.siteId }}</el-descriptions-item>
        <el-descriptions-item label="站点名称">{{ detailData.siteName }}</el-descriptions-item>
        <el-descriptions-item label="时区">UTC {{ detailData.timeZone }}</el-descriptions-item>
        <el-descriptions-item label="默认库存金额">{{ detailData.baseInventory }}</el-descriptions-item>
        <el-descriptions-item label="默认RTP">{{ detailData.baseRtp }}%</el-descriptions-item>
        <el-descriptions-item label="默认高爆库存触发金额">{{ detailData.baseInventoryHeight }}</el-descriptions-item>
        <el-descriptions-item label="高爆库存抽取时间间隔（分钟）">{{
            detailData.inventoryHeightExtractionInterval
          }}
        </el-descriptions-item>
        <el-descriptions-item label="高爆库存抽取比例（%）">{{
            detailData.inventoryHeightExtractionRatio
          }}
        </el-descriptions-item>
        <el-descriptions-item label="历史样本数据">{{ detailData.historicalSampleData }}</el-descriptions-item>
        <el-descriptions-item label="站点状态">
          <el-tag v-if="detailData.status === 0" type="success">正常</el-tag>
          <el-tag v-else-if="detailData.status === 1" type="danger">停用</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{
            formatTimeWithTimezone(detailData.createTime, 0)
          }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间" :span="2">{{
            formatTimeWithTimezone(detailData.updateTime, 0)
          }}
        </el-descriptions-item>
        <el-descriptions-item label="创建人" :span="2">{{ detailData.creatBy }}</el-descriptions-item>
        <el-descriptions-item label="更新人" :span="2">{{ detailData.updateBy }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailOpen = false">关 闭</el-button>
      </div>
    </el-dialog>

    <!-- 添加或修改站点对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-position="top" size="small">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="站点ID" prop="siteId" style="margin-bottom: 12px;">
              <el-input v-model="form.siteId" placeholder="请输入站点ID" :readonly="form.id !== undefined"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="站点名称" prop="siteName" style="margin-bottom: 12px;">
              <el-input v-model="form.siteName" placeholder="请输入站点名称"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="时区" prop="timeZone" style="margin-bottom: 12px;">
              <el-input-number v-model="form.timeZone" :min="0" :max="23" controls-position="right"
                               style="width: 100%"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="默认库存金额" prop="baseInventory" style="margin-bottom: 12px;">
              <el-input-number v-model="form.baseInventory" :precision="1" :step="0.01" :min="0"
                               controls-position="right"
                               style="width: 100%"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="默认RTP" prop="baseRtp" style="margin-bottom: 12px;">
              <el-input-number v-model="form.baseRtp" :precision="2" :step="0.01" :min="0" :max="100"
                               controls-position="right" style="width: 100%"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="高爆库存触发金额" prop="baseInventoryHeight" style="margin-bottom: 12px;">
              <el-input-number v-model="form.baseInventoryHeight" :precision="1" :step="0.01" :min="0"
                               controls-position="right" style="width: 100%"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="抽取时间间隔（分钟）" prop="inventoryHeightExtractionInterval"
                          style="margin-bottom: 12px;">
              <el-input-number v-model="form.inventoryHeightExtractionInterval" :min="1" controls-position="right"
                               style="width: 100%"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="抽取比例（%）" prop="inventoryHeightExtractionRatio" style="margin-bottom: 12px;">
              <el-input-number v-model="form.inventoryHeightExtractionRatio" :precision="1" :step="0.01" :min="0"
                               :max="100"
                               controls-position="right" style="width: 100%"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="历史样本数据" prop="historicalSampleData" style="margin-bottom: 12px;">
              <el-input-number v-model="form.historicalSampleData" :precision="1" :step="0.01" :min="0"
                               controls-position="right" style="width: 100%"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="站点状态" prop="status" style="margin-bottom: 12px;">
              <el-radio-group v-model="form.status">
                <el-radio :label="0">正常</el-radio>
                <el-radio :label="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark" style="margin-bottom: 12px;">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"/>
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
import {sitePage, getSite, delSite, addSite, updateSite, syncSiteOdds} from "@/api/biz/site";
import {formatTimeWithTimezone} from "@/utils/time";

export default {
  name: "Site",
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
      // 站点表格数据
      siteList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        siteId: undefined,
        siteName: undefined,
        status: undefined
      },
      // 表单参数
      form: {
        id: undefined,
        siteId: undefined,
        siteName: undefined,
        timeZone: 0,
        baseInventory: 100000,
        baseRtp: 97,
        baseInventoryHeight: 110000,
        inventoryHeightExtractionInterval: 2,
        inventoryHeightExtractionRatio: 10,
        historicalSampleData: 100000,
        status: 0,
        createTime: undefined,
        updateTime: undefined,
        creatBy: undefined,
        updateBy: undefined,
        remark: undefined
      },
      // 表单校验
      rules: {
        siteId: [
          {required: true, message: "站点ID不能为空", trigger: "blur"}
        ],
        siteName: [
          {required: true, message: "站点名称不能为空", trigger: "blur"}
        ],
        timeZone: [
          {required: true, message: "时区不能为空", trigger: "blur"}
        ],
        baseInventory: [
          {required: true, message: "默认库存金额不能为空", trigger: "blur"}
        ],
        baseRtp: [
          {required: true, message: "默认RTP不能为空", trigger: "blur"}
        ],
        baseInventoryHeight: [
          {required: true, message: "默认高爆库存触发金额不能为空", trigger: "blur"}
        ],
        inventoryHeightExtractionInterval: [
          {required: true, message: "高爆库存抽取时间间隔不能为空", trigger: "blur"}
        ],
        inventoryHeightExtractionRatio: [
          {required: true, message: "高爆库存抽取比例不能为空", trigger: "blur"}
        ],
        historicalSampleData: [
          {required: true, message: "历史样本数据不能为空", trigger: "blur"}
        ]
      },
      // 详情数据
      detailData: {},
      // 详情对话框是否显示
      detailOpen: false
    };
  },
  created() {
    this.getList();
  },
  methods: {
    formatTimeWithTimezone,
    /** 查询站点列表 */
    getList() {
      this.loading = true;
      sitePage(this.queryParams).then(response => {
        if (response.code === 200) {
          this.siteList = response.content.list;
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
        siteId: undefined,
        siteName: undefined,
        timeZone: 0,
        baseInventory: 100000,
        baseRtp: 97,
        baseInventoryHeight: 110000,
        inventoryHeightExtractionInterval: 2,
        inventoryHeightExtractionRatio: 10,
        historicalSampleData: 100000,
        status: 0,
        createTime: undefined,
        updateTime: undefined,
        creatBy: undefined,
        updateBy: undefined,
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
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加站点";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getSite(id).then(response => {
        if (response.code === 200) {
          this.form = response.content;
          this.open = true;
          this.title = "修改站点";
        } else {
          this.$modal.msgError(response.message);
        }
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateSite(this.form).then(response => {
              if (response.code === 200) {
                this.$modal.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.$modal.msgError(response.message);
              }
            });
          } else {
            addSite(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除站点ID为"' + ids + '"的数据项？').then(function () {
        return delSite(ids);
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
    /** 详情按钮操作 */
    handleDetail(row) {
      // 直接从 scope.row 获取数据，无需重新请求API
      this.detailData = {...row};
      this.detailOpen = true;
    },

    /** 同步库存按钮操作 */
    handleSyncOdds(row) {
      const siteId = row.siteId;
      const siteName = row.siteName;

      this.$modal.confirm('是否确认同步站点"' + siteName + '"的库存数据？').then(() => {
        // 显示加载状态
        this.$modal.loading("正在同步库存数据，请稍候...");

        return syncSiteOdds(siteId);
      }).then(response => {
        if (response.code === 200) {
          this.$modal.closeLoading();
          this.$modal.msgSuccess("库存同步成功！");

        } else {
          this.$modal.closeLoading();
          this.$modal.msgError("库存同步失败：" + (response.message || response.msg || "未知错误"));
        }
      });
    }
  }
};
</script>
