<template>
  <div class="app-container">

    <!-- 活动列表 -->
    <div v-loading="loading" class="activity-container">
      <!-- 空状态 -->
      <div v-if="!loading && activityList.length === 0" class="empty-state">
        <el-empty description="暂无活动数据">
          <el-button type="primary" @click="getList">刷新</el-button>
          <el-button type="success" icon="el-icon-plus" @click="handleAdd">新增活动</el-button>
        </el-empty>
      </div>

      <!-- 操作栏 -->
      <div v-else class="action-bar">
        <div class="action-left">
          <span class="activity-count">共 {{ activityList.length }} 个活动</span>
        </div>
        <div class="action-right">
          <el-button type="primary" icon="el-icon-refresh" size="small" @click="getList">刷新</el-button>
          <el-button type="success" icon="el-icon-plus" size="small" @click="handleAdd">新增活动</el-button>
        </div>
      </div>

      <!-- 活动卡片列表 -->
      <div v-if="!loading && activityList.length > 0" class="activity-cards">
        <div 
          v-for="activity in activityList" 
          :key="activity.id" 
          class="activity-card"
        >
          <!-- 活动类型标识 -->
          <div class="activity-type-badge" :class="getActivityTypeClass(activity.type)">
            {{ getActivityTypeName(activity.type) }}
          </div>

          <!-- 活动内容 -->
          <div class="activity-content">
            <div class="activity-header">
              <h3>{{ activity.name || getDefaultActivityName(activity.type) }}</h3>
              <el-switch
                v-model="activity.status"
                :active-value="1"
                :inactive-value="0"
                active-text="启用"
                inactive-text="禁用"
                @change="handleStatusChange(activity)"
              />
            </div>

            <div class="activity-details">
              <!-- 积分兑换奖金活动详情 -->
              <div v-if="activity.type === 1" class="exchange-details">
                <div class="detail-row">
                  <span class="label">兑换比例:</span>
                  <span class="value">{{ activity.exchangeRatio || 1 }}:1</span>
                </div>
                <div class="detail-row">
                  <span class="label">最小兑换:</span>
                  <span class="value">{{ activity.minAmount || '100' }} 积分</span>
                </div>
                <div class="detail-row">
                  <span class="label">最大兑换:</span>
                  <span class="value">{{ activity.maxAmount || '10000' }} 积分</span>
                </div>
                <div class="detail-row">
                  <span class="label">打码倍数:</span>
                  <span class="value">{{ activity.wageringMultiplier || '0' }}</span>
                </div>
              </div>

              <!-- 积分抽奖活动详情 -->
              <div v-if="activity.type === 2" class="lottery-details">
                <div class="detail-row">
                  <span class="label">抽奖消耗:</span>
                  <span class="value">{{ activity.costPoints || '100' }} 积分/次</span>
                </div>
                <div class="detail-row">
                  <span class="label">奖品数量:</span>
                  <span class="value">{{ getPrizesCount(activity.prizes) }} 个</span>
                </div>
                <div class="detail-row">
                  <span class="label">奖品类型:</span>
                  <span class="value">积分奖品</span>
                </div>
              </div>

              <!-- 通用信息 -->
              <div class="common-details">
                <div class="detail-row">
                  <span class="label">创建时间:</span>
                  <span class="value">{{ parseTime(activity.createTime) }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">更新时间:</span>
                  <span class="value">{{ parseTime(activity.updateTime) }}</span>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="activity-actions">
              <el-button
                type="primary"
                size="small"
                icon="el-icon-edit"
                @click="handleEdit(activity)"
              >
                编辑配置
              </el-button>
              <el-button
                type="success"
                size="small"
                icon="el-icon-view"
                @click="handleViewDetails(activity)"
              >
                查看详情
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑活动配置对话框 -->
    <el-dialog 
      :title="dialogTitle" 
      :visible.sync="open" 
      width="800px" 
      append-to-body
      :close-on-click-modal="false"
      class="activity-dialog"
    >
      <div class="dialog-content">
        <!-- 活动类型选择 -->
        <div v-if="!form.id" class="activity-type-selection">
          <h3>选择活动类型</h3>
          <div class="type-cards">
            <div 
              class="type-card" 
              :class="{ active: form.type === 1 }"
              @click="selectActivityType(1)"
            >
              <div class="type-icon exchange-icon">
                <i class="el-icon-money"></i>
              </div>
              <div class="type-info">
                <h4>积分兑换奖金</h4>
                <p>用户可以使用积分直接兑换现金奖金</p>
              </div>
            </div>
            <div 
              class="type-card" 
              :class="{ active: form.type === 2 }"
              @click="selectActivityType(2)"
            >
              <div class="type-icon lottery-icon">
                <i class="el-icon-present"></i>
              </div>
              <div class="type-info">
                <h4>积分抽奖</h4>
                <p>用户消耗积分参与转盘抽奖获得奖品</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 活动配置表单 -->
        <div v-if="form.type" class="activity-form">
          <h3>活动配置</h3>
          
          <el-form ref="form" :model="form" :rules="rules" label-width="120px">
            
            <!-- 积分兑换奖金配置 -->
            <template v-if="form.type === 1">
              <div class="config-section">
                <h4><i class="el-icon-setting"></i> 兑换配置</h4>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="活动名称" prop="name">
                      <el-input 
                        v-model="form.name" 
                        placeholder="请输入活动名称"
                        size="small"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <!-- 占位列，保持布局一致 -->
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="兑换比例" prop="exchangeRatio">
                      <div class="ratio-input-wrapper">
                        <el-input 
                          v-model="form.exchangeRatio" 
                          placeholder="输入积分数量"
                          @input="handleRatioInput"
                          class="ratio-input"
                        />
                        <span class="ratio-suffix">:1</span>
                      </div>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="打码倍数" prop="wageringMultiplier">
                      <el-input-number 
                        v-model="form.wageringMultiplier" 
                        :min="0" 
                        :max="100"
                        placeholder="打码倍数"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="最小兑换" prop="minAmount">
                      <el-input-number 
                        v-model="form.minAmount" 
                        :min="1" 
                        :max="999999"
                        placeholder="最小兑换积分"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="最大兑换" prop="maxAmount">
                      <el-input-number 
                        v-model="form.maxAmount" 
                        :min="1" 
                        :max="999999"
                        placeholder="最大兑换积分"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </template>

            <!-- 积分抽奖配置 -->
            <template v-if="form.type === 2">
              <div class="config-section">
                <h4><i class="el-icon-setting"></i> 抽奖配置</h4>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="活动名称" prop="name">
                      <el-input 
                        v-model="form.name" 
                        placeholder="请输入活动名称"
                        size="small"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="抽奖消耗" prop="costPoints">
                      <el-input-number 
                        v-model="form.costPoints" 
                        :min="1" 
                        :max="99999"
                        placeholder="每次抽奖消耗积分"
                        style="width: 100%"
                        size="small"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>

              <!-- 奖品配置 -->
              <div class="config-section">
                <h4><i class="el-icon-gift"></i> 奖品配置</h4>
                <div class="prizes-container">
                  <div class="prizes-header">
                    <span>配置10个奖品（转盘上的所有奖品）</span>
                  </div>
                  
                  <div class="prizes-list">
                    <div 
                      v-for="(prize, index) in form.prizes" 
                      :key="index"
                      class="prize-item"
                    >
                      <div class="prize-header">
                        <span class="prize-number">奖品 {{ index + 1 }}</span>
                      </div>
                      
                      <el-row :gutter="15">
                        <el-col :span="12">
                          <el-form-item label="奖品名称">
                            <el-input 
                              v-model="prize.name" 
                              placeholder="如: 100积分"
                              size="small"
                            />
                          </el-form-item>
                        </el-col>
                        <el-col :span="12">
                          <el-form-item label="奖品类型">
                            <el-select v-model="prize.type" placeholder="选择类型" size="small" style="width: 100%">
                              <el-option label="积分" value="points"></el-option>
                              <el-option label="现金" value="cash"></el-option>
                              <el-option label="谢谢参与" value="empty"></el-option>
                            </el-select>
                          </el-form-item>
                        </el-col>
                      </el-row>
                      
                      <el-row :gutter="15">
                        <el-col :span="12">
                          <el-form-item label="奖品价值">
                            <el-input-number 
                              v-model="prize.value" 
                              :min="0" 
                              :max="99999"
                              placeholder="积分数量"
                              size="small"
                              style="width: 100%"
                              controls-position="right"
                            />
                          </el-form-item>
                        </el-col>
                        <el-col :span="12">
                          <el-form-item label="中奖概率(%)">
                            <el-input-number 
                              v-model="prize.probability" 
                              :min="0.1" 
                              :max="100"
                              :precision="1"
                              placeholder="概率"
                              size="small"
                              style="width: 100%"
                              controls-position="right"
                            />
                          </el-form-item>
                        </el-col>
                      </el-row>
                    </div>
                  </div>
                  
                  <div class="probability-total">
                    <span>总概率: {{ getTotalProbability() }}%</span>
                    <span v-if="getTotalProbability() !== 100" class="error-text">
                      （概率总和应为100%）
                    </span>
                  </div>
                </div>
              </div>
            </template>

            <div class="config-section">
              <h4><i class="el-icon-switch-button"></i> 活动状态</h4>
              <div class="status-selector">
                <div 
                  class="status-option" 
                  :class="{ active: form.status === 1 }"
                  @click="form.status = 1"
                >
                  <div class="status-icon enabled">
                    <i class="el-icon-check"></i>
                  </div>
                  <div class="status-info">
                    <span class="status-title">启用</span>
                  </div>
                </div>
                <div 
                  class="status-option" 
                  :class="{ active: form.status === 0 }"
                  @click="form.status = 0"
                >
                  <div class="status-icon disabled">
                    <i class="el-icon-close"></i>
                  </div>
                  <div class="status-info">
                    <span class="status-title">禁用</span>
                  </div>
                </div>
              </div>
            </div>
          </el-form>
        </div>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel" size="large">取 消</el-button>
        <el-button 
          type="primary" 
          @click="submitForm" 
          size="large"
          :loading="submitting"
        >
          确 定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listActivityPoints,
  getActivityPoints,
  addActivityPoints,
  updateActivityPoints,
  delActivityPoints
} from "@/api/biz/activityPoints";

export default {
  name: "PointsActivity",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 活动列表数据
      activityList: [],
      // 弹出层标题
      dialogTitle: "",
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: {},
      // 提交状态
      submitting: false,
      // 表单校验
      rules: {
        type: [
          {required: true, message: "活动类型不能为空", trigger: "change"}
        ],
        name: [
          {required: true, message: "活动名称不能为空", trigger: "blur"},
        ],
        exchangeRatio: [
          {required: true, message: "兑换比例不能为空", trigger: "blur"}
        ],
        minAmount: [
          {required: true, message: "最小兑换不能为空", trigger: "blur"}
        ],
        maxAmount: [
          {required: true, message: "最大兑换不能为空", trigger: "blur"}
        ],
        costPoints: [
          {required: true, message: "抽奖消耗不能为空", trigger: "blur"}
        ],
        winRate: [
          {required: true, message: "中奖概率不能为空", trigger: "blur"}
        ],
        status: [
          {required: true, message: "活动状态不能为空", trigger: "change"}
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询活动列表 */
    getList() {
      this.loading = true;
      
      listActivityPoints().then(response => {
        if (response.code === 200) {
          this.activityList = response.data || [];
          this.loading = false;
        } else {
          this.$modal.msgError(response.message);
          this.loading = false;
        }
      }).catch(() => {
        this.loading = false;
      });
    },

    /** 获取活动类型名称 */
    getActivityTypeName(type) {
      const typeMap = {
        1: '积分兑换奖金',
        2: '积分抽奖'
      };
      return typeMap[type] || '未知类型';
    },

    /** 获取活动类型样式类 */
    getActivityTypeClass(type) {
      const classMap = {
        1: 'type-exchange',
        2: 'type-lottery'
      };
      return classMap[type] || 'type-default';
    },

    /** 获取默认活动名称 */
    getDefaultActivityName(type) {
      const nameMap = {
        1: '积分兑换奖金活动',
        2: '积分抽奖活动'
      };
      return nameMap[type] || '积分活动';
    },

    /** 处理状态切换 */
    handleStatusChange(activity) {
      const statusText = activity.status === 1 ? '启用' : '禁用';
      this.$modal.confirm(`确认${statusText}该活动吗？`).then(() => {
        // 调用更新状态的API
        updateActivityPoints(activity).then(response => {
          if (response.code === 200) {
            this.$modal.msgSuccess(`${statusText}成功`);
            this.getList();
          } else {
            this.$modal.msgError(response.message);
            // 恢复原状态
            activity.status = activity.status === 1 ? 0 : 1;
          }
        }).catch(() => {
          // 恢复原状态
          activity.status = activity.status === 1 ? 0 : 1;
        });
      }).catch(() => {
        // 取消操作，恢复原状态
        activity.status = activity.status === 1 ? 0 : 1;
      });
    },

    /** 新增活动 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.dialogTitle = "新增活动";
    },

    /** 选择活动类型 */
    selectActivityType(type) {
      this.form.type = type;
      this.handleTypeChange(type);
    },

    /** 编辑活动 */
    handleEdit(activity) {
      this.reset();
      // 获取完整的活动信息
      getActivityPoints(activity.id).then(response => {
        if (response.code === 200) {
          this.form = response.data;
          // 如果prizes是字符串，需要解析为数组
          if (this.form.prizes && typeof this.form.prizes === 'string') {
            try {
              this.form.prizes = JSON.parse(this.form.prizes);
            } catch (e) {
              console.error('解析prizes JSON失败:', e);
              this.form.prizes = [];
            }
          }
          this.open = true;
          this.dialogTitle = `编辑${this.getActivityTypeName(activity.type)}`;
        } else {
          this.$modal.msgError(response.message);
        }
      });
    },

    /** 处理活动类型切换 */
    handleTypeChange(type) {
      // 根据活动类型设置默认值
      if (type === 1) {
        // 积分兑换奖金默认值
        this.form = {
          ...this.form,
          type: 1,
          exchangeRatio: 100,
          minAmount: 100,
          maxAmount: 10000,
          wageringMultiplier: 0,
          name: this.form.name || '积分兑换奖金活动',
          prizes: [] // 兑换奖金不需要奖品
        };
      } else if (type === 2) {
        // 积分抽奖默认值
        this.form = {
          ...this.form,
          type: 2,
          costPoints: 100,
          name: this.form.name || '积分抽奖活动',
          prizes: this.getDefaultPrizes() // 初始化10个奖品
        };
      }
    },

    /** 获取默认奖品配置 */
    getDefaultPrizes() {
      return [
        { name: '100积分', value: 100, probability: 10, type: 'points' },
        { name: '50积分', value: 50, probability: 10, type: 'points' },
        { name: '30积分', value: 30, probability: 10, type: 'points' },
        { name: '20积分', value: 20, probability: 10, type: 'points' },
        { name: '10积分', value: 10, probability: 10, type: 'points' },
        { name: '5积分', value: 5, probability: 10, type: 'points' },
        { name: '3积分', value: 3, probability: 10, type: 'points' },
        { name: '2积分', value: 2, probability: 10, type: 'points' },
        { name: '1积分', value: 1, probability: 10, type: 'points' },
        { name: '谢谢参与', value: 0, probability: 10, type: 'empty' }
      ];
    },


    /** 计算总概率 */
    getTotalProbability() {
      if (!this.form.prizes || this.form.prizes.length === 0) {
        return 0;
      }
      
      const total = this.form.prizes.reduce((sum, prize) => {
        return sum + (prize.probability || 0);
      }, 0);
      
      return Math.round(total * 10) / 10; // 保留一位小数
    },

    /** 获取奖品数量 */
    getPrizesCount(prizes) {
      if (!prizes) return 0;
      
      // 如果prizes是字符串，尝试解析
      if (typeof prizes === 'string') {
        try {
          const parsedPrizes = JSON.parse(prizes);
          return Array.isArray(parsedPrizes) ? parsedPrizes.length : 0;
        } catch (e) {
          return 0;
        }
      }
      
      // 如果prizes是数组
      return Array.isArray(prizes) ? prizes.length : 0;
    },

    /** 处理兑换比例输入，只允许数字 */
    handleRatioInput(value) {
      // 只保留数字，移除所有非数字字符
      const numericValue = value.replace(/[^\d]/g, '');
      this.form.exchangeRatio = numericValue;
    },

    /** 查看活动详情 */
    handleViewDetails(activity) {
      this.$modal.msgInfo(`查看${activity.name || this.getDefaultActivityName(activity.type)}的详细信息`);
      // 这里可以打开详情对话框或跳转到详情页面
    },

    /** 取消按钮 */
    cancel() {
      this.open = false;
      this.reset();
    },

    /** 表单重置 */
    reset() {
      this.form = {
        id: undefined,
        type: undefined,
        name: undefined,
        exchangeRatio: undefined,
        minAmount: undefined,
        maxAmount: undefined,
        wageringMultiplier: 0,
        costPoints: undefined,
        winRate: undefined,
        status: 0,
        prizes: []
      };
      this.resetForm("form");
    },

    /** 提交表单 */
    submitForm() {
      // 如果是抽奖活动，验证奖品配置
      if (this.form.type === 2) {
        if (!this.form.prizes || this.form.prizes.length === 0) {
          this.$modal.msgError("请至少配置一个奖品");
          return;
        }
        
        if (this.getTotalProbability() !== 100) {
          this.$modal.msgError("奖品概率总和必须为100%");
          return;
        }
        
        // 验证奖品信息完整性
        for (let i = 0; i < this.form.prizes.length; i++) {
          const prize = this.form.prizes[i];
          if (!prize.name || !prize.type) {
            this.$modal.msgError(`奖品${i + 1}的名称和类型不能为空`);
            return;
          }
        }
      }
      
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.submitting = true;
          const isEdit = this.form.id !== undefined;
          
          // 准备请求数据，将prizes转换为JSON字符串
          const requestData = {
            ...this.form,
            prizes: JSON.stringify(this.form.prizes)
          };
          
          // 打印请求参数
          console.log(`${isEdit ? '编辑' : '新增'}活动请求参数:`, JSON.stringify(requestData, null, 2));
          
          if (isEdit) {
            // 编辑活动
            updateActivityPoints(requestData).then(response => {
              this.submitting = false;
              if (response.code === 200) {
                this.$modal.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.$modal.msgError(response.message);
              }
            }).catch(() => {
              this.submitting = false;
            });
          } else {
            // 新增活动
            addActivityPoints(requestData).then(response => {
              this.submitting = false;
              if (response.code === 200) {
                this.$modal.msgSuccess("新增成功");
                this.open = false;
                this.getList();
              } else {
                this.$modal.msgError(response.message);
              }
            }).catch(() => {
              this.submitting = false;
            });
          }
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}


.activity-container {
  min-height: 400px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-left {
  .activity-count {
    color: #606266;
    font-size: 14px;
    font-weight: 500;
  }
}

.action-right {
  display: flex;
  gap: 10px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.activity-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.activity-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
}

.activity-type-badge {
  position: absolute;
  top: 0;
  right: 0;
  padding: 6px 12px;
  border-radius: 0 8px 0 8px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  
  &.type-exchange {
    background: linear-gradient(135deg, #67c23a, #85ce61);
  }
  
  &.type-lottery {
    background: linear-gradient(135deg, #e6a23c, #f0c78a);
  }
  
  &.type-default {
    background: linear-gradient(135deg, #909399, #b1b3b8);
  }
}

.activity-content {
  padding: 20px;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
    color: #303133;
    font-size: 18px;
    font-weight: 600;
  }
}

.activity-details {
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f5f7fa;
  
  &:last-child {
    border-bottom: none;
  }
  
  .label {
    color: #606266;
    font-size: 14px;
    font-weight: 500;
  }
  
  .value {
    color: #303133;
    font-size: 14px;
    font-weight: 600;
  }
}

.exchange-details,
.lottery-details,
.common-details {
  margin-bottom: 15px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.activity-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

// 响应式设计
@media (max-width: 768px) {
  .activity-cards {
    grid-template-columns: 1fr;
  }
  
  .activity-content {
    padding: 15px;
  }
  
  .activity-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .activity-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
}

// 对话框样式优化
.dialog-footer {
  text-align: right;
}

// 表单样式优化
  .el-form-item {
    margin-bottom: 18px;
  }
  
  .ratio-input-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .ratio-input {
    flex: 1;
  }
  
  .ratio-suffix {
    color: #606266;
    font-weight: 500;
    white-space: nowrap;
  }

// 状态开关样式
.el-switch {
  .el-switch__label {
    color: #606266;
    font-weight: 500;
  }
}

// 活动类型选择样式
.activity-type-option {
  display: flex;
  align-items: center;
  gap: 8px;
  
  i {
    font-size: 16px;
    color: #409eff;
  }
}

// 活动类型单选按钮样式优化
.el-radio {
  margin-right: 20px;
  
  .el-radio__label {
    padding-left: 8px;
    font-weight: 500;
  }
}

// 响应式设计 - 头部
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

// 对话框样式
.activity-dialog {
  .el-dialog__body {
    padding: 20px;
  }
}

.dialog-content {
  .activity-type-selection {
    margin-bottom: 30px;
    
    h3 {
      margin: 0 0 20px 0;
      color: #303133;
      font-size: 18px;
      font-weight: 600;
    }
  }
  
  .type-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }
  
  .type-card {
    border: 2px solid #e4e7ed;
    border-radius: 8px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #fff;
    
    &:hover {
      border-color: #409eff;
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
    }
    
    &.active {
      border-color: #409eff;
      background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
    }
  }
  
  .type-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
    
    i {
      font-size: 20px;
      color: #fff;
    }
    
    &.exchange-icon {
      background: linear-gradient(135deg, #67c23a, #85ce61);
    }
    
    &.lottery-icon {
      background: linear-gradient(135deg, #e6a23c, #f0c78a);
    }
  }
  
  .type-info {
    h4 {
      margin: 0 0 5px 0;
      color: #303133;
      font-size: 14px;
      font-weight: 600;
    }
    
    p {
      margin: 0;
      color: #606266;
      font-size: 12px;
      line-height: 1.4;
    }
  }
  
  .activity-form {
    h3 {
      margin: 0 0 20px 0;
      color: #303133;
      font-size: 18px;
      font-weight: 600;
      padding-bottom: 10px;
      border-bottom: 2px solid #409eff;
    }
  }
  
  .config-section {
    margin-bottom: 25px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #409eff;
    
    h4 {
      margin: 0 0 15px 0;
      color: #303133;
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      
      i {
        color: #409eff;
      }
    }
  }
  
  .prizes-container {
    background: #fff;
    border-radius: 8px;
    padding: 15px;
    border: 1px solid #e4e7ed;
  }
  
  .prizes-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e4e7ed;
    
    span {
      color: #606266;
      font-weight: 500;
    }
  }
  
  .prizes-list {
    max-height: 400px;
    overflow-y: auto;
  }
  
  .prize-item {
    background: #fafbfc;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 15px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .prize-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    
    .prize-number {
      color: #303133;
      font-weight: 600;
      font-size: 14px;
    }
  }
  
  .probability-total {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #e4e7ed;
    text-align: center;
    font-weight: 600;
    
    .error-text {
      color: #f56c6c;
      margin-left: 10px;
    }
  }
  
  .status-selector {
    display: flex;
    gap: 15px;
    margin-top: 10px;
  }
  
  .status-option {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 15px;
    border: 2px solid #e4e7ed;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #fff;
    
    &:hover {
      border-color: #409eff;
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
    }
    
    &.active {
      border-color: #409eff;
      background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
    }
  }
  
  .status-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    i {
      font-size: 18px;
      color: #fff;
    }
    
    &.enabled {
      background: linear-gradient(135deg, #67c23a, #85ce61);
    }
    
    &.disabled {
      background: linear-gradient(135deg, #f56c6c, #f78989);
    }
  }
  
  .status-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .status-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }
  
  .status-desc {
    font-size: 12px;
    color: #909399;
  }
}

// 对话框底部按钮样式
.dialog-footer {
  text-align: right;
  padding: 20px;
  border-top: 1px solid #e4e7ed;
  background: #fafbfc;
  
  .el-button {
    margin-left: 10px;
    min-width: 100px;
  }
}

// 响应式设计 - 对话框
@media (max-width: 768px) {
  .activity-dialog {
    .el-dialog {
      width: 95% !important;
      margin: 0 auto;
    }
  }
  
  .type-cards {
    grid-template-columns: 1fr !important;
  }
  
  .prizes-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style>
