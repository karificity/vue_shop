<template>
	<div>
		<el-breadcrumb separator="/">
		  <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
		  <el-breadcrumb-item>商品管理</el-breadcrumb-item>
		  <el-breadcrumb-item>参数列表</el-breadcrumb-item>
		</el-breadcrumb>
		<el-card>
			<!-- 警告区域 -->
			<el-alert
			    title="注意!只允许为第三级分类设置相关参数!"
			    type="warning"
				show-icon :closable="false">
			</el-alert>
			<!-- 选择商品分类区域 -->
			<el-row class="cat_opt">
				<el-col>
					<span>选择商品分类：
						<!-- 选择商品分类的级联选择框 -->
						<el-cascader
						    :options="cateList"
						    :props="cateProps"
							v-model="selectCateKeys"
						    @change="handleChange"></el-cascader>
					</span>
				</el-col>
			</el-row>
			<el-tabs v-model="activeName" @tab-click="handleTabClick">
				<!-- 添加动态参数的面板 -->
			    <el-tab-pane label="动态参数" name="many">
					<!-- 添加属性按钮 -->
					<el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddAttrDialog">添加参数</el-button>
					<el-table :data="manyTableData" stripe border>
						<!-- 展开行 -->
						<el-table-column type="expand">
							<template slot-scope="scope">
								<el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
								<el-input
								  class="input-new-tag"
								  v-if="scope.row.inputVisible"
								  v-model="scope.row.inputValue"
								  ref="saveTagInput"
								  size="small"
								  @keyup.enter.native="handleInputConfirm(scope.row)"
								  @blur="handleInputConfirm(scope.row)"
								>
								</el-input>
								<el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
							</template>
						</el-table-column>
						<!-- 索引列 -->
						<el-table-column label="#" type="index"></el-table-column>
						<el-table-column label="参数名称" prop="attr_name"></el-table-column>
						<el-table-column label="操作">
							<template slot-scope="scope">
								<el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
								<el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParmas(scope.row.attr_id)">删除</el-button>
							</template>
						</el-table-column>
					</el-table>
				</el-tab-pane>
				<!-- 添加静态参数的面板 -->
			    <el-tab-pane label="静态属性" name="only">
					<!-- 添加属性按钮 -->
					<el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddAttrDialog">添加属性</el-button>
					<el-table :data="onlyTableData" stripe border>
						<!-- 展开行 -->
						<el-table-column type="expand">
							<template slot-scope="scope">
								<el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
								<el-input
								  class="input-new-tag"
								  v-if="scope.row.inputVisible"
								  v-model="scope.row.inputValue"
								  ref="saveTagInput"
								  size="small"
								  @keyup.enter.native="handleInputConfirm(scope.row)"
								  @blur="handleInputConfirm(scope.row)"
								>
								</el-input>
								<el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
							</template>
						</el-table-column>
						<!-- 索引列 -->
						<el-table-column label="#" type="index"></el-table-column>
						<el-table-column label="属性名称" prop="attr_name"></el-table-column>
						<el-table-column label="操作">
							<template slot-scope="scope">
								<el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
								<el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParmas(scope.row.attr_id)">删除</el-button>
							</template>
						</el-table-column>
					</el-table>
				</el-tab-pane>
			</el-tabs>
		</el-card>
		<!-- 添加属性对话框 -->
		<el-dialog
		  :title="'添加' + titleText"
		  :visible.sync="addAttrDialogVisible"
		  width="50%" @close="addAttrDialogClosed">
		  <el-form label-width="100px" :model="addForm" :rules="addFormRules" ref="addFormRef">
			<el-form-item :label="titleText" prop="attr_name">
			  <el-input v-model="addForm.attr_name"></el-input>
			</el-form-item>
		  </el-form>
		  <span slot="footer" class="dialog-footer">
		    <el-button @click="addAttrDialogVisible = false">取 消</el-button>
		    <el-button type="primary" @click="addAttr">确 定</el-button>
		  </span>
		</el-dialog>
		<!-- 修改属性对话框 -->
		<el-dialog
		  :title="'修改' + titleText"
		  :visible.sync="editDialogVisible"
		  width="50%" @close="editDialogClosed">
		  <el-form label-width="100px" :model="editForm" :rules="editFormRules" ref="editFormRef">
			<el-form-item :label="titleText" prop="attr_name">
			  <el-input v-model="editForm.attr_name"></el-input>
			</el-form-item>
		  </el-form>
		  <span slot="footer" class="dialog-footer">
		    <el-button @click="editDialogVisible = false">取 消</el-button>
		    <el-button type="primary" @click="editAttr">确 定</el-button>
		  </span>
		</el-dialog>
	</div>
</template>

<script>
export default{
	data(){
		return{
			// 获取分类列表
			cateList:[],
			// 级联选择框的配置对象
			cateProps:{
				expandTrigger: 'hover',
				value: 'cat_id',
				label: 'cat_name',
				children: 'children'
			},
			// 级联选择框双向绑定的值
			selectCateKeys:[],
			// 面板切换
			activeName: 'many',
			//动态参数
			manyTableData:[],
			//静态属性
			onlyTableData:[],
			addAttrDialogVisible: false,
			addForm:{
				attr_name:''
			},
			addFormRules:{
				attr_name:[
					{ required: true, message: "请输入参数名称", trigger: "blur" }
				]
			},
			editDialogVisible: false,
			editForm:{},
			editFormRules:{
				attr_name:[
					{ required: true, message: "请输入参数名称", trigger: "blur" }
				]
			},
			attr_id:''
		}
	},
	created(){
		this.getCateList()
	},
	methods:{
		async getCateList(){
			const { data: res } = await this.$http.get('categories')
			if(res.meta.status !== 200) return this.$message.error('获取分类列表失败')
			this.cateList = res.data
		},
		// 级联选择框选中的值发生变化会触发这个方法
		handleChange(){
			this.getParamsData()
		},
		//获取参数列表数据
		async getParamsData(){
			if(this.selectCateKeys.length !== 3){
				this.selectCateKeys = []
				this.manyTableData = []
				this.onlyTableData = []
				return
			}
			console.log(this.selectCateKeys)
			const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: this.activeName}})
			if(res.meta.status !== 200) return this.$message.error('获取参数列表失败')
			
			res.data.forEach( item => {
				item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [],
				item.inputVisible = false,
				item.inputValue = ''
			})
			console.log(res.data)
			// 判断获取到的是动态参数还是静态属性
			if(this.activeName === 'many'){
				this.manyTableData = res.data
			}else{
				this.onlyTableData = res.data
			}
			
		},
		// tab标签点击事件的处理函数
		handleTabClick(){
			this.getParamsData()
			console.log(this.activeName)
		},
		// 打开添加参数/添加属性对话框
		showAddAttrDialog(){
			this.addAttrDialogVisible = true
		},
		// 添加参数窗口关闭
		addAttrDialogClosed(){
			this.$refs.addFormRef.resetFields()
		},
		// 添加属性
		addAttr(){
			this.$refs.addFormRef.validate(async valid => {
				if(!valid) return
				const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
					attr_name: this.addForm.attr_name,
					attr_sel: this.activeName
				})
				if(res.meta.status !== 201) return this.$message.error('添加参数失败')
				this.$message.success('添加参数成功')
				this.getParamsData()
				this.addAttrDialogVisible = false
			})
		},
		// 打开编辑对话框
		async showEditDialog(attr_id){
			this.attr_id = attr_id
			const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`,
			{params: {attr_sel: this.activeName}})
			if(res.meta.status !== 200) return this.$message.error('获取参数信息失败')
			this.editForm = res.data
			this.editDialogVisible = true
		},
		// 编辑页面关闭
		editDialogClosed(){
			this.$refs.editFormRef.resetFields()
		},
		//提交编辑信息
		editAttr(){
			this.$refs.editFormRef.validate(async valid => {
				if(!valid) return
				const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.attr_id}`, {attr_name: this.editForm.attr_name, attr_sel: this.activeName})
				if(res.meta.status !== 200) return this.$message.error('修改参数信息失败')
				this.$message.success('修改参数信息成功')
				this.getParamsData()
				this.editDialogVisible = false
			})
		},
		// 删除参数信息
		async removeParmas(attr_id){
			const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).catch(err => err)
			if(confirmResult !== "confirm") return this.$message.info('已取消删除')
			const {data: res} =await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
			if(res.meta.status !== 200) return this.$message.error('删除参数失败')
			this.$message.success('删除参数成功')
			this.getParamsData()
		},
		handleInputConfirm(row){
			if(row.inputValue.trim().length === 0){
				row.inputValue = ''
				row.inputVisible = false
				return
			}
			row.attr_vals.push(row.inputValue.trim())
			row.inputValue = ''
			row.inputVisible = false
			this.saveAttrVals(row)
		},
		//保存修改后的参数项
		async saveAttrVals(row){
			const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
				attr_name: row.attr_name,
				attr_sel: row.attr_sel,
				attr_vals: row.attr_vals.join(' ')
			})
			if(res.meta.status !== 200) return this.$message.error('修改参数项失败')
			this.$message.success('修改参数项成功')
		},
		showInput(row){
			row.inputVisible = true,
			this.$nextTick( _ => {
			    this.$refs.saveTagInput.$refs.input.focus()
			})
		},
		handleClose(i, row){
			row.attr_vals.splice(i, 1)
			this.saveAttrVals(row)
		}
	},
	computed:{
		isBtnDisabled(){
			if(this.selectCateKeys.length !== 3){
				return true
			}
			return false
		},
		cateId(){
			if(this.selectCateKeys.length == 3){
				return this.selectCateKeys[2]
			}
			return null
		},
		// 判断是添加动态参数还是静态属性对话框
		titleText(){
			if(this.activeName === 'many'){
				return '动态参数'
			}
			return '静态属性'
		}
	}
};
</script>

<style lang="less" scoped>
	.el-card{
		box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15)!important;
	}
	.cat_opt{
		margin: 15px 0;
	}
	.el-table{
		margin: 15px 0;
	}
	.el-tag{
		margin: 10px;
	}
	.button-new-tag {
		margin-left: 10px;
		height: 32px;
		line-height: 30px;
		padding-top: 0;
		padding-bottom: 0;
	}
	.input-new-tag {
		width: 90px;
		margin-left: 10px;
		vertical-align: bottom;
	}
</style>
