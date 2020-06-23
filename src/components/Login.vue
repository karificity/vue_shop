<template>
<div class="login_container">
	<div class="login_box">
		<!-- 头像 -->
		<div class="avatar_box">
			<img src="../assets/logo.png" alt="">
		</div>
		<!-- 表单 -->
		<el-form :model="loginForm" :rules="loginFormRules" ref="loginFormRef" label-width="0px" class="login_form">
			<!-- 用户名 -->
			<el-formItem prop="username">
				<el-input v-model="loginForm.username" prefix-icon="el-icon-user-solid"></el-input>
			</el-formItem>
			<!-- 密码 -->
			<el-formItem prop="password">
				<el-input v-model="loginForm.password" type="password" prefix-icon="el-icon-lock"></el-input>
			</el-formItem>
			<!-- 按钮 -->
			<el-formItem class="btn">
				<el-button type="primary" @click="login">登录</el-button>
				<el-button type="info" @click="resetLoginForm">重置</el-button>
			</el-formItem>
		</el-form>
	</div>
</div>
</template>

<script>
export default {
	data(){
		return{
			// 登录表单数据验证对象
			loginForm:{
				username:'admin',
				password:'123456'
			},
			// 表单验证规则
			loginFormRules:{
				// 验证用户名是否合法
				username:[
					{ required: true, message: "请输入用户名", trigger: "blur" },
					{ min: 3, max: 10, message: "长度在3-10之间", trigger: "blur" }
				],
				// 验证密码是否合法
				password:[
					{ required: true, message: "请输入密码", trigger: "blur" }
				]
			}
		}
	},
	methods:{
		resetLoginForm(){
			this.$refs.loginFormRef.resetFields();
		},
		login(){
			this.$refs.loginFormRef.validate(async valid => {
				if(!valid) return;
				const { data: res } = await this.$http.post('login', this.loginForm);
				if(res.meta.status !==200) return this.$message.error("登录失败");
				this.$message.success("登录成功");
				window.sessionStorage.setItem("token", res.data.token);
				this.$router.push("/home");
			})
		}
	}
}
</script>

<style lang="less" scoped>
	.login_container{
		background-color: #2b4b6b;
		height: 100%;
	}

	.login_box{
		width: 450px;
		height: 300px;
		background: #fff;
		border-radius: 3px;
		position: absolute;
		left: 50%;
		top: 50%;
		margin-left: -225px;
		margin-top: -150px;
	}

	.avatar_box{
		height: 130px;
		width: 130px;
		border: 1px solid #eee;
		border-radius: 50%;
		padding: 10px;
		box-shadow: 0 0 10px #ddd;
		position: absolute;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: #fff;
		img{
			width: 100%;
			height: 100%;
			background-color: #eee;
			border-radius: 50%;
		}
	}
	
	.login_form{
		position: absolute;
		bottom: 0;
		width: 100%;
		padding: 0 20px;
		box-sizing: border-box;
	}
	
	.btn{
		display: flex;
		justify-content: flex-end;
	}
</style>
