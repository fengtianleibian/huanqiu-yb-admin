<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>埃及赔率配置</span>
        <div style="float: right;">
          <el-select v-model="selectedSiteId" placeholder="请选择站点" style="width: 200px; margin-right: 10px;"
                     @change="handleSiteChange">
            <el-option
              v-for="site in siteList"
              :key="site.siteId"
              :label="site.siteName"
              :value="site.siteId">
            </el-option>
          </el-select>
          <el-button type="success" @click="handleRefresh">刷新</el-button>
          <el-button v-if="selectedSiteId !== 0" type="success" @click="handleRefresh">同步</el-button>
        </div>
      </div>


      <!-- 游戏赔率卡片列表 -->
      <div class="odds-cards-container">
        <!-- 如果有数据，显示实际数据卡片 -->
        <div v-if="oddsList.length > 0" class="data-cards">
          <el-row :gutter="24">
            <el-col :span="12" v-for="(item, index) in oddsList" :key="index">
              <div class="clean-odds-card">
                <!-- 卡片头部 -->
                <div class="card-header-clean">
                  <div class="header-content">
                    <div class="inventory-info">
                      <div class="inventory-icon" @click="openDrawer(item)">
                        <i :class="getCardIcon(item.inventoryName)"></i>
                      </div>
                      <div class="inventory-details">
                        <div class="inventory-name">{{ item.inventoryName }}</div>
                        <div class="inventory-params">
                          <span class="param-item">
                            <span class="param-label">库存:</span>
                            <span class="param-value">{{ formatMoney(item.baseInventory) }}</span>
                          </span>
                          <!-- 高爆库存(type=3)不显示RTP -->
                          <template v-if="item.type !== 3">
                            <span class="param-item">
                              <span class="param-label">RTP:</span>
                              <span class="param-value">{{ formatPercentage(item.baseRtp) }}</span>
                            </span>
                          </template>
                          <!-- 只有默认库存(type=1)才显示高爆配置参数 -->
                          <template v-if="item.type === 1">
                            <span class="param-item">
                              <span class="param-label">触发抽取金额:</span>
                              <span class="param-value">{{ formatMoney(item.baseInventoryHeight) }}</span>
                            </span>
                            <span class="param-item">
                              <span class="param-label">间隔:</span>
                              <span class="param-value">{{ item.inventoryHeightExtractionInterval || '-' }}分钟</span>
                            </span>
                            <span class="param-item">
                              <span class="param-label">比例:</span>
                              <span class="param-value">{{ item.inventoryHeightExtractionRatio * 100 || '-' }}%</span>
                            </span>
                          </template>
                        </div>
                      </div>
                    </div>
                    <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleUpdate(item)"
                               class="edit-btn">修改
                    </el-button>
                  </div>
                </div>

                <!-- 卡片内容 -->
                <div class="card-body-clean">
                  <!-- 实时状态 -->
                  <div class="config-section">
                    <div class="config-grid-two">
                      <div class="config-item" v-if="item.type !== 3">
                        <div class="config-label">实时RTP</div>
                        <div class="config-value" :class="getRtpColorClass(item.realTimeRtp)">
                          {{ formatPercentage(item.realTimeRtp) }}
                          <div v-if="selectedSiteId !== 0" style="font-size: 10px; color: #000000; margin-top: 8px;">
                            <div>总投注: {{ formatMoney(item.totalBetAmount || 0) }}</div>
                            <div>总派奖: {{ formatMoney(item.totalWinAmount || 0) }}</div>
                          </div>
                        </div>
                      </div>
                      <div class="config-item">
                        <div class="config-label">实时库存</div>
                        <div class="config-value"
                             :class="getInventoryColorClass(item.realTimeInventory, item.baseInventory)">
                          {{ formatMoney(item.realTimeInventory) }}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 如果没有数据，且站点ID为1时，显示6个默认卡片 -->
        <div v-else-if="selectedSiteId === 0" class="default-cards">
          <div class="template-cards-container">
            <el-row :gutter="24">
              <!-- 第一行：默认库存、新人库存、高爆库存 -->
              <el-col :span="8" v-for="(defaultItem, index) in defaultCards.slice(0, 3)" :key="'default-' + index">
                <div class="template-card">
                  <div class="card-icon">
                    <i :class="getCardIcon(defaultItem.inventoryName)"></i>
                  </div>
                  <div class="card-title">{{ defaultItem.inventoryName }}</div>
                  <div class="card-desc">{{ getCardDesc(defaultItem.inventoryName) }}</div>
                </div>
              </el-col>
            </el-row>

            <el-row :gutter="24" style="margin-top: 24px;">
              <!-- 第二行：异常库存、福利库存、点杀库存 -->
              <el-col :span="8" v-for="(defaultItem, index) in defaultCards.slice(3, 6)"
                      :key="'default-' + (index + 3)">
                <div class="template-card">
                  <div class="card-icon">
                    <i :class="getCardIcon(defaultItem.inventoryName)"></i>
                  </div>
                  <div class="card-title">{{ defaultItem.inventoryName }}</div>
                  <div class="card-desc">{{ getCardDesc(defaultItem.inventoryName) }}</div>
                </div>
              </el-col>
            </el-row>
            <div class="batch-create-section">
              <div class="batch-create-info">
                <i class="el-icon-info"></i>
                <span>将同时创建6个库存配置，包含默认库存、新人库存、高爆库存、异常库存、福利库存和点杀库存</span>
              </div>
              <el-button type="primary" size="large" @click="handleBatchCreate" round>
                <i class="el-icon-plus"></i>
                一键创建所有库存配置
              </el-button>
            </div>
          </div>
        </div>
      </div>

    </el-card>

    <!-- 修改赔率对话框 -->
    <el-dialog title="修改赔率配置" :visible.sync="editOddsOpen" width="900px" append-to-body>
      <div class="edit-form-container">
        <el-form ref="editForm" :model="editOddsForm" :rules="editRules" label-width="160px">
          <!-- 基本信息区域 -->
          <div class="form-section">
            <div class="section-header">
              <i class="el-icon-info"></i>
              <span>基本信息</span>
            </div>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="库存名称:" prop="inventoryName">
                  <el-input v-model="editOddsForm.inventoryName" disabled class="disabled-input"/>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 核心配置区域 -->
          <div class="form-section">
            <div class="section-header">
              <i class="el-icon-setting"></i>
              <span>核心配置</span>
            </div>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="默认库存金额:" prop="baseInventory">
                  <el-input-number v-model="editOddsForm.baseInventory" :precision="2" :step="100" :min="0"
                                   placeholder="请输入默认库存金额" class="full-width-input"/>
                </el-form-item>
              </el-col>
              <el-col :span="12" v-if="editOddsForm.type !== 3">
                <el-form-item label="默认RTP:" prop="baseRtp">
                  <el-input-number v-model="editOddsForm.baseRtp" :precision="2" :step="0.01" :min="0" :max="2"
                                   placeholder="请输入默认RTP" class="full-width-input"/>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 高爆配置区域 -->
          <div class="form-section" v-if="editOddsForm.type === 1">
            <div class="section-header">
              <i class="el-icon-trophy"></i>
              <span>高爆配置</span>
            </div>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="触发抽取金额:" prop="baseInventoryHeight">
                  <el-input-number v-model="editOddsForm.baseInventoryHeight" :precision="2" :step="100" :min="0"
                                   placeholder="请输入触发抽取金额" class="full-width-input"/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="抽取时间间隔(分钟):" prop="inventoryHeightExtractionInterval">
                  <el-input-number v-model="editOddsForm.inventoryHeightExtractionInterval" :min="1"
                                   placeholder="请输入抽取时间间隔" class="full-width-input"/>
                </el-form-item>
              </el-col>
            </el-row>

            <div class="row-spacer"></div>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="抽取比例:" prop="inventoryHeightExtractionRatio">
                  <el-input-number v-model="editOddsForm.inventoryHeightExtractionRatio" :precision="2" :step="0.01"
                                   :min="0" :max="1"
                                   placeholder="请输入抽取比例" class="full-width-input"/>
                </el-form-item>
              </el-col>
            </el-row>
          </div>


        </el-form>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitEditForm" :loading="editOddsLoading">确 定</el-button>
        <el-button @click="cancelEditOdds">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 批量创建库存配置对话框 -->
    <el-dialog title="批量创建库存配置" :visible.sync="batchOpen" width="1200px" append-to-body>
      <div class="batch-form-container">

        <el-row :gutter="24">
          <!-- 第一行：默认库存、新人库存、高爆库存 -->
          <el-col :span="8" v-for="(item, index) in batchForms.slice(0, 3)" :key="index">
            <el-card class="batch-form-card">
              <div slot="header" class="batch-card-header">
                <i :class="getCardIcon(item.inventoryName)"></i>
                <span>{{ item.inventoryName }}</span>
                <div class="param-count-badge">
                  <span v-if="item.type === 1">5个参数</span>
                  <span v-else-if="item.type === 2">2个参数</span>
                  <span v-else-if="item.type === 3">1个参数</span>
                </div>
              </div>

              <div class="batch-form-content">
                <!-- 默认库存：显示所有参数 -->
                <template v-if="item.type === 1">
                  <div class="form-item">
                    <label>默认库存金额:</label>
                    <el-input-number v-model="item.baseInventory" :precision="2" :step="100" :min="0"
                                     placeholder="请输入默认库存金额" style="width: 100%;"/>
                  </div>
                  <div class="form-item">
                    <label>默认RTP:</label>
                    <el-input-number v-model="item.baseRtp" :precision="2" :step="0.01" :min="0" :max="1"
                                     placeholder="请输入默认RTP" style="width: 100%;"/>
                  </div>
                  <div class="form-item">
                    <label>高爆库存触发金额:</label>
                    <el-input-number v-model="item.baseInventoryHeight" :precision="2" :step="100" :min="0"
                                     placeholder="请输入高爆库存触发金额" style="width: 100%;"/>
                  </div>
                  <div class="form-item">
                    <label>抽取时间间隔(分钟):</label>
                    <el-input-number v-model="item.inventoryHeightExtractionInterval" :min="1"
                                     placeholder="请输入抽取时间间隔" style="width: 100%;"/>
                  </div>
                  <div class="form-item">
                    <label>抽取比例:</label>
                    <el-input-number v-model="item.inventoryHeightExtractionRatio" :precision="2" :step="1" :min="0"
                                     :max="100" placeholder="请输入抽取比例" style="width: 100%;"/>
                  </div>
                </template>

                <!-- 新人库存：只需要库存金额和RTP -->
                <template v-else-if="item.type === 2">
                  <div class="form-item">
                    <label>默认库存金额:</label>
                    <el-input-number v-model="item.baseInventory" :precision="2" :step="100" :min="0"
                                     placeholder="请输入默认库存金额" style="width: 100%;"/>
                  </div>
                  <div class="form-item">
                    <label>默认RTP:</label>
                    <el-input-number v-model="item.baseRtp" :precision="2" :step="0.01" :min="0" :max="1"
                                     placeholder="请输入默认RTP" style="width: 100%;"/>
                  </div>
                </template>

                <!-- 高爆库存：只需要库存金额 -->
                <template v-else-if="item.type === 3">
                  <div class="form-item">
                    <label>默认库存金额:</label>
                    <el-input-number v-model="item.baseInventory" :precision="2" :step="100" :min="0"
                                     placeholder="请输入默认库存金额" style="width: 100%;"/>
                  </div>
                </template>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="24" style="margin-top: 24px;">
          <!-- 第二行：异常库存、福利库存、点杀库存 -->
          <el-col :span="8" v-for="(item, index) in batchForms.slice(3, 6)" :key="index + 3">
            <el-card class="batch-form-card">
              <div slot="header" class="batch-card-header">
                <i :class="getCardIcon(item.inventoryName)"></i>
                <span>{{ item.inventoryName }}</span>
                <div class="param-count-badge">
                  <span>2个参数</span>
                </div>
              </div>

              <div class="batch-form-content">
                <!-- 异常库存、福利库存、点杀库存：只需要库存金额和RTP -->
                <div class="form-item">
                  <label>默认库存金额:</label>
                  <el-input-number v-model="item.baseInventory" :precision="2" :step="100" :min="0"
                                   placeholder="请输入默认库存金额" style="width: 100%;"/>
                </div>
                <div class="form-item">
                  <label>默认RTP:</label>
                  <el-input-number v-model="item.baseRtp" :precision="2" :step="0.01" :min="0" :max="2"
                                   placeholder="请输入默认RTP" style="width: 100%;"/>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitBatchForm" :loading="batchLoading">批量创建</el-button>
        <el-button @click="cancelBatch">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 抽屉组件 -->
    <el-drawer
      :visible.sync="drawerVisible"
      direction="rtl"
      :size="drawerSize"
      :before-close="handleDrawerClose">
      <div slot="title" class="drawer-title">
        <i :class="getCardIcon(currentItem ? currentItem.inventoryName : '')" class="drawer-inventory-icon"></i>
        <span class="drawer-inventory-name">{{ currentItem ? currentItem.inventoryName : '库存' }}详情</span>
      </div>
      <div class="drawer-content">
        <!-- 游戏赔率范围卡片 -->
        <div v-if="currentItem" class="odds-range-container">
          <!-- 有数据时显示左右分栏布局 -->
          <div v-if="oddsRangeData.length > 0" class="odds-layout">
            <!-- 左侧：赢的倍率范围 -->
            <div class="odds-left">
              <div class="odds-cards">
                <div class="odds-card" v-for="(item, index) in winOddsList" :key="'win-' + index">
                  <div class="card-header">
                    <div class="game-type">
                      <span>赢-{{ index + 1 }}</span>
                      <!--                      <div class="rtp-display">-->
                      <!--                        <span class="rtp-label">RTP</span>-->
                      <!--                        <span class="rtp-value">{{ formatPercentage(item.rtp) }}</span>-->
                      <!--                      </div>-->
                    </div>
                    <div class="info-item">
                      <span class="info-label">进入概率</span>
                      <span class="info-value">{{ formatPercentage(item.enterProbability || 0.2) }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">小游戏概率</span>
                      <span class="info-value">{{ formatPercentage(item.littleGameProbability) }}</span>
                    </div>
                    <div class="edit-button-container">
                      <el-button size="mini" type="primary" icon="el-icon-edit"
                                 @click="openEditDialog(item, 'win', index)">
                        修改
                      </el-button>
                    </div>
                  </div>


                  <div class="card-content">
                    <!-- 倍率范围详情 -->
                    <div class="odds-ranges-section">
                      <div class="section-subtitle">普通游戏倍率范围</div>
                      <div class="odds-ranges-list">
                        <div v-for="(range, rangeIndex) in item.oddsRangeDetails" :key="'range-' + rangeIndex"
                             class="odds-range-item">
                          <div class="range-display">
                            <span class="range-multiplier">{{
                                range.multiplyingPowerRangeDown
                              }}x - {{ range.multiplyingPowerRangeUp }}x</span>
                            <span class="range-probability">{{ formatPercentage(range.probability) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                      <!-- 小游戏配置 -->
                      <div class="little-game-section">
                       <div class="section-subtitle-with-probability">
                         <span class="section-subtitle">免费游戏配置</span>
                         <span class="section-subtitle probability-title">进入概率: <span class="probability-value">{{ formatPercentage(parseLittleGameDetails(item.littleGameProbabilityDetails).freeGameProbability) }}</span></span>
                       </div>
                      <div v-if="parseLittleGameDetails(item.littleGameProbabilityDetails)" class="little-game-config">
                        <div class="ranges-section">
                          <div class="ranges-title">倍率范围配置</div>
                          <div class="ranges-list">
                            <div
                              v-for="(range, rangeIndex) in parseLittleGameDetails(item.littleGameProbabilityDetails).littleGameRanges"
                              :key="'little-range-' + rangeIndex" class="range-config-item">
                              <div class="range-info">
                                <span class="range-label">{{
                                    range.multiplyingPowerRangeDown
                                  }}x - {{ range.multiplyingPowerRangeUp }}x</span>
                                <span class="range-probability">{{ formatPercentage(range.probability) }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div v-else class="no-config">暂无配置</div>
                    </div>

                      <!-- 宝箱游戏配置 -->
                      <div class="treasure-box-section">
                       <div class="section-subtitle-with-probability">
                         <span class="section-subtitle">宝箱游戏配置</span>
                         <span class="section-subtitle probability-title">进入概率: <span class="probability-value">{{ formatPercentage(parseLittleGameDetails(item.littleGameProbabilityDetails).treasureBoxGameProbability) }}</span></span>
                       </div>
                      <div v-if="parseLittleGameDetails(item.littleGameProbabilityDetails)" class="treasure-box-config">
                        <!-- 宝箱游戏详情 -->
                        <div
                          v-if="parseTreasureBoxDetails(parseLittleGameDetails(item.littleGameProbabilityDetails).treasureBoxGameDetails)"
                          class="treasure-box-details">
                          <!-- 宝箱个数和上升档位配置 - 左右并排 -->
                          <div class="treasure-box-configs-row">
                            <div class="treasure-box-ranges">
                              <div class="ranges-title">宝箱个数配置</div>
                              <div class="ranges-list">
                                <div
                                  v-for="(range, rangeIndex) in parseTreasureBoxDetails(parseLittleGameDetails(item.littleGameProbabilityDetails).treasureBoxGameDetails).treasureBoxCount"
                                  :key="'treasure-count-' + rangeIndex" class="range-config-item">
                                  <div class="range-info">
                                    <span class="range-label">{{
                                        range.multiplyingPowerRangeDown
                                      }}x - {{ range.multiplyingPowerRangeUp }}x</span>
                                    <span class="range-probability">{{ formatPercentage(range.probability) }}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div class="treasure-box-ranges">
                              <div class="ranges-title">上升档位配置</div>
                              <div class="ranges-list">
                                <div
                                  v-for="(range, rangeIndex) in parseTreasureBoxDetails(parseLittleGameDetails(item.littleGameProbabilityDetails).treasureBoxGameDetails).upshift"
                                  :key="'upshift-' + rangeIndex" class="range-config-item">
                                  <div class="range-info">
                                    <span class="range-label">{{
                                        range.multiplyingPowerRangeDown
                                      }}x - {{ range.multiplyingPowerRangeUp }}x</span>
                                    <span class="range-probability">{{ formatPercentage(range.probability) }}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <!-- 水果倍率概率配置 -->
                          <div class="fruit-probabilities">
                            <div class="ranges-title-with-probability">
                              <span class="ranges-title">额外奖励配置</span>
                              <span class="ranges-title probability-title">额外奖励概率
                                 <span class="reward-value">{{
                                     formatPercentage(parseTreasureBoxDetails(parseLittleGameDetails(item.littleGameProbabilityDetails).treasureBoxGameDetails).additionalRewardProbability)
                                   }}</span>
                               </span>
                            </div>

                            <div class="fruit-grid">
                              <div class="fruit-item">
                                <span class="fruit-label">香蕉 (35倍)</span>
                                <span class="fruit-probability">{{
                                    formatPercentage(parseTreasureBoxDetails(parseLittleGameDetails(item.littleGameProbabilityDetails).treasureBoxGameDetails).bananaProbability)
                                  }}</span>
                              </div>
                              <div class="fruit-item">
                                <span class="fruit-label">草莓 (50倍)</span>
                                <span class="fruit-probability">{{
                                    formatPercentage(parseTreasureBoxDetails(parseLittleGameDetails(item.littleGameProbabilityDetails).treasureBoxGameDetails).strawberryProbability)
                                  }}</span>
                              </div>
                              <div class="fruit-item">
                                <span class="fruit-label">苹果 (65倍)</span>
                                <span class="fruit-probability">{{
                                    formatPercentage(parseTreasureBoxDetails(parseLittleGameDetails(item.littleGameProbabilityDetails).treasureBoxGameDetails).appleProbability)
                                  }}</span>
                              </div>
                              <div class="fruit-item">
                                <span class="fruit-label">葡萄 (80倍)</span>
                                <span class="fruit-probability">{{
                                    formatPercentage(parseTreasureBoxDetails(parseLittleGameDetails(item.littleGameProbabilityDetails).treasureBoxGameDetails).grapeProbability)
                                  }}</span>
                              </div>
                              <div class="fruit-item">
                                <span class="fruit-label">西瓜 (100倍)</span>
                                <span class="fruit-probability">{{
                                    formatPercentage(parseTreasureBoxDetails(parseLittleGameDetails(item.littleGameProbabilityDetails).treasureBoxGameDetails).watermelonProbability)
                                  }}</span>
                              </div>
                            </div>
                          </div>


                        </div>
                        <div v-else class="treasure-box-details">
                          <!-- 宝箱个数和上升档位配置 - 左右并排 -->
                          <div class="treasure-box-configs-row">
                            <div class="treasure-box-ranges">
                              <div class="ranges-title">宝箱个数配置</div>
                              <div class="ranges-list">
                                <div class="range-config-item">
                                  <div class="range-info">
                                    <span class="range-label">暂无配置</span>
                                    <span class="range-probability">0.00%</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div class="treasure-box-ranges">
                              <div class="ranges-title">上升档位配置</div>
                              <div class="ranges-list">
                                <div class="range-config-item">
                                  <div class="range-info">
                                    <span class="range-label">暂无配置</span>
                                    <span class="range-probability">0.00%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <!-- 水果倍率概率配置 -->
                          <div class="fruit-probabilities">
                            <div class="ranges-title">水果倍率概率</div>
                            <div class="fruit-grid">
                              <div class="fruit-item">
                                <span class="fruit-label">香蕉 (35倍)</span>
                                <span class="fruit-probability">0.00%</span>
                              </div>
                              <div class="fruit-item">
                                <span class="fruit-label">草莓 (50倍)</span>
                                <span class="fruit-probability">0.00%</span>
                              </div>
                              <div class="fruit-item">
                                <span class="fruit-label">苹果 (65倍)</span>
                                <span class="fruit-probability">0.00%</span>
                              </div>
                              <div class="fruit-item">
                                <span class="fruit-label">葡萄 (80倍)</span>
                                <span class="fruit-probability">0.00%</span>
                              </div>
                              <div class="fruit-item">
                                <span class="fruit-label">西瓜 (100倍)</span>
                                <span class="fruit-probability">0.00%</span>
                              </div>
                            </div>
                          </div>


                        </div>
                      </div>
                      <div v-else class="no-config treasure-no-config">暂无宝箱配置</div>
                    </div>
                  </div>
                </div>
              </div>


            </div>

            <!-- 右侧：输的倍率范围 -->
            <div class="odds-right">
              <div class="odds-cards">
                <div class="odds-card" v-for="(item, index) in loseOddsList" :key="'lose-' + index">
                  <div class="card-header">
                    <div class="game-type">
                      <span>输-{{ index + 1 }}</span>
                      <!--                      <div class="rtp-display">-->
                      <!--                        <span class="rtp-label">RTP</span>-->
                      <!--                        <span class="rtp-value">{{ formatPercentage(item.rtp) }}</span>-->
                      <!--                      </div>-->
                    </div>
                    <div class="info-item">
                      <span class="info-label">进入概率</span>
                      <span class="info-value">{{ formatPercentage(item.enterProbability || 0.2) }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">小游戏概率</span>
                      <span class="info-value">{{ formatPercentage(item.littleGameProbability) }}</span>
                    </div>
                    <div class="edit-button-container">
                      <el-button size="mini" type="primary" icon="el-icon-edit"
                                 @click="openEditDialog(item, 'lose', index)">
                        修改
                      </el-button>
                    </div>
                  </div>


                  <div class="card-content">
                    <!-- 倍率范围详情 -->
                    <div class="odds-ranges-section">
                      <div class="section-subtitle">普通游戏倍率范围</div>
                      <div class="odds-ranges-list">
                        <div v-for="(range, rangeIndex) in item.oddsRangeDetails" :key="'range-' + rangeIndex"
                             class="odds-range-item">
                          <div class="range-display">
                            <span class="range-multiplier">{{
                                range.multiplyingPowerRangeDown
                              }}x - {{ range.multiplyingPowerRangeUp }}x</span>
                            <span class="range-probability">{{ formatPercentage(range.probability) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 小游戏配置 -->
                    <div class="little-game-section">
                      <div class="section-subtitle-with-probability">
                        <span class="section-subtitle">免费游戏配置</span>
                        <span class="section-subtitle probability-title">进入概率: <span class="probability-value">{{ formatPercentage(parseLittleGameDetails(item.littleGameProbabilityDetails).freeGameProbability) }}</span></span>
                      </div>
                      <div v-if="parseLittleGameDetails(item.littleGameProbabilityDetails)" class="little-game-config">
                        <div class="ranges-section">
                          <div class="ranges-title">倍率范围配置</div>
                          <div class="ranges-list">
                            <div
                              v-for="(range, rangeIndex) in parseLittleGameDetails(item.littleGameProbabilityDetails).littleGameRanges"
                              :key="'little-range-' + rangeIndex" class="range-config-item">
                              <div class="range-info">
                                <span class="range-label">{{
                                    range.multiplyingPowerRangeDown
                                  }}x - {{ range.multiplyingPowerRangeUp }}x</span>
                                <span class="range-probability">{{ formatPercentage(range.probability) }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div v-else class="no-config">暂无配置</div>
                    </div>

                    <!-- 宝箱游戏配置 -->
                    <div class="treasure-box-section">
                      <div class="section-subtitle-with-probability">
                        <span class="section-subtitle">宝箱游戏配置</span>
                        <span class="section-subtitle probability-title">进入概率: <span class="probability-value">{{ formatPercentage(parseLittleGameDetails(item.littleGameProbabilityDetails).treasureBoxGameProbability) }}</span></span>
                      </div>
                      <div v-if="parseLittleGameDetails(item.littleGameProbabilityDetails)" class="treasure-box-config">
                        <!-- 宝箱游戏详情 -->
                        <div
                          v-if="parseTreasureBoxDetails(parseLittleGameDetails(item.littleGameProbabilityDetails).treasureBoxGameDetails)"
                          class="treasure-box-details">
                          <!-- 宝箱个数和上升档位配置 - 左右并排 -->
                          <div class="treasure-box-configs-row">
                            <div class="treasure-box-ranges">
                              <div class="ranges-title">宝箱个数配置</div>
                              <div class="ranges-list">
                                <div
                                  v-for="(range, rangeIndex) in parseTreasureBoxDetails(parseLittleGameDetails(item.littleGameProbabilityDetails).treasureBoxGameDetails).treasureBoxCount"
                                  :key="'treasure-count-' + rangeIndex" class="range-config-item">
                                  <div class="range-info">
                                    <span class="range-label">{{
                                        range.multiplyingPowerRangeDown
                                      }}x - {{ range.multiplyingPowerRangeUp }}x</span>
                                    <span class="range-probability">{{ formatPercentage(range.probability) }}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div class="treasure-box-ranges">
                              <div class="ranges-title">上升档位配置</div>
                              <div class="ranges-list">
                                <div
                                  v-for="(range, rangeIndex) in parseTreasureBoxDetails(parseLittleGameDetails(item.littleGameProbabilityDetails).treasureBoxGameDetails).upshift"
                                  :key="'upshift-' + rangeIndex" class="range-config-item">
                                  <div class="range-info">
                                    <span class="range-label">{{
                                        range.multiplyingPowerRangeDown
                                      }}x - {{ range.multiplyingPowerRangeUp }}x</span>
                                    <span class="range-probability">{{ formatPercentage(range.probability) }}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <!-- 水果倍率概率配置 -->
                          <div class="fruit-probabilities">
                            <div class="ranges-title-with-probability">
                              <span class="ranges-title">额外奖励配置</span>
                              <span class="ranges-title probability-title">额外奖励概率
                                <span class="reward-value">{{
                                    formatPercentage(parseTreasureBoxDetails(parseLittleGameDetails(item.littleGameProbabilityDetails).treasureBoxGameDetails).additionalRewardProbability)
                                  }}</span>
                              </span>
                            </div>
                            <div class="fruit-grid">
                              <div class="fruit-item">
                                <span class="fruit-label">香蕉 (35倍)</span>
                                <span class="fruit-probability">{{
                                    formatPercentage(parseTreasureBoxDetails(parseLittleGameDetails(item.littleGameProbabilityDetails).treasureBoxGameDetails).bananaProbability)
                                  }}</span>
                              </div>
                              <div class="fruit-item">
                                <span class="fruit-label">草莓 (50倍)</span>
                                <span class="fruit-probability">{{
                                    formatPercentage(parseTreasureBoxDetails(parseLittleGameDetails(item.littleGameProbabilityDetails).treasureBoxGameDetails).strawberryProbability)
                                  }}</span>
                              </div>
                              <div class="fruit-item">
                                <span class="fruit-label">苹果 (65倍)</span>
                                <span class="fruit-probability">{{
                                    formatPercentage(parseTreasureBoxDetails(parseLittleGameDetails(item.littleGameProbabilityDetails).treasureBoxGameDetails).appleProbability)
                                  }}</span>
                              </div>
                              <div class="fruit-item">
                                <span class="fruit-label">葡萄 (80倍)</span>
                                <span class="fruit-probability">{{
                                    formatPercentage(parseTreasureBoxDetails(parseLittleGameDetails(item.littleGameProbabilityDetails).treasureBoxGameDetails).grapeProbability)
                                  }}</span>
                              </div>
                              <div class="fruit-item">
                                <span class="fruit-label">西瓜 (100倍)</span>
                                <span class="fruit-probability">{{
                                    formatPercentage(parseTreasureBoxDetails(parseLittleGameDetails(item.littleGameProbabilityDetails).treasureBoxGameDetails).watermelonProbability)
                                  }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div v-else class="treasure-box-details">
                          <!-- 宝箱个数和上升档位配置 - 左右并排 -->
                          <div class="treasure-box-configs-row">
                            <div class="treasure-box-ranges">
                              <div class="ranges-title">宝箱个数配置</div>
                              <div class="ranges-list">
                                <div class="range-config-item">
                                  <div class="range-info">
                                    <span class="range-label">暂无配置</span>
                                    <span class="range-probability">0.00%</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div class="treasure-box-ranges">
                              <div class="ranges-title">上升档位配置</div>
                              <div class="ranges-list">
                                <div class="range-config-item">
                                  <div class="range-info">
                                    <span class="range-label">暂无配置</span>
                                    <span class="range-probability">0.00%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <!-- 水果倍率概率配置 -->
                          <div class="fruit-probabilities">
                            <div class="ranges-title">水果倍率概率</div>
                            <div class="fruit-grid">
                              <div class="fruit-item">
                                <span class="fruit-label">香蕉 (35倍)</span>
                                <span class="fruit-probability">0.00%</span>
                              </div>
                              <div class="fruit-item">
                                <span class="fruit-label">草莓 (50倍)</span>
                                <span class="fruit-probability">0.00%</span>
                              </div>
                              <div class="fruit-item">
                                <span class="fruit-label">苹果 (65倍)</span>
                                <span class="fruit-probability">0.00%</span>
                              </div>
                              <div class="fruit-item">
                                <span class="fruit-label">葡萄 (80倍)</span>
                                <span class="fruit-probability">0.00%</span>
                              </div>
                              <div class="fruit-item">
                                <span class="fruit-label">西瓜 (100倍)</span>
                                <span class="fruit-probability">0.00%</span>
                              </div>
                            </div>
                          </div>


                        </div>
                      </div>
                      <div v-else class="no-config treasure-no-config">暂无宝箱配置</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 没有数据时显示空状态和生成按钮 -->
          <div v-else class="empty-odds-state">
            <div class="empty-content">
              <i class="el-icon-document"></i>
              <h3>暂无游戏赔率范围数据</h3>
              <p>该库存还没有配置游戏赔率范围，点击下方按钮开始配置</p>
              <button class="custom-generate-btn" @click="openBatchGenerateDialog(currentItem)">
                <span>生成游戏赔率范围</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-else class="loading-state">
          <i class="el-icon-loading"></i>
          <p>加载中...</p>
        </div>
      </div>
    </el-drawer>

    <!-- 批量生成游戏赔率范围弹窗 -->
    <el-dialog title="批量生成游戏赔率范围" :visible.sync="batchGenerateOpen" width="1600px" append-to-body
               :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="batch-generate-container">
        <el-row :gutter="24">
          <!-- 左侧：赢的倍率范围设置 -->
          <el-col :span="12">
            <el-card class="batch-generate-card">
              <div class="batch-form-content">
                <div class="form-item" v-for="(item, itemIndex) in batchWinForms" :key="'win-' + itemIndex">
                  <div class="form-item-header">
                    <span class="form-item-title">赢-{{ itemIndex + 1 }}</span>
                  </div>
                  <div class="form-row">
                    <div class="form-col">
                      <label>RTP:</label>
                      <el-input-number v-model="item.rtp" :precision="2" :step="0.01" :min="0" :max="1"
                                       placeholder="请输入RTP" style="width: 100%;" :disabled="true"/>
                    </div>
                    <div class="form-col">
                      <label>小游戏概率:</label>
                      <el-input-number v-model="item.littleGameProbability" :precision="2" :step="0.01" :min="0"
                                       :max="1"
                                       placeholder="请输入小游戏概率" style="width: 100%;"/>
                    </div>
                  </div>
                  <div class="free-game-section">
                    <div class="section-title">小游戏配置</div>
                    <div class="form-row">
                      <div class="form-col">
                        <label>免费游戏概率:</label>
                        <el-input-number v-model="item.freeGameProbability" :precision="2" :step="0.01" :min="0"
                                         :max="1"
                                         placeholder="请输入免费游戏概率" style="width: 100%;"/>
                      </div>
                    </div>
                    <div class="odds-range-form" v-for="(range, rangeIndex) in item.littleGameRanges"
                         :key="'little-range-' + rangeIndex">
                      <div class="range-form-row">
                        <div class="range-form-col">
                          <label>下限:</label>
                          <el-input-number v-model="range.multiplyingPowerRangeDown" :precision="1" :step="0.1" :min="0"
                                           placeholder="下限" style="width: 100%;"/>
                        </div>
                        <div class="range-form-col">
                          <label>上限:</label>
                          <el-input-number v-model="range.multiplyingPowerRangeUp" :precision="1" :step="0.1" :min="0"
                                           placeholder="上限" style="width: 100%;"/>
                        </div>
                        <div class="range-form-col">
                          <label>概率:</label>
                          <el-input-number v-model="range.probability" :precision="2" :step="0.01" :min="0" :max="1"
                                           placeholder="概率" style="width: 100%;"/>
                        </div>
                        <div class="range-form-col delete-btn-col">
                          <i class="el-icon-delete delete-icon"
                             @click="removeLittleGameRange(itemIndex, 'win', rangeIndex)"
                             v-if="item.littleGameRanges.length > 1"></i>
                        </div>
                      </div>
                    </div>
                    <div class="add-range-btn">
                      <el-button type="primary" size="mini" icon="el-icon-plus"
                                 @click="addLittleGameRange('win', itemIndex)">添加倍率范围
                      </el-button>
                    </div>
                  </div>
                  <div class="odds-range-section">
                    <div class="section-title">倍率范围配置</div>
                    <div class="odds-range-form" v-for="(range, rangeIndex) in item.oddsRangeDetails"
                         :key="'range-' + rangeIndex">
                      <div class="range-form-row">
                        <div class="range-form-col">
                          <label>下限:</label>
                          <el-input-number v-model="range.multiplyingPowerRangeDown" :precision="1" :step="0.1" :min="0"
                                           placeholder="下限" style="width: 100%;"/>
                        </div>
                        <div class="range-form-col">
                          <label>上限:</label>
                          <el-input-number v-model="range.multiplyingPowerRangeUp" :precision="1" :step="0.1" :min="0"
                                           placeholder="上限" style="width: 100%;"/>
                        </div>
                        <div class="range-form-col">
                          <label>概率:</label>
                          <el-input-number v-model="range.probability" :precision="2" :step="0.01" :min="0" :max="1"
                                           placeholder="概率" style="width: 100%;"/>
                        </div>
                        <div class="range-form-col delete-btn-col">
                          <i class="el-icon-delete delete-icon"
                             @click="removeOddsRange(itemIndex, 'win', rangeIndex)"
                             v-if="item.oddsRangeDetails.length > 1"></i>
                        </div>
                      </div>
                    </div>
                    <div class="add-range-btn">
                      <el-button type="primary" size="mini" icon="el-icon-plus"
                                 @click="addOddsRange('win', itemIndex)">添加倍率范围
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>

          <!-- 右侧：输的倍率范围设置 -->
          <el-col :span="12">
            <el-card class="batch-generate-card">

              <div class="batch-form-content">
                <div class="form-item" v-for="(item, itemIndex) in batchLoseForms" :key="'lose-' + itemIndex">
                  <div class="form-item-header">
                    <span class="form-item-title">输-{{ itemIndex + 1 }}</span>
                  </div>
                  <div class="form-row">
                    <div class="form-col">
                      <label>RTP:</label>
                      <el-input-number v-model="item.rtp" :precision="2" :step="0.01" :min="0" :max="1"
                                       placeholder="请输入RTP" style="width: 100%;" :disabled="true"/>
                    </div>
                    <div class="form-col">
                      <label>小游戏概率:</label>
                      <el-input-number v-model="item.littleGameProbability" :precision="2" :step="0.01" :min="0"
                                       :max="1"
                                       placeholder="请输入小游戏概率" style="width: 100%;"/>
                    </div>
                  </div>
                  <div class="free-game-section">
                    <div class="section-title">小游戏配置</div>
                    <div class="form-row">
                      <div class="form-col">
                        <label>免费游戏概率:</label>
                        <el-input-number v-model="item.freeGameProbability" :precision="2" :step="0.01" :min="0"
                                         :max="1"
                                         placeholder="请输入免费游戏概率" style="width: 100%;"/>
                      </div>
                    </div>
                    <div class="odds-range-form" v-for="(range, rangeIndex) in item.littleGameRanges"
                         :key="'little-range-' + rangeIndex">
                      <div class="range-form-row">
                        <div class="range-form-col">
                          <label>下限:</label>
                          <el-input-number v-model="range.multiplyingPowerRangeDown" :precision="1" :step="0.01"
                                           :min="0"
                                           placeholder="下限" style="width: 100%;"/>
                        </div>
                        <div class="range-form-col">
                          <label>上限:</label>
                          <el-input-number v-model="range.multiplyingPowerRangeUp" :precision="1" :step="0.01" :min="0"
                                           placeholder="上限" style="width: 100%;"/>
                        </div>
                        <div class="range-form-col">
                          <label>概率:</label>
                          <el-input-number v-model="range.probability" :precision="2" :step="0.01" :min="0" :max="1"
                                           placeholder="概率" style="width: 100%;"/>
                        </div>
                        <div class="range-form-col delete-btn-col">
                          <i class="el-icon-delete delete-icon"
                             @click="removeLittleGameRange(itemIndex, 'lose', rangeIndex)"
                             v-if="item.littleGameRanges.length > 1"></i>
                        </div>
                      </div>
                    </div>
                    <div class="add-range-btn">
                      <el-button type="primary" size="mini" icon="el-icon-plus"
                                 @click="addLittleGameRange('lose', itemIndex)">添加倍率范围
                      </el-button>
                    </div>
                  </div>
                  <div class="odds-range-section">
                    <div class="section-title">倍率范围配置</div>
                    <div class="odds-range-form" v-for="(range, rangeIndex) in item.oddsRangeDetails"
                         :key="'range-' + rangeIndex">
                      <div class="range-form-row">
                        <div class="range-form-col">
                          <label>下限:</label>
                          <el-input-number v-model="range.multiplyingPowerRangeDown" :precision="1" :step="0.1" :min="0"
                                           placeholder="下限" style="width: 100%;"/>
                        </div>
                        <div class="range-form-col">
                          <label>上限:</label>
                          <el-input-number v-model="range.multiplyingPowerRangeUp" :precision="1" :step="0.1" :min="0"
                                           placeholder="上限" style="width: 100%;"/>
                        </div>
                        <div class="range-form-col">
                          <label>概率:</label>
                          <el-input-number v-model="range.probability" :precision="2" :step="0.01" :min="0" :max="1"
                                           placeholder="概率" style="width: 100%;"/>
                        </div>
                        <div class="range-form-col delete-btn-col">
                          <i class="el-icon-delete delete-icon"
                             @click="removeOddsRange(itemIndex, 'lose', rangeIndex)"
                             v-if="item.oddsRangeDetails.length > 1"></i>
                        </div>
                      </div>
                    </div>
                    <div class="add-range-btn">
                      <el-button type="primary" size="mini" icon="el-icon-plus"
                                 @click="addOddsRange('lose', itemIndex)">添加倍率范围
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitBatchGenerate" :loading="batchGenerateLoading">批量生成</el-button>
        <el-button @click="cancelBatchGenerate">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 修改游戏赔率范围弹窗 -->
    <el-dialog title="修改游戏赔率范围" :visible.sync="editRangeDialogOpen" width="1200px" append-to-body
               :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="edit-dialog-container">
        <el-card class="edit-dialog-card">
          <div class="edit-form-content">
            <div class="form-item">
              <div class="form-item-header">
                <span class="form-item-title">{{ editRangeFormData.gameOddsRangeName }}</span>
              </div>
              <div class="form-row">
                <div class="form-col">
                  <label>RTP:</label>
                  <el-input-number v-model="editRangeFormData.rtp" :precision="2" :step="0.01" :min="0" :max="1"
                                   placeholder="请输入RTP" style="width: 100%;" :disabled="true"/>
                </div>
                <div class="form-col">
                  <label>小游戏概率:</label>
                  <el-input-number v-model="editRangeFormData.littleGameProbability" :precision="2" :step="0.01"
                                   :min="0" :max="1"
                                   placeholder="请输入小游戏概率" style="width: 100%;"/>
                </div>
              </div>
              <div class="edit-config-layout">
                <!-- 左侧：倍率范围配置 -->
                <div class="config-left">
                  <div class="odds-range-section">
                    <div class="section-title">倍率范围配置</div>
                    <div class="odds-range-form" v-for="(range, rangeIndex) in editRangeFormData.oddsRangeDetails"
                         :key="'edit-odds-range-' + rangeIndex">
                      <div class="range-form-row">
                        <div class="range-form-col">
                          <label>下限:</label>
                          <el-input-number v-model="range.multiplyingPowerRangeDown" :precision="1" :step="0.1" :min="0"
                                           placeholder="下限" style="width: 100%;"/>
                        </div>
                        <div class="range-form-col">
                          <label>上限:</label>
                          <el-input-number v-model="range.multiplyingPowerRangeUp" :precision="1" :step="0.1" :min="0"
                                           placeholder="上限" style="width: 100%;"/>
                        </div>
                        <div class="range-form-col">
                          <label>概率:</label>
                          <el-input-number v-model="range.probability" :precision="2" :step="0.01" :min="0" :max="1"
                                           placeholder="概率" style="width: 100%;"/>
                        </div>
                        <div class="range-form-col delete-btn-col">
                          <i class="el-icon-delete delete-icon"
                             @click="removeEditOddsRange(rangeIndex)"
                             v-if="editRangeFormData.oddsRangeDetails.length > 1">
                          </i>
                        </div>
                      </div>
                    </div>
                    <div class="add-range-btn">
                      <el-button type="primary" size="mini" icon="el-icon-plus"
                                 @click="addEditOddsRange">添加倍率范围
                      </el-button>
                    </div>
                  </div>
                </div>

                <!-- 右侧：小游戏配置 -->
                <div class="config-right">
                  <div class="free-game-section">
                    <div class="section-title">小游戏配置</div>
                    <div class="form-row">
                      <div class="form-col">
                        <label>免费游戏概率:</label>
                        <el-input-number v-model="editRangeFormData.freeGameProbability" :precision="2" :step="0.01"
                                         :min="0" :max="1"
                                         placeholder="请输入免费游戏概率" style="width: 100%;"/>
                      </div>
                    </div>
                    <div class="odds-range-form" v-for="(range, rangeIndex) in editRangeFormData.littleGameRanges"
                         :key="'edit-little-range-' + rangeIndex">
                      <div class="range-form-row">
                        <div class="range-form-col">
                          <label>下限:</label>
                          <el-input-number v-model="range.multiplyingPowerRangeDown" :precision="1" :step="0.1" :min="0"
                                           placeholder="下限" style="width: 100%;"/>
                        </div>
                        <div class="range-form-col">
                          <label>上限:</label>
                          <el-input-number v-model="range.multiplyingPowerRangeUp" :precision="1" :step="0.1" :min="0"
                                           placeholder="上限" style="width: 100%;"/>
                        </div>
                        <div class="range-form-col">
                          <label>概率:</label>
                          <el-input-number v-model="range.probability" :precision="2" :step="0.01" :min="0" :max="1"
                                           placeholder="概率" style="width: 100%;"/>
                        </div>
                        <div class="range-form-col delete-btn-col">
                          <i class="el-icon-delete delete-icon"
                             @click="removeEditLittleGameRange(rangeIndex)"
                             v-if="editRangeFormData.littleGameRanges.length > 1"></i>
                        </div>
                      </div>
                    </div>
                    <div class="add-range-btn">
                      <el-button type="primary" size="mini" icon="el-icon-plus"
                                 @click="addEditLittleGameRange">添加倍率范围
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="edit-config-layout">
                <!-- 左侧：宝箱游戏配置 -->
                <div class="config-left">
                  <div class="treasure-box-section">
                    <!-- 宝箱游戏概率 -->
                    <div class="form-row">
                      <div class="form-col">
                        <label>宝箱游戏概率:</label>
                        <el-input-number v-model="editRangeFormData.treasureBoxGameProbability" :precision="2"
                                         :step="0.01" :min="0" :max="1"
                                         style="width: 100%;"/>
                      </div>
                    </div>


                    <!-- 宝箱游戏详情编辑 -->
                    <div v-if="editRangeFormData.treasureBoxGameDetails" class="treasure-box-details-edit">
                      <!-- 宝箱个数和上升档位配置 - 左右并排 -->
                      <div class="treasure-box-configs-row">
                        <!-- 宝箱个数配置 -->
                        <div class="treasure-box-ranges-edit">
                          <div class="ranges-title">宝箱个数配置</div>
                          <div class="odds-range-form"
                               v-for="(range, rangeIndex) in editRangeFormData.treasureBoxGameDetails.treasureBoxCount"
                               :key="'edit-treasure-count-' + rangeIndex">
                            <div class="range-form-row">
                              <div class="range-form-col">
                                <label>下限:</label>
                                <el-input-number v-model="range.multiplyingPowerRangeDown" :precision="1" :step="1"
                                                 :min="5" :max="20"
                                                 placeholder="下限" style="width: 100%;"/>
                              </div>
                              <div class="range-form-col">
                                <label>上限:</label>
                                <el-input-number v-model="range.multiplyingPowerRangeUp" :precision="1" :step="1"
                                                 :min="5" :max="20"
                                                 placeholder="上限" style="width: 100%;"/>
                              </div>
                              <div class="range-form-col">
                                <label>概率:</label>
                                <el-input-number v-model="range.probability" :precision="2" :step="0.01" :min="0"
                                                 :max="1"
                                                 placeholder="概率" style="width: 100%;"/>
                              </div>
                              <div class="range-form-col delete-btn-col">
                                <i class="el-icon-delete delete-icon"
                                   @click="removeEditTreasureBoxCount(rangeIndex)"
                                   v-if="editRangeFormData.treasureBoxGameDetails.treasureBoxCount.length > 1"></i>
                              </div>
                            </div>
                          </div>
                          <div class="add-range-btn">
                            <el-button type="primary" size="mini" icon="el-icon-plus"
                                       @click="addEditTreasureBoxCount">添加宝箱个数范围
                            </el-button>
                          </div>
                        </div>

                        <!-- 上升档位配置 -->
                        <div class="treasure-box-ranges-edit">
                          <div class="ranges-title">上升档位配置</div>
                          <div class="odds-range-form"
                               v-for="(range, rangeIndex) in editRangeFormData.treasureBoxGameDetails.upshift"
                               :key="'edit-upshift-' + rangeIndex">
                            <div class="range-form-row">
                              <div class="range-form-col">
                                <label>下限:</label>
                                <el-input-number v-model="range.multiplyingPowerRangeDown" :precision="1" :step="1"
                                                 :min="1" :max="4"
                                                 placeholder="下限" style="width: 100%;"/>
                              </div>
                              <div class="range-form-col">
                                <label>上限:</label>
                                <el-input-number v-model="range.multiplyingPowerRangeUp" :precision="1" :step="1"
                                                 :min="1" :max="4"
                                                 placeholder="上限" style="width: 100%;"/>
                              </div>
                              <div class="range-form-col">
                                <label>概率:</label>
                                <el-input-number v-model="range.probability" :precision="2" :step="0.01" :min="0"
                                                 :max="1"
                                                 placeholder="概率" style="width: 100%;"/>
                              </div>
                              <div class="range-form-col delete-btn-col">
                                <i class="el-icon-delete delete-icon"
                                   @click="removeEditUpshift(rangeIndex)"
                                   v-if="editRangeFormData.treasureBoxGameDetails.upshift.length > 1"></i>
                              </div>
                            </div>
                          </div>
                          <div class="add-range-btn">
                            <el-button type="primary" size="mini" icon="el-icon-plus"
                                       @click="addEditUpshift">添加上升档位范围
                            </el-button>
                          </div>
                        </div>
                      </div>

                      <!-- 额外奖励概率 -->
                      <div class="form-row" style="margin-bottom: 5px;">
                        <div class="form-col">
                          <label>额外奖励概率:</label>
                          <el-input-number
                            v-model="editRangeFormData.treasureBoxGameDetails.additionalRewardProbability"
                            :precision="2" :step="0.01" :min="0" :max="1"
                            placeholder="请输入额外奖励概率" style="width: 100%;"/>
                        </div>
                      </div>
                      <div class="fruit-form-grid">
                        <div class="fruit-form-item">
                          <label>香蕉 (35倍):</label>
                          <el-input-number v-model="editRangeFormData.treasureBoxGameDetails.bananaProbability"
                                           :precision="2" :step="0.01" :min="0" :max="1"
                                           placeholder="香蕉概率" style="width: 100%;"/>
                        </div>
                        <div class="fruit-form-item">
                          <label>草莓 (50倍):</label>
                          <el-input-number v-model="editRangeFormData.treasureBoxGameDetails.strawberryProbability"
                                           :precision="2" :step="0.01" :min="0" :max="1"
                                           placeholder="草莓概率" style="width: 100%;"/>
                        </div>
                        <div class="fruit-form-item">
                          <label>苹果 (65倍):</label>
                          <el-input-number v-model="editRangeFormData.treasureBoxGameDetails.appleProbability"
                                           :precision="2" :step="0.01" :min="0" :max="1"
                                           placeholder="苹果概率" style="width: 100%;"/>
                        </div>
                        <div class="fruit-form-item">
                          <label>葡萄 (80倍):</label>
                          <el-input-number v-model="editRangeFormData.treasureBoxGameDetails.grapeProbability"
                                           :precision="2" :step="0.01" :min="0" :max="1"
                                           placeholder="葡萄概率" style="width: 100%;"/>
                        </div>
                        <div class="fruit-form-item">
                          <label>西瓜 (100倍):</label>
                          <el-input-number v-model="editRangeFormData.treasureBoxGameDetails.watermelonProbability"
                                           :precision="2" :step="0.01" :min="0" :max="1"
                                           placeholder="西瓜概率" style="width: 100%;"/>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 右侧：空 -->
                  <div class="config-right">
                    <!-- 右侧暂时为空，可以后续添加其他配置 -->
                  </div>
                </div>
              </div>


            </div>
          </div>
        </el-card>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitEditRange" :loading="editRangeLoading">确 定</el-button>
        <el-button @click="cancelEditRange">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  initializeGameOdds,
  getGameOdds,
  updateGameOdds,
  getGameOddsRange,
  initializeGameOddsRange,
  updateGameOddsRange
} from "@/api/biz/game_odds";
import {sitePage} from "@/api/biz/site";

export default {
  name: "GameOdds",
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
      // 游戏赔率表格数据
      oddsList: [],
      // 弹出层标题
      title: "",
      // 是否显示批量创建弹出层
      batchOpen: false,
      // 批量创建加载状态
      batchLoading: false,
      // 抽屉大小
      drawerSize: '70%',
      // 修改游戏赔率范围弹窗相关
      editRangeDialogOpen: false,
      editRangeLoading: false,
      editRangeFormData: {
        id: null,
        siteId: null,
        gameId: null,
        gameOddsId: null,
        gameOddsRangeName: '',
        rtp: 0,
        type: 0,
        littleGameProbability: 0,
        freeGameProbability: 0,
        littleGameRanges: [],
        oddsRangeDetails: [],
        treasureBoxGameProbability: 0,
        treasureBoxGameDetails: {
          treasureBoxCount: [{
            multiplyingPowerRangeDown: null,
            multiplyingPowerRangeUp: null,
            probability: null
          }],
          upshift: [{
            multiplyingPowerRangeDown: null,
            multiplyingPowerRangeUp: null,
            probability: null
          }],
          additionalRewardProbability: 0,
          bananaProbability: 0,
          strawberryProbability: 0,
          appleProbability: 0,
          grapeProbability: 0,
          watermelonProbability: 0
        }
      },
      // 查询参数
      queryParams: {
        siteId: null,
        gameId: 10003  // 固定游戏ID
      },
      // 默认卡片数据
      defaultCards: [
        {
          type: 1,
          inventoryName: '默认库存',
          baseInventory: 0,
          baseRtp: 0.96,
          baseInventoryHeight: 0,
          inventoryHeightExtractionInterval: 2,
          inventoryHeightExtractionRatio: 0.1
        },
        {
          type: 2,
          inventoryName: '新人库存',
          baseInventory: 0,
          baseRtp: 0.99,
        },
        {
          type: 3,
          inventoryName: '高爆库存',
          baseInventory: 0,
        },
        {
          type: 4,
          inventoryName: '异常库存',
          baseInventory: 0,
          baseRtp: 0.90,
        },
        {
          type: 5,
          inventoryName: '福利库存',
          baseInventory: 0,
          baseRtp: 1.05,
        },
        {
          type: 6,
          inventoryName: '点杀库存',
          baseInventory: 0,
          baseRtp: 0.5,
        }
      ],
      // 批量创建表单数据
      batchForms: [],
      // 站点列表
      siteList: [],
      // 选中的站点ID
      selectedSiteId: null,
      // 是否显示修改赔率弹出层
      editOddsOpen: false,
      // 修改赔率加载状态
      editOddsLoading: false,
      // 修改赔率表单数据
      editOddsForm: {},
      // 修改赔率表单验证规则
      editRules: {
        baseInventory: [
          {required: true, message: "默认库存金额不能为空", trigger: "blur"}
        ],
        baseRtp: [
          {required: true, message: "默认RTP不能为空", trigger: "blur"}
        ],
        baseInventoryHeight: [
          {required: true, message: "触发抽取金额不能为空", trigger: "blur"}
        ],
        inventoryHeightExtractionInterval: [
          {required: true, message: "抽取时间间隔不能为空", trigger: "blur"}
        ],
        inventoryHeightExtractionRatio: [
          {required: true, message: "抽取比例不能为空", trigger: "blur"}
        ]
      },
      // 抽屉相关
      drawerVisible: false,
      currentItem: null,
      // 游戏赔率范围数据
      oddsRangeData: [],
      // 批量生成弹窗
      batchGenerateOpen: false,
      // 批量生成加载状态
      batchGenerateLoading: false,
      // 批量生成赢的表单数据
      batchWinForms: [],
      // 批量生成输的表单数据
      batchLoseForms: []

    };
  },

  created() {
    this.calculateDrawerSize();
    this.getSiteList().then(() => {
      // 获取站点列表完成后，如果有选中的站点，则获取该站点的游戏赔率数据
      if (this.selectedSiteId !== null) {
        this.getList();
      }

    });
  },

  mounted() {
    window.addEventListener('resize', this.calculateDrawerSize);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.calculateDrawerSize);
  },

  computed: {
    // 赢的倍率范围列表
    winOddsList() {
      return this.oddsRangeData.filter(item => item.type === 0).sort((a, b) => {
        // 按名称中的数字排序：win-1, win-2, win-3, win-4, win-5
        const aNum = parseInt(a.gameOddsRangeName.split('-')[1]);
        const bNum = parseInt(b.gameOddsRangeName.split('-')[1]);
        return aNum - bNum;
      });
    },
    // 输的倍率范围列表
    loseOddsList() {
      return this.oddsRangeData.filter(item => item.type === 1).sort((a, b) => {
        // 按名称中的数字排序：lose-1, lose-2, lose-3, lose-4, lose-5
        const aNum = parseInt(a.gameOddsRangeName.split('-')[1]);
        const bNum = parseInt(b.gameOddsRangeName.split('-')[1]);
        return aNum - bNum;
      });
    }
  },

  methods: {
    /** 获取站点列表 */
    getSiteList() {
      return sitePage({pageNum: 1, pageSize: 1000}).then(response => {
        if (response.code === 200) {
          // 确保所有站点ID都是数字类型
          this.siteList = response.content.list.map(site => ({
            ...site,
            siteId: Number(site.siteId)
          }));
          // 默认选择第一个站点
          if (this.siteList.length > 0) {
            this.selectedSiteId = this.siteList[0].siteId; // 已经是数字类型
            this.queryParams.siteId = this.selectedSiteId;
          }
        }
        return response;
      });
    },
    /** 站点选择变化处理 */
    handleSiteChange(siteId) {
      this.selectedSiteId = Number(siteId);
      // 可以在这里根据选中的站点过滤游戏赔率数据
      this.queryParams.siteId = Number(siteId);
      this.getList();
    },
    /** 查询游戏赔率列表 */
    getList() {
      this.loading = true;
      getGameOdds(this.queryParams).then(response => {
        if (response.code === 200) {
          // 返回的是6个库存数据，根据type匹配
          this.oddsList = response.content || [];
          this.total = this.oddsList.length;
          this.loading = false;
        }
      });
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.siteId = null;
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 获取卡片图标 */
    getCardIcon(inventoryName) {
      const iconMap = {
        '默认库存': 'el-icon-s-grid',
        '新人库存': 'el-icon-user',
        '高爆库存': 'el-icon-trophy',
        '异常库存': 'el-icon-warning',
        '福利库存': 'el-icon-star-on',
        '点杀库存': 'el-icon-aim'
      };
      return iconMap[inventoryName] || 'el-icon-s-grid';
    },
    /** 获取卡片描述 */
    getCardDesc(inventoryName) {
      const descMap = {
        '默认库存': '标准配置，适合一般游戏场景',
        '新人库存': '新手友好，高RTP低风险',
        '高爆库存': '高爆率配置，适合刺激玩法',
        '异常库存': '异常情况处理，平衡风险收益',
        '福利库存': '福利活动专用，高RTP回馈玩家',
        '点杀库存': '点杀模式专用'
      };
      return descMap[inventoryName] || '标准配置';
    },
    /** 批量创建所有库存配置 */
    handleBatchCreate() {


      // 验证站点ID是否已选择
      if (this.selectedSiteId === null) {
        this.$modal.msgError("请先选择站点！");
        return;
      }

      // 初始化批量表单数据
      this.batchForms = JSON.parse(JSON.stringify(this.defaultCards));
      // 为每个表单添加默认的游戏ID和站点ID
      this.batchForms.forEach(form => {
        form.gameId = 10003;  // 默认游戏ID
        form.siteId = Number(this.selectedSiteId);  // 站点ID（必填）
      });

      this.batchOpen = true;
    },
    /** 批量创建表单提交 */
    submitBatchForm() {


      // 验证站点ID是否已选择
      if (this.selectedSiteId === null) {
        this.$modal.msgError("请先选择站点！");
        return;
      }

      this.batchLoading = true;

      initializeGameOdds(this.batchForms).then(response => {
        if (response.code === 200) {
          this.$modal.msgSuccess("批量创建成功！");
          this.batchOpen = false;
          this.getList();
          this.batchLoading = false;
        }
      }).catch(error => {
        this.$modal.msgError("批量创建失败：" + error.message);
        this.batchLoading = false;
      });
    },


    /** 取消批量创建 */
    cancelBatch() {
      this.batchOpen = false;
      this.batchForms = [];
    },

    /** 提交编辑表单 */
    submitEditForm() {
      this.$refs["editForm"].validate((valid) => {
        if (valid) {
          this.editOddsLoading = true;

          // 调用修改赔率接口
          updateGameOdds(this.editOddsForm).then(response => {
            if (response.code === 200) {
              this.$modal.msgSuccess("修改成功！");
              this.editOddsOpen = false;
              this.getList(); // 刷新列表
            } else {
              this.$modal.msgError("修改失败：" + response.msg);
            }
            this.editOddsLoading = false;
          }).catch(error => {
            this.$modal.msgError("修改失败：" + (error.message || error));
            this.editOddsLoading = false;
          });
        }
      });
    },

    /** 取消编辑赔率 */
    cancelEditOdds() {
      this.editOddsOpen = false;
      this.editOddsForm = {};
    },

    /** 打开抽屉 */
    openDrawer(item) {
      this.currentItem = item;
      this.calculateDrawerSize(); // 重新计算抽屉大小
      this.drawerVisible = true;
      // 获取游戏赔率范围数据
      this.getGameOddsRangeData(item);
    },

    /** 获取游戏赔率范围数据 */
    getGameOddsRangeData(item) {
      const params = {
        siteId: this.selectedSiteId,
        gameId: 10003, // 固定游戏ID
        gameOddsId: item.id,
        gameOddsType: item.type
      };

      getGameOddsRange(params).then(response => {
        if (response.code === 200) {
          this.oddsRangeData = response.content || [];
          // 如果返回空数组，说明没有数据，显示空状态和生成按钮
          if (!this.oddsRangeData || this.oddsRangeData.length === 0) {
            // 不自动弹窗，而是显示空状态
            this.oddsRangeData = [];
          }
        } else {
          // 如果状态码不是200，显示空状态
          this.oddsRangeData = [];
        }
      }).catch(() => {
        // 请求失败，显示空状态
        this.oddsRangeData = [];
      });
    },

    /** 打开批量生成弹窗 */
    openBatchGenerateDialog(item) {
      this.currentItem = item;
      this.initBatchForms();
      this.batchGenerateOpen = true;
    },

    /** 初始化批量生成表单数据 */
    initBatchForms() {
      // 初始化赢的表单数据
      this.batchWinForms = [];
      for (let i = 1; i <= 5; i++) {
        this.batchWinForms.push({
          rtp: 0,
          littleGameProbability: 0,
          freeGameProbability: 0,
          littleGameRanges: [
            {multiplyingPowerRangeDown: null, multiplyingPowerRangeUp: null, probability: null}
          ],
          oddsRangeDetails: [
            {multiplyingPowerRangeDown: null, multiplyingPowerRangeUp: null, probability: null}
          ]
        });
      }

      // 初始化输的表单数据
      this.batchLoseForms = [];
      for (let i = 1; i <= 5; i++) {
        this.batchLoseForms.push({
          rtp: 0,
          littleGameProbability: 0,
          freeGameProbability: 0,
          littleGameRanges: [
            {multiplyingPowerRangeDown: null, multiplyingPowerRangeUp: null, probability: null}
          ],
          oddsRangeDetails: [
            {multiplyingPowerRangeDown: null, multiplyingPowerRangeUp: null, probability: null}
          ]
        });
      }
    },

    /** 提交批量生成 */
    submitBatchGenerate() {
      this.batchGenerateLoading = true;
      // 构建请求参数
      const winData = this.batchWinForms.map((item, index) => ({
        id: `win-${index + 1}`,
        siteId: this.selectedSiteId,
        gameId: 10003,
        gameOddsId: this.currentItem.id,
        gameOddsName: this.currentItem.inventoryName,
        gameOddsRangeName: `win-${index + 1}`,
        rtp: item.rtp,
        type: 0, // 赢
        littleGameProbability: item.littleGameProbability,
        freeGameProbability: item.freeGameProbability,
        littleGameRanges: item.littleGameRanges,
        oddsRangeDetails: item.oddsRangeDetails
      }));

      const loseData = this.batchLoseForms.map((item, index) => ({
        id: `lose-${index + 1}`,
        siteId: this.selectedSiteId,
        gameId: 10003,
        gameOddsId: this.currentItem.id,
        gameOddsName: this.currentItem.inventoryName,
        gameOddsRangeName: `lose-${index + 1}`,
        rtp: item.rtp,
        type: 1, // 输
        littleGameProbability: item.littleGameProbability,
        freeGameProbability: item.freeGameProbability,
        littleGameRanges: item.littleGameRanges,
        oddsRangeDetails: item.oddsRangeDetails
      }));

      const requestParams = [...winData, ...loseData];


      // 发送请求 - 移除id字段，设置enterProbability为0.2，合并littleGame相关参数
      const requestData = requestParams.map(item => {
        const {id, littleGameRanges, freeGameProbability, ...rest} = item;

        // 构建littleGameProbabilityDetails对象
        const littleGameProbabilityDetails = {
          freeGameProbability: freeGameProbability,
          littleGameRanges: littleGameRanges
        };

        return {
          ...rest,
          enterProbability: 0.2,
          littleGameProbabilityDetails: JSON.stringify(littleGameProbabilityDetails)
        };
      });

      initializeGameOddsRange(requestData).then(response => {
        if (response.code === 200) {
          this.$modal.msgSuccess("批量生成成功！");
          // 关闭弹窗
          this.batchGenerateOpen = false;
          // 刷新抽屉数据
          this.getGameOddsRangeData(this.currentItem);
        } else {
          this.$modal.msgError(response.message || "批量生成失败！");
        }
      }).catch(error => {
        console.error('批量生成请求失败:', error);
        this.$modal.msgError("批量生成请求失败！");
      }).finally(() => {
        this.batchGenerateLoading = false;
      });
    },

    /** 取消批量生成 */
    cancelBatchGenerate() {
      this.batchGenerateOpen = false;
      this.batchWinForms = [];
      this.batchLoseForms = [];
    },

    /** 添加小游戏倍率范围 */
    addLittleGameRange(type, itemIndex) {
      if (type === 'win') {
        this.batchWinForms[itemIndex].littleGameRanges.push({
          multiplyingPowerRangeDown: null,
          multiplyingPowerRangeUp: null,
          probability: null
        });
      } else if (type === 'lose') {
        this.batchLoseForms[itemIndex].littleGameRanges.push({
          multiplyingPowerRangeDown: null,
          multiplyingPowerRangeUp: null,
          probability: null
        });
      }
    },

    /** 删除小游戏倍率范围 */
    removeLittleGameRange(itemIndex, type, rangeIndex) {
      if (type === 'win') {
        this.batchWinForms[itemIndex].littleGameRanges.splice(rangeIndex, 1);
      } else if (type === 'lose') {
        this.batchLoseForms[itemIndex].littleGameRanges.splice(rangeIndex, 1);
      }
    },

    /** 添加倍率范围 */
    addOddsRange(type, itemIndex) {
      if (type === 'win') {
        this.batchWinForms[itemIndex].oddsRangeDetails.push({
          multiplyingPowerRangeDown: null,
          multiplyingPowerRangeUp: null,
          probability: null
        });
      } else if (type === 'lose') {
        this.batchLoseForms[itemIndex].oddsRangeDetails.push({
          multiplyingPowerRangeDown: null,
          multiplyingPowerRangeUp: null,
          probability: null
        });
      }
    },

    /** 删除倍率范围 */
    removeOddsRange(itemIndex, type, rangeIndex) {
      if (type === 'win') {
        this.batchWinForms[itemIndex].oddsRangeDetails.splice(rangeIndex, 1);
      } else if (type === 'lose') {
        this.batchLoseForms[itemIndex].oddsRangeDetails.splice(rangeIndex, 1);
      }
    },

    /** 关闭抽屉 */
    handleDrawerClose(done) {
      this.currentItem = null;
      this.oddsRangeData = [];
      done();
    },

    /** 计算抽屉大小 */
    calculateDrawerSize() {
      const screenWidth = window.innerWidth;
      if (screenWidth < 2000) {
        this.drawerSize = '90%';
      } else if (screenWidth < 3000) {
        this.drawerSize = '80%';
      } else {
        this.drawerSize = '70%';
      }
    },

    /** 打开修改游戏赔率范围弹窗 */
    openEditDialog(item, type, index) {
      // 解析小游戏详情
      const littleGameDetails = this.parseLittleGameDetails(item.littleGameProbabilityDetails);
      // 解析宝箱游戏详情
      const treasureBoxDetails = littleGameDetails ? this.parseTreasureBoxDetails(littleGameDetails.treasureBoxGameDetails) : null;

      this.editRangeFormData = {
        id: item.id,
        siteId: this.selectedSiteId,
        gameId: 10003,
        gameOddsId: this.currentItem.id,
        gameOddsRangeName: `${type === 'win' ? 'win' : 'lose'}-${index + 1}`,
        rtp: item.rtp,
        type: type === 'win' ? 0 : 1,
        littleGameProbability: item.littleGameProbability,
        freeGameProbability: littleGameDetails ? littleGameDetails.freeGameProbability : 0,
        littleGameRanges: littleGameDetails ? [...littleGameDetails.littleGameRanges] : [],
        oddsRangeDetails: [...item.oddsRangeDetails],
        treasureBoxGameProbability: littleGameDetails ? littleGameDetails.treasureBoxGameProbability : 0,
        treasureBoxGameDetails: treasureBoxDetails ? {
          treasureBoxCount: treasureBoxDetails.treasureBoxCount && treasureBoxDetails.treasureBoxCount.length > 0 ? [...treasureBoxDetails.treasureBoxCount] : [{
            multiplyingPowerRangeDown: null,
            multiplyingPowerRangeUp: null,
            probability: null
          }],
          upshift: treasureBoxDetails.upshift && treasureBoxDetails.upshift.length > 0 ? [...treasureBoxDetails.upshift] : [{
            multiplyingPowerRangeDown: null,
            multiplyingPowerRangeUp: null,
            probability: null
          }],
          additionalRewardProbability: treasureBoxDetails.additionalRewardProbability || 0,
          bananaProbability: treasureBoxDetails.bananaProbability || 0,
          strawberryProbability: treasureBoxDetails.strawberryProbability || 0,
          appleProbability: treasureBoxDetails.appleProbability || 0,
          grapeProbability: treasureBoxDetails.grapeProbability || 0,
          watermelonProbability: treasureBoxDetails.watermelonProbability || 0
        } : {
          treasureBoxCount: [{
            multiplyingPowerRangeDown: null,
            multiplyingPowerRangeUp: null,
            probability: null
          }],
          upshift: [{
            multiplyingPowerRangeDown: null,
            multiplyingPowerRangeUp: null,
            probability: null
          }],
          additionalRewardProbability: 0,
          bananaProbability: 0,
          strawberryProbability: 0,
          appleProbability: 0,
          grapeProbability: 0,
          watermelonProbability: 0
        }
      };

      this.editRangeDialogOpen = true;
    },

    /** 提交修改游戏赔率范围 */
    submitEditRange() {
      this.editRangeLoading = true;

      // 构建请求参数
      const requestData = {
        ...this.editRangeFormData,
        littleGameProbabilityDetails: JSON.stringify({
          littleGameProbability: this.editRangeFormData.littleGameProbability,
          freeGameProbability: this.editRangeFormData.freeGameProbability,
          littleGameRanges: this.editRangeFormData.littleGameRanges,
          treasureBoxGameProbability: this.editRangeFormData.treasureBoxGameProbability,
          treasureBoxGameDetails: this.editRangeFormData.treasureBoxGameDetails ? JSON.stringify(this.editRangeFormData.treasureBoxGameDetails) : null
        })
      };

      // 调用修改接口
      updateGameOddsRange(requestData).then(response => {
        if (response.code === 200) {
          this.$modal.msgSuccess("修改成功！");
          this.editRangeDialogOpen = false;
          this.editRangeLoading = false;
          // 刷新抽屉数据
          this.getGameOddsRangeData(this.currentItem);
        } else {
          this.$modal.msgError(response.msg || "修改失败！");
          this.editRangeLoading = false;
        }
      }).catch(error => {
        console.error('修改失败:', error);
        this.$modal.msgError("修改失败，请重试！");
        this.editRangeLoading = false;
      });
    },

    /** 取消修改游戏赔率范围 */
    cancelEditRange() {
      this.editRangeDialogOpen = false;
      this.editRangeFormData = {
        id: null,
        siteId: null,
        gameId: null,
        gameOddsId: null,
        gameOddsRangeName: '',
        rtp: 0,
        type: 0,
        littleGameProbability: 0,
        freeGameProbability: 0,
        littleGameRanges: [],
        oddsRangeDetails: [],
        treasureBoxGameProbability: 0,
        treasureBoxGameDetails: {
          treasureBoxCount: [{
            multiplyingPowerRangeDown: null,
            multiplyingPowerRangeUp: null,
            probability: null
          }],
          upshift: [{
            multiplyingPowerRangeDown: null,
            multiplyingPowerRangeUp: null,
            probability: null
          }],
          additionalRewardProbability: 0,
          bananaProbability: 0,
          strawberryProbability: 0,
          appleProbability: 0,
          grapeProbability: 0,
          watermelonProbability: 0
        }
      };
    },

    /** 添加编辑小游戏倍率范围 */
    addEditLittleGameRange() {
      this.editRangeFormData.littleGameRanges.push({
        multiplyingPowerRangeDown: null,
        multiplyingPowerRangeUp: null,
        probability: null
      });
    },

    /** 删除编辑小游戏倍率范围 */
    removeEditLittleGameRange(rangeIndex) {
      this.editRangeFormData.littleGameRanges.splice(rangeIndex, 1);
    },

    /** 添加编辑倍率范围 */
    addEditOddsRange() {
      this.editRangeFormData.oddsRangeDetails.push({
        multiplyingPowerRangeDown: null,
        multiplyingPowerRangeUp: null,
        probability: null
      });
    },

    /** 删除编辑倍率范围 */
    removeEditOddsRange(rangeIndex) {
      this.editRangeFormData.oddsRangeDetails.splice(rangeIndex, 1);
    },

    /** 添加编辑宝箱个数范围 */
    addEditTreasureBoxCount() {
      if (!this.editRangeFormData.treasureBoxGameDetails) {
        this.editRangeFormData.treasureBoxGameDetails = {
          treasureBoxCount: [{
            multiplyingPowerRangeDown: null,
            multiplyingPowerRangeUp: null,
            probability: null
          }],
          upshift: [{
            multiplyingPowerRangeDown: null,
            multiplyingPowerRangeUp: null,
            probability: null
          }],
          additionalRewardProbability: 0,
          bananaProbability: 0,
          strawberryProbability: 0,
          appleProbability: 0,
          grapeProbability: 0,
          watermelonProbability: 0
        };
      }
      this.editRangeFormData.treasureBoxGameDetails.treasureBoxCount.push({
        multiplyingPowerRangeDown: null,
        multiplyingPowerRangeUp: null,
        probability: null
      });
    },

    /** 删除编辑宝箱个数范围 */
    removeEditTreasureBoxCount(rangeIndex) {
      this.editRangeFormData.treasureBoxGameDetails.treasureBoxCount.splice(rangeIndex, 1);
    },

    /** 添加编辑上升档位范围 */
    addEditUpshift() {
      if (!this.editRangeFormData.treasureBoxGameDetails) {
        this.editRangeFormData.treasureBoxGameDetails = {
          treasureBoxCount: [{
            multiplyingPowerRangeDown: null,
            multiplyingPowerRangeUp: null,
            probability: null
          }],
          upshift: [{
            multiplyingPowerRangeDown: null,
            multiplyingPowerRangeUp: null,
            probability: null
          }],
          additionalRewardProbability: 0,
          bananaProbability: 0,
          strawberryProbability: 0,
          appleProbability: 0,
          grapeProbability: 0,
          watermelonProbability: 0
        };
      }
      this.editRangeFormData.treasureBoxGameDetails.upshift.push({
        multiplyingPowerRangeDown: null,
        multiplyingPowerRangeUp: null,
        probability: null
      });
    },

    /** 删除编辑上升档位范围 */
    removeEditUpshift(rangeIndex) {
      this.editRangeFormData.treasureBoxGameDetails.upshift.splice(rangeIndex, 1);
    },

    /** 格式化百分比显示 */
    formatPercentage(value) {
      if (value === null || value === undefined) return '-';
      return (value * 100).toFixed(2) + '%';
    },

    /** 解析小游戏详情JSON */
    parseLittleGameDetails(jsonString) {
      if (!jsonString) return null;
      try {
        return JSON.parse(jsonString);
      } catch (error) {
        console.error('解析小游戏详情JSON失败:', error);
        return null;
      }
    },

    /** 解析宝箱游戏详情JSON */
    parseTreasureBoxDetails(jsonString) {
      if (!jsonString) return null;
      try {
        return JSON.parse(jsonString);
      } catch (error) {
        console.error('解析宝箱游戏详情JSON失败:', error);
        return null;
      }
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      // 初始化编辑表单数据
      this.editOddsForm = {
        id: row.id,
        inventoryName: row.inventoryName,
        type: row.type,
        baseInventory: row.baseInventory,
        baseRtp: row.baseRtp,
        baseInventoryHeight: row.baseInventoryHeight,
        inventoryHeightExtractionInterval: row.inventoryHeightExtractionInterval,
        inventoryHeightExtractionRatio: row.inventoryHeightExtractionRatio,
        gameId: row.gameId || 10003,
        siteId: row.siteId
      };
      this.editOddsOpen = true;
    },

    /** 获取RTP颜色类 */
    getRtpColorClass(rtp) {
      if (!rtp && rtp !== 0) return 'value-normal';
      const rtpValue = parseFloat(rtp);
      if (rtpValue > 1) return 'value-high';      // 大于100%用绿色
      if (rtpValue < 1) return 'value-low';       // 小于100%用红色
      return 'value-normal';                       // 等于100%用黑色
    },

    /** 获取库存颜色类 */
    getInventoryColorClass(realTimeInventory, baseInventory) {
      if (!realTimeInventory && realTimeInventory !== 0) return 'value-normal';
      if (!baseInventory && baseInventory !== 0) return 'value-normal';

      const realValue = parseFloat(realTimeInventory);
      const baseValue = parseFloat(baseInventory);

      if (realValue > baseValue) return 'value-high';      // 大于基准库存用绿色
      if (realValue < baseValue) return 'value-low';       // 小于基准库存用红色
      return 'value-normal';                               // 等于基准库存用黑色
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除游戏赔率编号为"' + ids + '"的数据项？').then(function () {
        return delOdds(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('biz/odds/export', {
        ...this.queryParams
      }, `odds_${new Date().getTime()}.xlsx`)
    },
    /** 刷新按钮操作 */
    handleRefresh() {
      this.getList();
    },
    /** 状态修改 */
    handleStatusChange(row) {
      let text = row.status === "1" ? "启用" : "停用";
      this.$modal.confirm('确认要"' + text + '""' + row.gameName + '"游戏赔率吗？').then(function () {
        return changeOddsStatus(row.id, row.status);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function () {
        row.status = row.status === "1" ? "0" : "1";
      });
    },
    // 格式化金额
    formatMoney(value) {
      if (value == null) return '0.00';
      return parseFloat(value).toFixed(2);
    },
    // 格式化百分比
    formatPercentage(value) {
      if (value == null) return '0.00%';
      return (parseFloat(value) * 100).toFixed(2) + '%';
    }
  }
};
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.mb8 {
  margin-bottom: 8px;
}

.dialog-footer {
  text-align: center;
}

.odds-form-container {
  padding: 10px;
}

/* 简洁数据卡片样式 */
.data-cards {
  margin-bottom: 30px;
}

.clean-odds-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.3s ease;
  margin-bottom: 24px;
  border: 1px solid #f0f0f0;
}

.clean-odds-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

/* 卡片头部 */
.card-header-clean {
  background: #fafafa;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.inventory-info {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
}

.inventory-icon {
  width: 48px;
  height: 48px;
  background: #f0f0f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.inventory-icon i {
  font-size: 48px;
  color: #007bff;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.inventory-icon:hover {
  background: #e0e0e0;
  transform: scale(1.05);
}

.inventory-icon i {
  font-size: 24px;
  color: #666;
}

.inventory-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.inventory-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.inventory-params {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  min-width: 200px;
}

.param-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  white-space: nowrap;
}

.param-label {
  color: #666;
  font-weight: 500;
}

.param-value {
  color: #333;
  font-weight: 600;
}

.edit-btn {
  border-radius: 6px !important;
  padding: 8px 16px !important;
}

/* 卡片主体 */
.card-body-clean {
  padding: 24px;
}

/* 核心指标 */
.core-metrics {
  margin-bottom: 24px;
}

.metric-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.metric-item {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #e9ecef;
}

.metric-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

/* 配置区域 */
.config-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
}

.config-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

.config-grid-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  max-width: 500px;
  margin: 0 auto;
}

.config-item {
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 2px solid #f0f0f0;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.config-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.config-value {
  font-size: 20px;
  font-weight: 700;
  color: #e74c3c;
}

/* 时间信息 */
.time-info {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid #e9ecef;
}

.time-info i {
  color: #999;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .metric-row {
    grid-template-columns: 1fr;
  }

  .config-grid {
    grid-template-columns: 1fr;
  }

  .config-grid-two {
    grid-template-columns: 1fr;
    max-width: none;
    gap: 20px;
  }

  .config-item {
    padding: 20px;
  }

  .config-value {
    font-size: 18px;
  }

  .inventory-params {
    flex-direction: column;
    gap: 8px;
    min-width: auto;
    align-items: flex-start;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .inventory-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}

.data-card .el-card__header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
  border: none;
}

.data-card .header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.data-card .header-left i {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
}

.data-card .game-name {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.data-card .card-actions {
  display: flex;
  gap: 8px;
}

.data-card .card-actions .el-button {
  color: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.3);
}

.data-card .card-actions .el-button:hover {
  color: white;
  border-color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.data-card .card-content {
  padding: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.info-item:hover {
  background-color: #e9ecef;
  transform: translateX(4px);
}

.info-item.highlight {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  border-left: 4px solid #ff6b6b;
}

.info-item i {
  color: #6c757d;
  font-size: 16px;
}

.info-item .label {
  font-weight: 500;
  color: #495057;
  min-width: 60px;
}

.info-item .value {
  color: #212529;
  font-weight: 500;
}

.info-item .value.money {
  color: #28a745;
  font-weight: 600;
}

.info-item .value.percentage {
  color: #007bff;
  font-weight: 600;
}

.info-item .value.time {
  color: #6c757d;
  font-size: 12px;
}

/* 默认卡片样式 */
.default-cards {
  padding: 20px 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
  padding: 20px 0;
  border-bottom: 2px solid #e9ecef;
}

.section-title i {
  font-size: 24px;
  color: #007bff;
}

.section-title span {
  font-size: 20px;
  font-weight: 600;
  color: #495057;
}

.template-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid #e9ecef;
  position: relative;
  overflow: hidden;
}

.template-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.template-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  border-color: #007bff;
}

.template-card:hover::before {
  transform: scaleX(1);
}

.card-icon {
  margin-bottom: 16px;
}

.card-icon i {
  font-size: 48px;
  color: #007bff;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
}

.card-desc {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 20px;
  line-height: 1.5;
}

.card-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 12px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #495057;
}

.card-action {
  margin-top: 16px;
}

.card-action .el-button {
  width: 100%;
  border-radius: 20px;
  font-weight: 500;
}

.template-cards-container {
  margin-bottom: 30px;
}

.batch-create-section {
  text-align: center;
  margin-top: 40px;
  padding: 30px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  border: 2px solid #dee2e6;
}

.batch-create-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background-color: rgba(0, 123, 255, 0.1);
  border-radius: 12px;
  border-left: 4px solid #007bff;
}

.batch-create-info i {
  font-size: 20px;
  color: #007bff;
}

.batch-create-info span {
  color: #495057;
  font-size: 14px;
  line-height: 1.5;
}

.batch-create-section .el-button {
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
}

.batch-create-section .el-button i {
  margin-right: 8px;
}

/* 批量创建弹窗样式 */
.batch-form-container {
  padding: 20px 0;
}

.batch-form-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: 12px;
  border-left: 4px solid #2196f3;
}

.batch-form-header i {
  font-size: 24px;
  color: #2196f3;
}

.batch-form-header span {
  color: #1976d2;
  font-size: 16px;
  font-weight: 500;
}

.batch-form-card {
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.batch-form-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.batch-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
}

.batch-card-header i {
  font-size: 20px;
  color: #007bff;
}

.batch-card-header span {
  font-weight: 600;
  color: #495057;
  font-size: 16px;
}

.param-count-badge {
  margin-top: 8px;
}

.param-count-badge span {
  display: inline-block;
  padding: 2px 8px;
  background: #28a745;
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.batch-form-content {
  padding: 20px;
}

.batch-form-content .form-item {
  margin-bottom: 16px;
}

.batch-form-content .form-item:last-child {
  margin-bottom: 0;
}

/* 编辑表单样式 */
.edit-form-container {
  padding: 20px 0;
}

/* 批量生成弹窗样式 */
.batch-generate-container {
  padding: 20px;
}

.batch-generate-card {
  margin-bottom: 20px;
}

.batch-generate-card .batch-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 600;
}

.batch-generate-card .batch-card-header i {
  font-size: 20px;
  color: #007bff;
}

.batch-form-content {
  padding: 16px 0;
}

.form-item {
  margin-bottom: 24px;
  padding: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #fafafa;
}

.form-item-header {
  margin-bottom: 16px;
}

.form-item-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  padding: 4px 12px;
  background: #007bff;
  color: white;
  border-radius: 20px;
  display: inline-block;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-col {
  flex: 1;
}

.form-col label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #666;
}

.odds-range-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}

.odds-range-section .section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.free-game-section {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
}

.free-game-section .section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8e8e8;
}

.odds-range-section {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
}

.odds-range-section .section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8e8e8;
}

.add-range-btn {
  margin-top: 16px;
  text-align: center;
}

.add-range-btn .el-button {
  border-radius: 6px;
  padding: 8px 16px;
}

.delete-btn-col {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  max-width: 40px;
  flex-shrink: 0;
  margin-top: 30px;
}

.delete-icon {
  color: #f56c6c;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 4px;
  border-radius: 4px;
}

.delete-icon:hover {
  background-color: #fef0f0;
  transform: scale(1.1);
}

.odds-range-form {
  margin-bottom: 16px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.range-form-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.range-form-col {
  flex: 1;
}

.range-form-col:not(.delete-btn-col) {
  flex: 1;
  min-width: 120px;
}

.delete-btn-col {
  flex: 0 0 30px;
}

.range-form-col label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #666;
}

.edit-form-container .el-form-item {
  margin-bottom: 20px;
}

.edit-form-container .el-form-item:last-child {
  margin-bottom: 0;
}

.edit-form-container .el-input-number {
  width: 100%;
}

/* 表单区域样式 */
.form-section {
  margin-bottom: 32px;
  padding: 24px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.form-section:last-child {
  margin-bottom: 0;
}

/* 区域标题样式 */
.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e9ecef;
}

.section-header i {
  font-size: 18px;
  color: #007bff;
}

.section-header span {
  font-size: 16px;
  font-weight: 600;
  color: #495057;
}

/* 输入框样式 */
.full-width-input {
  width: 100% !important;
}

.disabled-input .el-input__inner {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

/* 表单项间距 */
.edit-form-container .el-form-item {
  margin-bottom: 24px;
}

.edit-form-container .el-form-item:last-child {
  margin-bottom: 0;
}

/* 行间距样式 */
.row-spacer {
  height: 10px;
  margin: 5px 0;
}

/* 抽屉内容样式 */
.drawer-content {
  padding: 20px;
  height: 100%;
  width: 100%;
}

.odds-range-container {
  width: 100%;
  height: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
}

/* 左右分栏布局 */
.odds-layout {
  display: flex;
  gap: 30px;
  height: 100%;
  width: 100%;
}

.odds-left,
.odds-right {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.odds-left {
  padding-right: 20px;
  min-height: 100vh;
}

.odds-right {
  padding-left: 20px;
  width: 100%;
}

.odds-section {
  margin-bottom: 40px;
}

.odds-section .section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px 0;
  border-bottom: 2px solid #e9ecef;
}

.odds-section .section-title i {
  font-size: 24px;
  color: #007bff;
}

.odds-section .section-title span {
  font-size: 20px;
  font-weight: 600;
  color: #495057;
}

.odds-cards {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.odds-card {
  display: flex;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.odds-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.card-left {
  flex: 1;
  padding: 24px;
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
}

.game-info {
  margin-bottom: 20px;
}

.game-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.game-type {
  font-size: 16px;
  font-weight: 500;
  color: #007bff;
  padding: 4px 12px;
  background: rgba(0, 123, 255, 0.1);
  border-radius: 20px;
  display: inline-block;
}

.game-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-item .label {
  font-weight: 500;
  color: #666;
  min-width: 80px;
}

.detail-item .value {
  color: #333;
  font-weight: 600;
}

.card-right {
  flex: 1;
  padding: 24px;
  background: white;
}

.odds-range-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e9ecef;
}

.odds-range-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.range-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.range-label {
  font-weight: 500;
  color: #495057;
}

.range-probability {
  font-weight: 600;
  color: #007bff;
}

/* 加载状态样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
}

.loading-state i {
  font-size: 32px;
  margin-bottom: 16px;
  color: #007bff;
}

.loading-state p {
  font-size: 16px;
  margin: 0;
}

/* 空状态样式 */
.empty-odds-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.empty-content {
  text-align: center;
  max-width: 350px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-content i {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.empty-content h3 {
  font-size: 18px;
  color: #606266;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.empty-content p {
  font-size: 13px;
  color: #909399;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

.custom-generate-btn {
  background: #409eff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 180px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
}

.custom-generate-btn:hover {
  background: #337ecc;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  transform: translateY(-1px);
}

.custom-generate-btn i {
  font-size: 16px;
}

.custom-generate-btn span {
  font-weight: 500;
}

/* 抽屉标题样式 */
.drawer-title {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 8px;
}

.drawer-inventory-icon {
  font-size: 24px;
  color: #007bff;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.drawer-inventory-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

/* 小游戏详情样式 */
.little-game-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.summary-label {
  color: #666;
  font-weight: 500;
  min-width: 40px;
}

.summary-value {
  color: #333;
  font-weight: 600;
}

/* 详情网格布局 */
.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.details-grid .detail-item {
  margin-bottom: 0;
}

/* RTP标签样式 */
.rtp-tag {
  margin-left: 8px;
  font-size: 11px;
  height: 20px;
  line-height: 18px;
  padding: 0 6px;
}

.game-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 表单卡片样式 */
.form-card {
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;
}

.form-card .el-card__header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
}

.form-card .el-card__header span {
  font-weight: 600;
  color: #495057;
  font-size: 16px;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
  font-size: 14px;
}

.form-item .el-input,
.form-item .el-input-number,
.form-item .el-select {
  width: 100%;
}

/* 新的游戏赔率范围卡片样式 */
.odds-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 20px;
}

.section-header {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e9ecef;
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title i {
  color: #007bff;
}

.odds-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.odds-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #dee2e6;
}

.game-type {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.config-sections-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}

.rtp-row {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
}

.type-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.win-badge {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.lose-badge {
  background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
}

.rtp-display {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.rtp-label {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.rtp-value {
  font-size: 16px;
  color: #dc3545;
  font-weight: 700;
}

.card-content {
  padding: 20px;
}

.basic-info {
  margin-bottom: 20px;
}

.info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.info-label {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.info-value {
  font-size: 16px;
  color: #495057;
  font-weight: 600;
}

.section-subtitle {
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 12px;
  padding-bottom: 6px;
}

.little-game-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  width: 100%;
}

.little-game-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.config-label {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.config-value {
  font-size: 14px;
  color: #495057;
  font-weight: 600;
}

.ranges-section {
  margin-top: 12px;
}

.ranges-title {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
  margin-bottom: 8px;
}

.ranges-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.range-config-item {
  background: #fff;
  border-radius: 6px;
  padding: 8px 12px;
  border: 1px solid #dee2e6;
}

.range-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.range-label {
  font-size: 12px;
  color: #495057;
  font-weight: 500;
}

.range-probability {
  font-size: 12px;
  color: #28a745;
  font-weight: 600;
}

.odds-ranges-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  width: 100%;
}

.odds-ranges-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  width: 100%;
}

.odds-range-item {
  background: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  border: 1px solid #dee2e6;
  transition: all 0.2s ease;
}

.odds-range-item:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
}

.range-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.range-multiplier {
  font-size: 12px;
  color: #495057;
  font-weight: 500;
}

.odds-range-item .range-probability {
  font-size: 12px;
  color: #28a745;
  font-weight: 600;
}

.no-config {
  text-align: left;
  color: #6c757d;
  font-style: italic;
  padding: 20px;
  width: 100%;
}

.treasure-box-section .no-config {
  text-align: left !important;
  width: 100%;
  display: block;
}

.treasure-no-config {
  text-align: left !important;
  width: 100% !important;
  display: block !important;
  padding: 40px 20px !important;
  color: #6c757d !important;
  font-style: italic !important;
  min-height: 100px;
}

/* 修改按钮容器 */
.edit-button-container {
  margin-top: 12px;
  text-align: center;
}

/* 实时状态值样式 */
.real-time-value {
  color: #e74c3c !important;
  font-weight: 600;
  font-size: 20px;
  text-shadow: 0 1px 2px rgba(231, 76, 60, 0.2);
}

/* 动态颜色值样式 */
.config-value {
  font-weight: 600;
  font-size: 20px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.value-high {
  color: #27ae60 !important; /* 绿色 - 高于基准值 */
  text-shadow: 0 1px 2px rgba(39, 174, 96, 0.2);
}

.value-low {
  color: #e74c3c !important; /* 红色 - 低于基准值 */
  text-shadow: 0 1px 2px rgba(231, 76, 60, 0.2);
}

.value-normal {
  color: #2c3e50 !important; /* 黑色 - 等于基准值 */
  text-shadow: 0 1px 2px rgba(44, 62, 80, 0.2);
}

/* 修改弹窗样式 */
.edit-dialog-container {
  padding: 20px;
}

.edit-dialog-card {
  border-radius: 12px;
  overflow: hidden;
}

.edit-dialog-card .el-card__header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
}

.edit-dialog-card .el-card__header span {
  font-weight: 600;
  color: #495057;
  font-size: 16px;
}

/* 小游戏倍率范围样式 */
.little-game-ranges {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
}

.little-range-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-size: 11px;
}

.little-range-item .range-label {
  font-size: 12px;
  color: #495057;
  font-weight: 500;
}

.little-range-item .range-probability {
  font-size: 12px;
  color: #28a745;
  font-weight: 600;
}

/* 编辑对话框左右分栏布局 */
.edit-config-layout {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.config-left,
.config-right {
  flex: 1;
  min-width: 0;
}

.config-left {
  padding-right: 10px;
}

.config-right {
  padding-left: 10px;
}

/* 宝箱配置左右并排布局 */
.treasure-box-configs-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 0px;
}

.treasure-box-configs-row .treasure-box-ranges-edit {
  flex: 1;
  min-width: 0;
}

/* 分割线样式 */
.section-divider {
  display: flex;
  align-items: center;
  margin: 24px 0;
  gap: 16px;
}

.divider-line {
  flex: 1;
  height: 2px;
  background: #e9ecef;
}

.divider-text {
  font-size: 14px;
  font-weight: 600;
  color: #007bff;
  background: #f8f9fa;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #e9ecef;
  white-space: nowrap;
}

/* 宝箱游戏配置样式 */
.treasure-box-section {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  width: 100%;
}

.treasure-box-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.treasure-box-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.treasure-box-ranges {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.fruit-probabilities {
  background: white;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  margin-top: 4px;
}

.fruit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.fruit-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.fruit-item:hover {
  background: #e3f2fd;
  border-color: #2196f3;
  transform: translateY(-1px);
}

.fruit-label {
  font-size: 12px;
  font-weight: 500;
  color: #495057;
}

.fruit-probability {
  font-size: 12px;
  font-weight: 600;
  color: #28a745;
}

.additional-reward {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.reward-probability {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  border-radius: 8px;
  border: 1px solid #ffc107;
  margin-top: 12px;
}

.reward-label {
  font-size: 12px;
  font-weight: 500;
  color: #856404;
}

.reward-value {
  font-size: 12px;
  font-weight: 600;
  color: #d63384;
}

.probability-value {
  font-size: 12px;
  font-weight: 600;
  color: #d63384;
}

.ranges-title-with-probability {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.ranges-title-with-probability .probability-title {
  text-align: right;
}

.section-subtitle-with-probability {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: -15px;
}

.section-subtitle-with-probability .probability-title {
  text-align: right;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .template-card {
    margin-bottom: 20px;
  }

  .fruit-grid {
    grid-template-columns: 1fr;
  }

  .divider-text {
    font-size: 12px;
    padding: 6px 12px;
  }

  .fruit-form-grid {
    grid-template-columns: 1fr;
  }
}

/* 宝箱游戏编辑样式 */
.treasure-box-details-edit {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 16px;
}

.treasure-box-ranges-edit {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}


.fruit-form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 12px;
}

.fruit-form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fruit-form-item label {
  font-size: 14px;
  font-weight: 500;
  color: #495057;
}

.additional-reward-edit {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}
</style>
