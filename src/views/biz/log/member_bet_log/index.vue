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
      <el-form-item label="用户ID" prop="memberId">
        <el-input
          v-model="queryParams.memberId"
          placeholder="请输入用户ID"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="中奖情况" prop="isWin">
        <el-select v-model="queryParams.isWin" placeholder="请选择中奖情况" clearable>
          <el-option label="未中奖" :value="0"/>
          <el-option label="中奖" :value="1"/>
        </el-select>
      </el-form-item>
      <el-form-item label="库存" prop="oddsName">
        <el-select v-model="queryParams.oddsName" placeholder="请选择库存" clearable>
          <el-option label="默认库存" value="默认"/>
          <el-option label="新人库存" value="新人"/>
          <el-option label="高爆库存" value="高爆"/>
          <el-option label="异常库存" value="异常"/>
          <el-option label="福利库存" value="福利"/>
          <el-option label="点杀库存" value="点杀"/>
        </el-select>
      </el-form-item>
      <el-form-item label="游戏类型" prop="gameFreeType">
        <el-select v-model="queryParams.gameFreeType" placeholder="请选择游戏类型" clearable>
          <el-option label="正常游戏" :value="0"/>
          <el-option label="免费旋转" :value="1"/>
          <el-option label="宝箱游戏" :value="2"/>
        </el-select>
      </el-form-item>
      <el-form-item label="下注时间" prop="dateRange">
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

    <el-table v-loading="loading" :data="memberBetLogList">
      <el-table-column label="站点名称" align="center" prop="siteId">
        <template slot-scope="scope">
          <span>{{ getSiteName(scope.row.siteId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="游戏名称" align="center" prop="gameName">
        <template slot-scope="scope">
          <span>{{ getGameName(scope.row.gameId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户ID" align="center" prop="memberId"/>
      <el-table-column label="下注金额" align="center" prop="betAmount">
        <template slot-scope="scope">
          <span>{{ scope.row.betAmount ? scope.row.betAmount.toFixed(2) : '0.00' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="中奖情况" align="center" prop="isWin">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isWin === 1 ? 'success' : 'info'">
            {{ scope.row.isWin === 1 ? '中奖' : '未中奖' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="派奖金额" align="center" prop="winAmount">
        <template slot-scope="scope">
          <span>{{ scope.row.winAmount ? scope.row.winAmount.toFixed(2) : '0.00' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="库存" align="center" prop="oddsName"/>
      <el-table-column label="游戏类型" align="center" prop="gameFreeType">
        <template v-slot="scope">
          <span v-if="scope.row.gameFreeType === 0">正常游戏</span>
          <span v-if="scope.row.gameFreeType === 1">免费旋转</span>
          <span v-if="scope.row.gameFreeType === 2">宝箱游戏</span>
        </template>
      </el-table-column>
      <el-table-column label="库存范围" align="center" prop="oddsRangeName"/>
      <el-table-column label="下注时间" align="center" prop="createTime">
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
import {getMemberBetLogPage} from "@/api/biz/member_bet_log";
import {sitePage} from "@/api/biz/site";
import {getGameList} from "@/api/biz/game";
import {parseTimeWithTimezone} from "@/utils/ruoyi";

export default {
  name: "MemberBetLog",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户下注日志表格数据
      memberBetLogList: [],
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
        memberId: undefined,
        isWin: undefined,
        gameFreeType: undefined,
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
    /** 获取站点选项 */
    getSiteOptions() {
      sitePage({pageSize: 1000}).then(response => {
        if (response.code === 200) {
          // 过滤掉默认站点（siteId = 0）
          this.siteOptions = response.content.list.filter(site => site.siteId !== "0");
          // 如果有站点选项，默认选择第一个
          if (this.siteOptions.length > 0) {
            this.queryParams.siteId = this.siteOptions[0].siteId;
          }
          this.getList(); // 获取用户下注日志列表
        }
      });
    },
    /** 获取站点名称和时区 */
    getSiteName(siteId) {
      const site = this.siteOptions.find(item => item.siteId === siteId);
      return site ? site.siteName : siteId;
    },
    /** 获取站点时区 */
    getSiteTimezone(siteId) {
      const site = this.siteOptions.find(item => item.siteId === siteId);
      return site ? site.timeZone : 0;
    },
    /** 获取游戏选项 */
    getGameOptions() {
      getGameList().then(response => {
        if (response.code === 200) {
          this.gameOptions = response.content || [];
        }
      }).catch(error => {
        console.error('获取游戏列表异常:', error);
      });
    },
    /** 获取游戏名称 */
    getGameName(gameId) {
      const game = this.gameOptions.find(item => item.id === gameId);
      return game ? game.name : gameId;
    },
    /** 查询用户下注日志列表 */
    getList() {
      this.loading = true;
      getMemberBetLogPage(this.queryParams).then(response => {
        if (response.code === 200) {
          this.memberBetLogList = response.content.list;
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
