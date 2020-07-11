<template>
	<div>
		<!-- 面包屑导航 -->
		<el-breadcrumb separator="/">
		  <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
		  <el-breadcrumb-item>商品管理</el-breadcrumb-item>
		  <el-breadcrumb-item>商品分类</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片区域 -->
		<el-card>
			<el-row>
				<el-col>
					<el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
				</el-col>
			</el-row>
		
			<!-- 表格 -->
			<tree-table :data="cateList" :columns="columns" :selection-type="false" show-index index-text="#" :expand-type="false" border :show-row-hover="false" class="treeTable">
				<!-- 是否有效列 -->
				<template slot="isok" slot-scope="scope">
					<i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:lightgreen;"></i>
					<i class="el-icon-error" v-else style="color:red;"></i>
				</template>
				<!-- 排序列 -->
				<template slot="order" slot-scope="scope">
					<el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
					<el-tag size="mini" v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
					<el-tag size="mini" v-else type="warning">三级</el-tag>
				</template>
				<!-- 操作列 -->
				<template slot="opt" slot-scope="scope">
					<el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
					<el-button size="mini" type="danger" icon="el-icon-delete" @click="showDelDialog(scope.row.cat_id)">删除</el-button>
				</template>
			</tree-table>
			
			<!-- 分页区域 -->
			<el-pagination
			  @size-change="handleSizeChange"
			  @current-change="handleCurrentChange"
			  :current-page="queryInfo.pagenum"
			  :page-sizes="[3, 5, 10, 15]"
			  :page-size="queryInfo.pagesize"
			  layout="total, sizes, prev, pager, next, jumper"
			  :total="total">
			</el-pagination>
			
			<!-- 添加分类对话框 -->
			<el-dialog
			  title="添加分类"
			  :visible.sync="addCateDialogVisible"
			  width="50%" @close="addCateDialogClosed">
			  <el-form label-width="80px" :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef">
					<el-form-item label="分类名称" prop="cat_name">
						<el-input v-model="addCateForm.cat_name"></el-input>
					</el-form-item>
					<el-form-item label="父级分类">
						<el-cascader expand-trigger="hover"
						    v-model="selectedKeys"
						    :options="parentCateList"
						    :props="cascaderProps"
						    @change="parentCateChanged"
							clearable change-on-select>
						</el-cascader>
					</el-form-item>
			  </el-form>
			  <span slot="footer" class="dialog-footer">
			    <el-button @click="addCateDialogVisible = false">取 消</el-button>
			    <el-button type="primary" @click="addCate()">确 定</el-button>
			  </span>
			</el-dialog>
		</el-card>
	</div>
</template>

<script>
export default {
	data(){
		return{
			queryInfo:{
				type: 3,
				pagenum: 1,
				pagesize: 5
			},
			cateList:[],
			total: 0,
			columns:[
			{
				label: '分类名称',
				prop: 'cat_name'
			},
			{
				label: '是否有效',
				//把该列定义为模板列
				type: 'template',
				// 模板列名称 用属性slot表示
				template: 'isok'
			},
			{
				label: '排序',
				type: 'template',
				template: 'order'
			},
			{
				label: '操作',
				type: 'template',
				template: 'opt'
			}
			],
			addCateDialogVisible: false,
			addCateForm: {
				//要添加的分类名称
				cat_name: '',
				//父级id
				cat_pid: 0,
				//层级
				cat_level: 0
			},
			addCateFormRules:{
				cat_name:[
					{ required: true, message: "请输入分类名称", trigger: "blur" }
				]
			},
			parentCateList:[],
			selectedKeys:[],
			cascaderProps:{
				expandTrigger: 'hover',
				value: 'cat_id',
				label: 'cat_name',
				children: 'children'
			}
		}
	},
	created(){
		this.getCateList()
	},
	methods:{
		async getCateList(){
			const {data: res} = await this.$http.get('categories', { params: this.queryInfo })
			if(res.meta.status !== 200) return this.$message.error('获取商品分类列表失败')
			
			this.cateList = res.data.result
			this.total = res.data.total
		},
		handleSizeChange(newSize){
			this.queryInfo.pagesize = newSize
			this.getCateList()
		},
		handleCurrentChange(newPage){
			this.queryInfo.pagenum = newPage
			this.getCateList()
		},
		// 弹出添加分类对话框
		showAddCateDialog(){
			this.getParentCateList()
			this.addCateDialogVisible = true
		},
		addCateDialogClosed(){
			this.$refs.addCateFormRef.resetFields()
			this.selectedKeys = []
			this.addCateForm.cat_pid = 0
			this.addCateForm.cat_level = 0
		},
		// 获得父级分类列表
		async getParentCateList(){
			const {data: res} = await this.$http.get('categories', {params: {type: 2}})
			if(res.meta.status !== 200) return this.$message.error('获取父级分类列表失败')
			this.parentCateList = res.data
		},
		parentCateChanged(){
			if(this.selectedKeys.length > 0){
				this.addCateForm.cat_level = this.selectedKeys.length
				this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
			}else{
				this.addCateForm.cat_level = 0
				this.addCateForm.cat_pid = 0
				return
			}
		},
		addCate(){
			this.$refs.addCateFormRef.validate(async valid => {
				if(!valid) return
				const {data: res} = await this.$http.post('categories', this.addCateForm)
				if(res.meta.status !== 201) return this.$message.error('添加分类失败')
				this.$message.success('添加分类成功')
				this.getCateList()
				this.addCateDialogVisible = false
			})
		},
		//删除分类
		async showDelDialog(id){
			const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).catch(err => err)
			if(confirmResult !== "confirm") return this.$message.info('已取消删除')
			const {data: res} = await this.$http.delete(`categories/${id}`)
			if(res.meta.status !== 200) return this.$message.error('删除分类失败')
			this.$message.success('删除分类成功')
			this.getCateList()
		}
	}
}
</script>

<style lang="less" scoped>
	.treeTable{
		margin-top: 15px;
	}
	.el-card {
		box-shadow: 1px 0 0 rgba(0, 0, 0, 0.15)!important;
	}
	.el-pagination{
		margin-top: 15px;
	}
	.el-cascader{
		width: 100%;
	}
</style>