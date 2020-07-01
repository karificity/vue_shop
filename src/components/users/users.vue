<template>
	<div>
		<!-- 面包屑导航 -->
		<el-breadcrumb separator="/">
		  <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
		  <el-breadcrumb-item>用户管理</el-breadcrumb-item>
		  <el-breadcrumb-item>用户列表</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片 -->
		<el-card>
			<el-row :gutter="20">
				<el-col :span="8">
					<el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
						<el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
					</el-input>
				</el-col>
				<el-col :span="4">
					<el-button type="primary" @click="centerDialogVisible = true">添加用户</el-button>
				</el-col>
			</el-row>
			<!-- 表格 -->
			<el-table
			    :data="userlist"
			    stripe border>
				<el-table-column
				  label="#"
				  type="index">
				</el-table-column>
			    <el-table-column
			      prop="username"
			      label="用户名"
			      width="180">
			    </el-table-column>
			    <el-table-column
			      prop="email"
			      label="邮箱"
			      width="180">
			    </el-table-column>
			    <el-table-column
			      prop="mobile"
			      label="电话">
			    </el-table-column>
				<el-table-column
			      prop="role_name"
			      label="角色">
			    </el-table-column>
				<el-table-column
				  prop="mg_state"
				  label="状态">
					<template slot-scope="scope">
						<el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="180px">
					<template slot-scope="scope">
						<!-- 修改按钮 -->
						<el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
						<!-- 删除按钮 -->
						<el-button type="danger" icon="el-icon-delete" size="mini" @click="showDelDialog(scope.row.id)"></el-button>
						<!-- 分配角色按钮 -->
						<el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
							<el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRoleDialog(scope.row)"></el-button>
						</el-tooltip>
					</template>
				</el-table-column>
			</el-table>
			<!-- 分页 -->
			<el-pagination
			      @size-change="handleSizeChange"
			      @current-change="handleCurrentChange"
			      :current-page="queryInfo.pagenum"
			      :page-sizes="[1, 2, 3, 4]"
			      :page-size="queryInfo.pagesize"
			      layout="total, sizes, prev, pager, next, jumper"
			      :total="total">
			</el-pagination>
		</el-card>
		<!-- 添加用户区域 -->
		<el-dialog title="添加用户" :visible.sync="centerDialogVisible" width="50%" @close="addDialogClose">
			<!-- 内容主体区域 -->
			<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
				<el-formItem prop="username" label="用户名">
					<el-input v-model="addForm.username"></el-input>
				</el-formItem>
				<el-formItem prop="password" label="密码">
					<el-input v-model="addForm.password"></el-input>
				</el-formItem>
				<el-formItem prop="email" label="邮箱">
					<el-input v-model="addForm.email"></el-input>
				</el-formItem>
				<el-formItem prop="mobile" label="电话">
					<el-input v-model="addForm.mobile"></el-input>
				</el-formItem>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="centerDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addUser">确 定</el-button>
			</span>
		</el-dialog>
		<!-- 修改用户信息对话框 -->
		<el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
			<!-- 内容主体区域 -->
			<el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
				<el-formItem label="用户名" >
					<el-input v-model="editForm.username" disabled></el-input>
				</el-formItem>
				<el-formItem prop="email" label="邮箱">
					<el-input v-model="editForm.email"></el-input>
				</el-formItem>
				<el-formItem prop="mobile" label="电话">
					<el-input v-model="editForm.mobile"></el-input>
				</el-formItem>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="editUserInfo">确 定</el-button>
			</span>
		</el-dialog>
		<!-- 分配角色对话框 -->
		<el-dialog
		  title="提示"
		  :visible.sync="setRoleDialogVisible"
		  width="50%" @close="setRoleDialogClosed">
		  <div>
			  <p>用户名：{{this.userInfo.username}}</p>
			  <p>角色：{{this.userInfo.role_name}}</p>
			  <p>分配新角色：
				<el-select v-model="selectedRoleId" placeholder="请选择">
					<el-option
						v-for="item in rolesList"
						:key="item.id"
						:label="item.roleName"
						:value="item.id">
					</el-option>
			    </el-select>
			  </p>
		  </div>
		  <span slot="footer" class="dialog-footer">
		    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
		    <el-button type="primary" @click="allotRole">确 定</el-button>
		  </span>
		</el-dialog>
	</div>
</template>

<script>
export default{
	data(){
		// 自定义邮箱和电话格式
		var checkEmail = (rule, value, cb) => {
			const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
			if(regEmail.test(value)){
				return cb()
			}
			cb(new Error('请输入合法的邮箱'))
		}
		var checkMobile = (rule, value, cb) => {
			const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
			if(regMobile.test(value)){
				return cb()
			}
			cb(new Error('请输入合法的电话'))
		}
		return{
			userlist:[],
			queryInfo:{
				query: '',
				pagenum: 1,
				pagesize: 2
			},
			total: 0,
			centerDialogVisible: false,
			editDialogVisible: false,
			addForm:{
				username: '',
				password: '',
				email: '',
				mobile: ''
			},
			addFormRules:{
				username:[
					{ required: true, message: "请输入用户名", trigger: "blur" },
					{ min: 3, max: 10, message: "长度在3-10之间", trigger: "blur" }
				],
				password:[
					{ required: true, message: "请输入密码", trigger: "blur" }
				],
				email:[
					{ required: true, message: "请输入邮箱", trigger: "blur" },
					{ validator: checkEmail, trigger: "blur" }
				],
				mobile:[
					{ required: true, message: "请输入号码", trigger: "blur" },
					{ validator: checkMobile, trigger: "blur" }
				]
			},
			editForm:{},
			editFormRules:{
				email:[
					{ required: true, message: "请输入邮箱", trigger: "blur" },
					{ validator: checkEmail, trigger: "blur" }
				],
				mobile:[
					{ required: true, message: "请输入号码", trigger: "blur" },
					{ validator: checkMobile, trigger: "blur" }
				]
			},
			setRoleDialogVisible: false,
			userInfo:{},
			rolesList:[],
			selectedRoleId:''
		}
	},
	created(){
		this.getUserList()
	},
	methods:{
		// 获取用户列表
		async getUserList(){
			const { data: res } = await this.$http.get('users', {
				params: this.queryInfo
			})
			if( res.meta.status !== 200) return this.$message.error('获取用户列表失败！')
			this.userlist = res.data.users
			this.total = res.data.total
			console.log(res)
		},
		// 监听分页部分的操作
		handleSizeChange(newSize){
			this.queryInfo.pagesize = newSize
			this.getUserList()
		},
		handleCurrentChange(newNum){
			this.queryInfo.pagenum = newNum
			this.getUserList()
		},
		// 修改用户状态(提交到后台) put方法
		async userStateChange(userInfo){
			const {data: res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
			if( res.meta.status !== 200 ){
				userInfo.mg_state != userInfo.mg_state
				return this.$message.error('更改用户状态失败')
			}
			this.$message.success('更改用户状态成功')
		},
		// 关闭确认区域后重置区域内的内容
		addDialogClose(){
			this.$refs.addFormRef.resetFields()
		},
		// 点击确认添加新用户
		addUser(){
			this.$refs.addFormRef.validate(async valid => {
				if(!valid) return
				const { data: res } = await this.$http.post('users', this.addForm)
				if(res.meta.status !== 201) return this.$message.error("添加用户失败")
				this.$message.success("添加用户成功")
				this.centerDialogVisible = false
				this.getUserList()
			})
		},
		// 编辑区域展现出来时开始获取该用户的后台信息
		async showEditDialog(id){
			const {data: res} = await this.$http.get(`users/${id}`)
			if(res.meta.status !== 200) return this.$message.error('获取用户数据失败')
			this.editForm = res.data
			this.editDialogVisible = true
		},
		// 编辑区域关闭后重置区域中的内容
		editDialogClose(){
			this.$refs.editFormRef.resetFields()
		},
		// 点击提交编辑用户信息
		editUserInfo(){
			this.$refs.editFormRef.validate(async valid => {
				if(!valid) return
				const { data: res } = await this.$http.put(`users/${this.editForm.id}`, {
					email: this.editForm.email,
					mobile: this.editForm.mobile
				})
				if(res.meta.status !== 200) return this.$message.error("更新用户信息失败")
				this.$message.success("更新用户信息成功")
				this.editDialogVisible = false
				this.getUserList()
			})
		},
		// 展示删除用户对话框
		async showDelDialog(id){
			const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).catch(err => err)
			// 返回一个promise函数，confirmResult在点击确认后返回confirm，取消时返回cancel
			if(confirmResult !== "confirm") return this.$message.info('已取消删除')
			// delete删除id对应那一行的数据
			const { data: res } = await this.$http.delete(`users/${id}`)
			if(res.meta.status !== 200) return this.$message.error('删除用户失败')
			this.$message.success('删除用户成功')
			this.getUserList()
		},
		async showSetRoleDialog(userInfo){
			this.userInfo = userInfo
			const {data: res} = await this.$http.get('roles')
			if(res.meta.status !== 200) return this.$message.error('获取角色列表失败')
			this.rolesList = res.data
			this.setRoleDialogVisible = true
		},
		async allotRole(){
			if(!this.selectedRoleId) return this.$message.error('请选择要分配的角色')
			const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {rid: this.selectedRoleId})
			if(res.meta.status !== 200) return this.$message.error('更新角色失败')
			this.$message.success('更新角色成功')
			this.getUserList()
			this.setRoleDialogVisible = false
		},
		setRoleDialogClosed(){
			this.userInfo = '',
			this.selectedRoleId = ''
		}
	}
};
</script>

<style lang="less" scoped>
	.el-card{
		box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15)!important;
	}
	.el-table{
		margin-top: 15px;
		font-size: 12px;
	}
	.el-pagination{
		margin-top: 15px;
	}
</style>