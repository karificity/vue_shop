<template>
	<div>
		<el-breadcrumb separator="/">
		  <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
		  <el-breadcrumb-item>权限管理</el-breadcrumb-item>
		  <el-breadcrumb-item>权限列表</el-breadcrumb-item>
		</el-breadcrumb>
		<el-card>
			<el-row>
				<el-col>
					<el-button type="primary" @click="showAddRoleDialog">添加角色</el-button>
				</el-col>
			</el-row>
			<el-table :data="rolesList" stripe border>
				<el-table-column type="expand">
					<template slot-scope="scope">
						<el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
							<el-col :span="5">
								<el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
								<i class="el-icon-caret-right"></i>
							</el-col>
							<el-col :span="19">
								<el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
									<el-col :span="6">
										<el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
										<i class="el-icon-caret-right"></i>
									</el-col>
									<el-col :span="18">
											<el-tag v-for="item3 in item2.children" :key="item3.id" type="warning" closable @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
									</el-col>
								</el-row>
							</el-col>
						</el-row>
					</template>
				</el-table-column>
				<el-table-column type="index" label="#"></el-table-column>
				<el-table-column label="角色名称" prop="roleName"></el-table-column>
				<el-table-column label="角色描述" prop="roleDesc"></el-table-column>
				<el-table-column label="操作" width="300px">
					<template slot-scope="scope">
						<el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
						<el-button size="mini" type="danger" icon="el-icon-delete" @click="showDelDialog(scope.row.id)">删除</el-button>
						<el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-card>
		<!-- 显示分配权限对话框 -->
		<el-dialog
		  title="提示"
		  :visible.sync="setRightDialogVisible"
		  width="50%"  @close="setRightDialogClose">
		  <!-- 树形控件 -->
		  <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
		  <span slot="footer" class="dialog-footer">
		    <el-button @click="setRightDialogVisible = false">取 消</el-button>
		    <el-button type="primary" @click="allotRights">确 定</el-button>
		  </span>
		</el-dialog>
		<!-- 显示添加角色对话框 -->
		<el-dialog
		  title="添加角色"
		  :visible.sync="addRoleDialogVisible"
		  width="50%" @close="addRoleDialogClosed">
		  <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
			  <el-formItem label="角色名称" prop="roleName">
				  <el-input v-model="addForm.roleName"></el-input>
			  </el-formItem>
			  <el-formItem label="角色描述">
				  <el-input v-model="addForm.roleDesc"></el-input>
			  </el-formItem>
		  </el-form>
		  <span slot="footer" class="dialog-footer">
		    <el-button @click="addRoleDialogVisible = false">取 消</el-button>
		    <el-button type="primary" @click="addRole">确 定</el-button>
		  </span>
		</el-dialog>
		<!-- 显示编辑角色对话框 -->
		<el-dialog
		  title="编辑角色信息"
		  :visible.sync="editRoleDialogVisible"
		  width="50%" @close="editRoleDialogClosed">
		  <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
			  <el-formItem label="角色名称" prop="roleName">
				  <el-input v-model="editForm.roleName"></el-input>
			  </el-formItem>
			  <el-formItem label="角色描述">
				  <el-input v-model="editForm.roleDesc"></el-input>
			  </el-formItem>
		  </el-form>
		  <span slot="footer" class="dialog-footer">
		    <el-button @click="editRoleDialogVisible = false">取 消</el-button>
		    <el-button type="primary" @click="editRole">确 定</el-button>
		  </span>
		</el-dialog>
	</div>
</template>

<script>
export default{
	data(){
		return{
			rolesList:[],
			addForm:{
				roleName:'',
				roleDesc:''
			},
			addFormRules:{
				roleName:[
					{ required: true, message: "请输入角色名称", trigger: "blur" }
				]
			},
			editForm:{},
			editFormRules:{
				roleName:[
					{ required: true, message: "请输入角色名称", trigger: "blur" }
				]
			},
			rightsList:[],
			setRightDialogVisible: false,
			treeProps:{
				label:'authName',
				children:'children'
			},
			defKeys:[],
			roleId:'',
			addRoleDialogVisible: false,
			editRoleDialogVisible: false,
			id:''
		}
	},
	created(){
		this.getRolesList()
	},
	methods:{
		// 获得角色列表
		async getRolesList(){
			const { data: res } = await this.$http.get('roles')
			if(res.meta.status !== 200) return this.$message.error('获取角色列表失败')
			this.rolesList = res.data
		},
		//删除某角色的权限
		async removeRightById(role, rightId){
			const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).catch(err => err)
			if(confirmResult !== 'confirm'){ return this.$message.info('取消了删除')}
			const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
			if(res.meta.status !== 200){ return this.$message.error('删除权限失败')}
			role.children = res.data
		},
		//获取所有权限数据
		async showSetRightDialog(role){
			//提交权限数据时需要获得当前角色id值
			this.roleId = role.id
			const { data: res } = await this.$http.get(`rights/tree`)
			if(res.meta.status !== 200){ return this.$message.error('获取权限数据失败')}
			this.rightsList = res.data
			this.getLeafKeys(role, this.defKeys)
			this.setRightDialogVisible = true
		},
		// 通过递归获取该角色下所有三级节点的id并放在一个数组中
		getLeafKeys(node, arr){
			if(!node.children){
				return arr.push(node.id)
			}
			node.children.forEach(item => this.getLeafKeys(item, arr))
		},
		// 每次关闭分配权限对话框都要清理一下上次保存的defKeys
		setRightDialogClose(){
			this.defKeys = []
		},
		async allotRights(){
			const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
			const idStr = keys.join(',')
			const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr})
			if(res.meta.status !== 200){ return this.$message.error('分配权限失败')}
			this.$message.success('分配权限成功')
			this.getRolesList()
			this.setRightDialogVisible = false
		},
		//添加角色
		showAddRoleDialog(){
			this.addRoleDialogVisible = true
		},
		//确定添加角色
		addRole(){
			this.$refs.addFormRef.validate(async valid =>{
				if(!valid) return
				const {data: res} = await this.$http.post('roles', this.addForm)
				if(res.meta.status !== 201) return this.$message.error('创建角色失败')
				this.$message.success('创建角色成功')
				this.addRoleDialogVisible = false
				this.getRolesList()
			})
		},
		addRoleDialogClosed(){
			this.$refs.addFormRef.resetFields()
		},
		//角色信息编辑对话框
		async showEditDialog(id){
			this.id = id
			const { data: res } = await this.$http.get(`roles/${id}`)
			if(res.meta.status !== 200) return this.$message.error('获取角色信息失败')
			this.editForm = res.data
			this.editRoleDialogVisible = true
		},
		editRole(){
			this.$refs.editFormRef.validate( async valid => {
				if(!valid) return
				const { data: res } = await this.$http.put(`roles/${this.id}`, this.editForm)
				if(res.meta.status !== 200) return this.$message.error('修改角色信息失败')
				this.$message.success('修改角色信息成功')
				this.getRolesList()
				this.editRoleDialogVisible = false
			})
		},
		editRoleDialogClosed(){
			this.$refs.editFormRef.resetFields()
		},
		async showDelDialog(id){
			const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).catch(err => err)
			if(confirmResult !== 'confirm') return this.$message.info('已取消删除')
			const { data: res } = await this.$http.delete(`roles/${id}`)
			if(res.meta.status !== 200) return this.$message.error('删除角色失败')
			this.$message.success('删除角色成功')
			this.getRolesList()
		}
	}
}
</script>

<style lang="less" scoped>
	 .el-table{
		 margin-top: 15px;
	}
	
	.bdtop{
		border-top: 1px solid #eee;
	}
	
	.bdbottom{
		border-bottom: 1px solid #eee;
	}
	
	.el-tag{
		margin: 7px;
	}
	
	.vcenter{
		display: flex;
		align-items: center;
	}
</style>
