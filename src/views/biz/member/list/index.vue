<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="用户名" prop="memberName">
        <el-input
          v-model="queryParams.memberName"
          placeholder="请输入用户名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择用户状态" clearable>
          <el-option label="正常" :value="0"></el-option>
          <el-option label="锁定" :value="1"></el-option>
          <el-option label="禁用" :value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="注册IP" prop="registerIp">
        <el-input
          v-model="queryParams.registerIp"
          placeholder="请输入注册IP"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="登录IP" prop="loginIp">
        <el-input
          v-model="queryParams.loginIp"
          placeholder="请输入登录IP"
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
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="memberList">
      <el-table-column label="用户ID" align="center" prop="id" width="120"/>
      <el-table-column label="用户名" align="center" prop="memberName">
        <template slot-scope="scope">
          <div>
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              <el-button type="text" @click="handleView(scope.row)" style="padding: 0; color: #8B4513;">
                {{ scope.row.memberName }}
              </el-button>
              <el-tooltip placement="right">
                <div slot="content">
                  <div>直属下级: {{ scope.row.directlyUnderCount }}</div>
                  <div>非直属下级: {{ scope.row.notDirectlyUnderCount }}</div>
                </div>
                <span style="cursor: pointer; color: #409EFF; font-size: 12px;">[{{
                    scope.row.directlyUnderCount + scope.row.notDirectlyUnderCount
                  }}]</span>
              </el-tooltip>
            </div>
            <div style="margin-top: 4px; font-size: 12px;">
              <span v-if="scope.row.parentId" style="color: #409EFF;">{{ scope.row.parentMemberName || scope.row.parentId }} </span>
              <el-tooltip content="修改所属代理" placement="right">
                <span style="cursor: pointer;">✏️</span>
              </el-tooltip>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="账号余额" align="center" prop="balance" >
        <template slot-scope="scope">
          <span>{{ formatMoney(scope.row.balance) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="积分" align="center" prop="integral">
        <template slot-scope="scope">
          <span>{{ formatMoney(scope.row.integral) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="累计充值" align="center" prop="totalRecharge" >
        <template slot-scope="scope">
          <span>{{ formatMoney(scope.row.totalRecharge) }}</span>
        </template>
      </el-table-column>
       <el-table-column label="累计提现" align="center" prop="totalWithdrawal" >
         <template slot-scope="scope">
           <span>{{ formatMoney(scope.row.totalWithdrawal) }}</span>
         </template>
       </el-table-column>
       <el-table-column label="现金盈亏" align="center">
         <template slot-scope="scope">
           <span :style="{ color: getProfitLossColor(scope.row.totalRecharge, scope.row.totalWithdrawal) }">
             {{ formatMoney(scope.row.totalRecharge - scope.row.totalWithdrawal) }}
           </span>
         </template>
       </el-table-column>
       <el-table-column label="会员等级" align="center" prop="vip" >
         <template slot-scope="scope">
           <span>{{ getVipText(scope.row.vip) }} </span>
           <el-tooltip content="修改等级" placement="top">
             <span style="cursor: pointer;">✏️</span>
           </el-tooltip>
         </template>
       </el-table-column>
       <el-table-column label="会员类型" align="center" prop="isAgent">
         <template slot-scope="scope">
           <span>{{ getMemberTypeText(scope.row.isAgent) }}</span>
         </template>
       </el-table-column>
       <el-table-column label="用户状态" align="center" prop="status">
         <template slot-scope="scope">
           <el-tag :type="getStatusTagType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
         </template>
       </el-table-column>
      <el-table-column label="所属代理" align="center" prop="belongAgent" width="120"/>

      <el-table-column label="最后登录时间" align="center" prop="lastLoginTime" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.lastLoginTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
    
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="100" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
            v-hasPermi="['member:query']"
          >查看
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


    <!-- 查看会员详情对话框 -->
    <el-dialog title="会员详情" :visible.sync="viewOpen" width="800px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户ID">{{ viewData.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ viewData.memberName }}</el-descriptions-item>
        <el-descriptions-item label="真实姓名">{{ viewData.realName || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="VIP等级">{{ getVipText(viewData.vip) }}</el-descriptions-item>
        <el-descriptions-item label="用户状态">
          <el-tag :type="getStatusTagType(viewData.status)">{{ getStatusText(viewData.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="上级用户">{{ viewData.parentMemberName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="所属代理">{{ viewData.belongAgent }}</el-descriptions-item>
        <el-descriptions-item label="余额">{{ formatMoney(viewData.balance) }}</el-descriptions-item>
        <el-descriptions-item label="积分">{{ formatMoney(viewData.integral) }}</el-descriptions-item>
        <el-descriptions-item label="累计充值">{{ formatMoney(viewData.totalRecharge) }}</el-descriptions-item>
        <el-descriptions-item label="累计提现">{{ formatMoney(viewData.totalWithdrawal) }}</el-descriptions-item>
        <el-descriptions-item label="直属下级数量">{{ viewData.directlyUnderCount }}</el-descriptions-item>
        <el-descriptions-item label="非直属下级数量">{{ viewData.notDirectlyUnderCount }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(viewData.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="最后登录时间">{{ parseTime(viewData.lastLoginTime) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script>
import {
  listMember
} from "@/api/biz/member";

export default {
  name: "Member",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 会员表格数据
      memberList: [],
      // 是否显示查看弹出层
      viewOpen: false,
      // 查看数据
      viewData: {},
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        memberName: undefined,
        status: undefined,
        registerIp: undefined,
        loginIp: undefined
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询会员列表 */
    getList() {
      this.loading = true;
      listMember(this.queryParams).then(response => {
        if (response.code === 200) {
          this.memberList = response.content.list;
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
    /** 查看按钮操作 */
    handleView(row) {
      this.viewData = row;
      this.viewOpen = true;
    },
    /** 获取VIP等级文本 */
    getVipText(vip) {
      const vipMap = {
        1: 'VIP1',
        2: 'VIP2',
        3: 'VIP3',
        4: 'VIP4',
        5: 'VIP5'
      };
      return vipMap[vip] || '未知';
    },
    /** 获取会员类型文本 */
    getMemberTypeText(isAgent) {
      const typeMap = {
        0: '会员',
        1: '代理'
      };
      return typeMap[isAgent] || '未知';
    },
    /** 获取用户状态文本 */
    getStatusText(status) {
      const statusMap = {
        0: '正常',
        1: '锁定',
        2: '禁用'
      };
      return statusMap[status] || '未知';
    },
    /** 获取用户状态标签类型 */
    getStatusTagType(status) {
      const typeMap = {
        0: 'success',
        1: 'warning',
        2: 'danger'
      };
      return typeMap[status] || 'info';
    },
    /** 格式化金额 */
    formatMoney(amount) {
      if (amount === null || amount === undefined) {
        return '0.00';
      }
      return parseFloat(amount).toFixed(2);
    },
    /** 获取现金盈亏颜色 */
    getProfitLossColor(totalRecharge, totalWithdrawal) {
      const profitLoss = parseFloat(totalRecharge) - parseFloat(totalWithdrawal);
      if (profitLoss > 0) {
        return '#F56C6C'; // 红色 - 盈利
      } else if (profitLoss < 0) {
        return '#8B4513'; // 棕色 - 亏损
      } else {
        return ''; // 普通色 - 持平
      }
    }
  }
};
</script>
