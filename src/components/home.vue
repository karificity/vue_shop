<template>
	<el-container class="home-container">
		<!-- 头部区域 -->
	  <el-header>
		  <div>
			  <img src="../assets/heima.png" alt="">
			  <span>电商后台管理系统</span>
		  </div>
		  <el-button type="info" @click="logout">退出</el-button>
	  </el-header>
	  <!-- 主体区域 -->
	  <el-container>
		  <!-- 侧边栏 -->
	    <el-aside :width="isCollapse ? '64px' : '200px'">
			<div class="toggleCollapse" @click="toggleCollapse">|||</div>
			<el-menu
			      background-color="#545c64"
			      text-color="#fff"
			      active-text-color="#409EFF"
				  unique-opened
				  :collapse="isCollapse"
				  :collapse-transition="false"
				  router
				  :default-active="activePath">
				  <!-- 一级菜单 -->
			      <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
					<!-- 一级菜单模板区域 -->
			        <template slot="title">
						<!-- 图标 -->
						<i :class="'el-icon-' + iconObj[item.id]"></i>
						<!-- 文字 -->
						<span>{{ item.authName }}</span>
			        </template>  
					<!-- 二级菜单 -->
			        <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
						<template slot="title">
						  <i class="el-icon-menu"></i>
						  <span>{{ subItem.authName }}</span>
						</template>  
					</el-menu-item>
			      </el-submenu>
			    </el-menu>
		</el-aside>
		<!-- 右侧内容主体 -->
	    <el-main>
			<!-- 路由占位符 -->
			<router-view></router-view>
		</el-main>
	  </el-container>
	</el-container>
</template>

<script>
export default {
	data(){
		return{
			menulist: [],
			iconObj:{
				'125': 'user-solid',
				'103': 's-management',
				'101': 's-goods',
				'102': 's-order',
				'145': 's-marketing'
			},
			isCollapse: false,
			activePath: ''
		}
	},
	created(){
		this.getMenuList()
		this.activePath = window.sessionStorage.getItem('activePath')
	},
	methods:{
		logout(){
			window.sessionStorage.clear()
			this.$router.push('/login')
		},
		async getMenuList(){
			const { data: res } = await this.$http.get('menus')
			if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
			this.menulist = res.data
		},
		toggleCollapse(){
			this.isCollapse = !this.isCollapse
		},
		saveNavState(activePath){
			window.sessionStorage.setItem('activePath', activePath)
			this.activePath = activePath
		}
	}
};
</script>

<style lang="less" scoped>
.home-container {
	height: 100%;
}
	
.el-header {
	background-color: #373d41;
	display: flex;
	justify-content: space-between;
	padding-left: 0;
	align-items: center;
	color: #fff;
	font-size: 20px;
	> div {
		display: flex;
		align-items: center;
		span{
			margin-left: 15px;
		}
	}
}

.el-aside {
	background-color: #333744;
	.el-menu{
		border-right: 0;
	}
}

.el-main {
	background-color: #eaedf1;
}

.toggleCollapse{
	background-color: #999999;
	font-size: 10px;
	line-height: 24px;
	color: #fff;
	text-align: center;
	letter-spacing: 0.2em;
	cursor: pointer;
}
</style>
