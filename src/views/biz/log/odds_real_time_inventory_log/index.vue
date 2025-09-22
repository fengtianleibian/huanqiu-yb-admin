<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="站点" prop="siteId">
        <el-select
          v-model="queryParams.siteId"
          placeholder="请选择站点"
          filterable
          @change="handleQuery"
        >
          <el-option
            v-for="site in siteOptions"
            :key="site.siteId"
            :label="site.siteName"
            :value="site.siteId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="游戏名称" prop="gameId">
        <el-select
          v-model="queryParams.gameId"
          placeholder="请选择游戏"
          filterable
          clearable
          @change="handleQuery"
        >
          <el-option
            v-for="game in gameOptions"
            :key="game.id"
            :label="game.name"
            :value="game.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="库存名" prop="oddsName">
        <el-input
          v-model="queryParams.oddsName"
          placeholder="请输入库存名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="操作类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择操作类型" clearable>
          <el-option label="更新实时库存" :value="1" />
          <el-option label="默认库存抽取到高爆库存" :value="2" />
          <el-option label="高爆库存接收默认库存抽取" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作时间" prop="dateRange">
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          format="yyyy-MM-dd HH:mm:ss"
          value-format="timestamp"
          @change="handleDateChange"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="oddsRealTimeInventoryLogList">
      <el-table-column label="站点名称" align="center" prop="siteId">
        <template slot-scope="scope">
          <span>{{ getSiteName(scope.row.siteId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="游戏名称" align="center" prop="gameName"/>
      <el-table-column label="库存名" align="center" prop="oddsName" />
      <el-table-column label="库存类型" align="center" prop="gameOddsType">
        <template slot-scope="scope">
          <span>{{ getGameOddsTypeName(scope.row.gameOddsType) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作类型" align="center" prop="type">
        <template slot-scope="scope">
          <el-tag :type="getOperateTypeTagType(scope.row.type)">
            {{ getOperateTypeName(scope.row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作金额" align="center" prop="operateAmount">
        <template slot-scope="scope">
          <span>{{ scope.row.operateAmount ? scope.row.operateAmount.toFixed(2) : '0.00' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作前金额" align="center" prop="operateBeforeAmount">
        <template slot-scope="scope">
          <span>{{ scope.row.operateBeforeAmount ? scope.row.operateBeforeAmount.toFixed(2) : '0.00' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作后金额" align="center" prop="operateAfterAmount">
        <template slot-scope="scope">
          <span>{{ scope.row.operateAfterAmount ? scope.row.operateAfterAmount.toFixed(2) : '0.00' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTimeWithTimezone(scope.row.createTime, getSiteTimezone(scope.row.siteId)) }}</span>
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
  </div>
</template>

<script>
import { getOddsRealTimeInventoryLogPage } from "@/api/biz/odds_real_time_inventory_log";
import { sitePage } from "@/api/biz/site";
import { getGameList } from "@/api/biz/game";
import { parseTimeWithTimezone } from "@/utils/ruoyi";

export default {
  name: "OddsRealTimeInventoryLog",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 游戏库存金额变动日志表格数据
      oddsRealTimeInventoryLogList: [],
      // 站点选项
      siteOptions: [],
      // 游戏选项
      gameOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        siteId: undefined,
        gameId: undefined,
        oddsName: undefined,
        type: undefined,
        beginTime: undefined,
        endTime: undefined
      },
      // 时间范围选择器
      dateRange: [],
      // 导入的工具函数
      parseTimeWithTimezone: parseTimeWithTimezone
    };
  },
  created() {
    this.getSiteOptions();
    this.getGameOptions();
  },
  methods: {
    /** 获取游戏选项 */
    getGameOptions() {
      getGameList().then(response => {
        if (response.code === 200) {
          this.gameOptions = response.content;
        }
      });
    },
    /** 获取站点选项 */
    getSiteOptions() {
      sitePage({ pageSize: 1000 }).then(response => {
        if (response.code === 200) {
          // 过滤掉默认站点（siteId = 0）
          this.siteOptions = response.content.list.filter(site => site.siteId !== "0");
          // 如果有站点选项，默认选择第一个
          if (this.siteOptions.length > 0) {
            this.queryParams.siteId = this.siteOptions[0].siteId;
          }
          this.getList(); // 获取游戏库存金额变动日志列表
        }
      });
    },
    /** 获取站点名称和时区 */
    getSiteName(siteId) {
      const site = this.siteOptions.find(item => item.siteId === siteId);
      return site ? site.siteName : siteId;
    },
    /** 获取游戏名称 */
    getGameName(gameId) {
      const game = this.gameOptions.find(item => item.id === gameId);
      return game ? game.name : gameId;
    },
    /** 获取站点时区 */
    getSiteTimezone(siteId) {
      const site = this.siteOptions.find(item => item.siteId === siteId);
      return site ? site.timeZone : 0;
    },
    /** 获取库存类型名称 */
    getGameOddsTypeName(type) {
      const typeMap = {
        1: '普通库存',
        2: '特殊库存',
        3: 'VIP库存'
      };
      return typeMap[type] || type;
    },
    /** 获取操作类型名称 */
    getOperateTypeName(type) {
      const typeMap = {
        1: '更新实时库存',
        2: '默认库存抽取到高爆库存',
        3: '高爆库存接收默认库存抽取'
      };
      return typeMap[type] || type;
    },
    /** 获取操作类型标签的颜色 */
    getOperateTypeTagType(type) {
      switch (type) {
        case 1:
          return 'success';
        case 2:
          return 'warning';
        case 3:
          return 'info';
        default:
          return '';
      }
    },
    /** 查询游戏库存金额变动日志列表 */
    getList() {
      this.loading = true;
      getOddsRealTimeInventoryLogPage(this.queryParams).then(response => {
        if (response.code === 200) {
          this.oddsRealTimeInventoryLogList = response.content.list;
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
      const currentSiteId = this.queryParams.siteId; // 保存当前站点ID
      this.resetForm("queryForm");
      this.queryParams.siteId = currentSiteId; // 恢复站点ID
      this.dateRange = []; // 清空时间范围
      this.queryParams.beginTime = undefined;
      this.queryParams.endTime = undefined;
      this.handleQuery();
    },
    /** 时间范围选择器变化 */
    handleDateChange(val) {
      if (val) {
        // 转换为UTC+0时区的秒数时间戳
        this.queryParams.beginTime = Math.floor(val[0] / 1000);
        this.queryParams.endTime = Math.floor(val[1] / 1000);
      } else {
        this.queryParams.beginTime = undefined;
        this.queryParams.endTime = undefined;
      }
      this.getList();
    }
  }
};
</script>
