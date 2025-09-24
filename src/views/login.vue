<template>
  <div class="login">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form">
      <h3 class="title">Login</h3>
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" type="text" auto-complete="off" placeholder="账号">
          <svg-icon slot="prefix" icon-class="user" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="loginForm.password" type="password" auto-complete="off" placeholder="密码"
          @keyup.enter.native="handleLogin">
          <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <el-form-item prop="googleCode">
        <el-input
          v-model="loginForm.googleCode"
          type="password"
          auto-complete="off"
          placeholder="谷歌验证码"
        >
          <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon"/>
        </el-input>
      </el-form-item>

      <el-form-item style="width:100%;">
        <el-button :loading="loading" size="medium" type="primary" style="width:100%;"
          @click.native.prevent="handleLogin">
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
        <div style="float: right;" v-if="register">
          <router-link class="link-type" :to="'/register'">立即注册</router-link>
        </div>
      </el-form-item>
    </el-form>

    <!-- 谷歌二维码弹框 -->
    <el-dialog
      title="绑定谷歌验证器"
      :visible.sync="qrCodeDialogVisible"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div style="text-align: center;">
        <p style="margin-bottom: 20px; color: #666;">请使用谷歌验证器扫描下方二维码</p>
        <div v-if="qrCodeImageUrl" style="margin-bottom: 20px;">
          <img :src="qrCodeImageUrl" alt="谷歌验证器二维码" style="max-width: 200px; max-height: 200px;" />
        </div>
        <el-input
          v-model="googleAuthCode"
          placeholder="请输入谷歌验证码"
          style="margin-bottom: 20px;"
          maxlength="6"
        />
        <div>
          <el-button @click="cancelGoogleAuth" style="margin-right: 10px;">取消</el-button>
          <el-button type="primary" @click="confirmGoogleAuth" :loading="authLoading">确认绑定</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import { encrypt, decrypt } from '@/utils/jsencrypt'
import { verifyUserPassword } from '@/api/login'

export default {
  name: "Login",
  data() {
    return {
      codeUrl: "",
      loginForm: {
        username: "",
        password: "",
        googleCode: "",
      },
      loginRules: {
        username: [
          { required: true, trigger: "blur", message: "请输入您的账号" }
        ],
        password: [
          { required: true, trigger: "blur", message: "请输入您的密码" }
        ],
        // googleCode: [{required: true, trigger: "change", message: "请输入谷歌验证码"}]
      },
      loading: false,
      // 注册开关
      register: false,
      redirect: undefined,
      // 谷歌二维码相关
      qrCodeDialogVisible: false,
      qrCodeImageUrl: '',
      googleAuthCode: '',
      authLoading: false
    };
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true
    }
  },
  created() {
    this.getCookie();
  },
  methods: {
    getCookie() {
      const username = Cookies.get("username");
      const password = Cookies.get("password");
      this.loginForm = {
        username: username === undefined ? this.loginForm.username : username,
        password: password === undefined ? this.loginForm.password : decrypt(password),
      };
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true;
          Cookies.remove("username");
          Cookies.remove("password");

          // 如果输入了谷歌验证码，直接走登录逻辑
          if (this.loginForm.googleCode) {
            this.performLogin();
          } else {
            // 如果没有输入谷歌验证码，先验证密码获取二维码
            this.verifyPasswordAndGetQrCode();
          }
        } else {
          this.loading = false;
        }
      });
    },
    
    // 执行登录
    performLogin() {
      try {
        this.$store.dispatch("Login", this.loginForm).then(() => {
          this.$router.push({ path: this.redirect || "/" }).catch(() => {
          });
        }).catch(() => {
          this.loading = false;
        })
      } finally {
        this.loading = false;
      }
    },
    
    // 验证密码并获取二维码
    verifyPasswordAndGetQrCode() {
      const data = {
        username: this.loginForm.username,
        password: this.loginForm.password
      };
      
      verifyUserPassword(data).then(response => {
        if (response.code === 200) {
          // 创建图片URL
          const blob = new Blob([response], { type: 'image/png' });
          this.qrCodeImageUrl = URL.createObjectURL(blob);
          this.qrCodeDialogVisible = true;
        } else {
          this.$message.error(response.message || '密码验证失败');
        }
        this.loading = false;
      }).catch(error => {
        this.loading = false;
        this.$message.error('密码验证失败，请检查用户名和密码');
      });
    },
    
    // 取消谷歌验证
    cancelGoogleAuth() {
      this.qrCodeDialogVisible = false;
      this.qrCodeImageUrl = '';
      this.googleAuthCode = '';
    },
    
    // 确认谷歌验证
    confirmGoogleAuth() {
      if (!this.googleAuthCode) {
        this.$message.warning('请输入谷歌验证码');
        return;
      }
      
      this.authLoading = true;
      // 将谷歌验证码添加到登录表单中
      this.loginForm.googleCode = this.googleAuthCode;
      
      // 关闭弹框
      this.qrCodeDialogVisible = false;
      this.qrCodeImageUrl = '';
      this.googleAuthCode = '';
      
      // 执行登录
      this.performLogin();
      this.authLoading = false;
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss">
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url("../assets/images/login-background.jpg");
  background-size: cover;
}

.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}

.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 25px 25px 5px 25px;

  .el-input {
    height: 38px;

    input {
      height: 38px;
    }
  }

  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 2px;
  }
}

.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}

.login-code {
  width: 33%;
  height: 38px;
  float: right;

  img {
    cursor: pointer;
    vertical-align: middle;
  }
}

.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}

.login-code-img {
  height: 38px;
}
</style>
