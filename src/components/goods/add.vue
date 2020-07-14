<template>
  <div>
	<!-- 面包屑导航 -->
	<el-breadcrumb separator="/">
	  <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
	  <el-breadcrumb-item>商品管理</el-breadcrumb-item>
	  <el-breadcrumb-item>添加商品</el-breadcrumb-item>
	</el-breadcrumb>
	<el-card>
	  <!-- 警告区域 -->
	  <el-alert title="添加商品信息" type="info" center show-icon :closable="false">
	  </el-alert>
	  <!-- 步骤条 -->
	  <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
	    <el-step title="基本信息"></el-step>
	    <el-step title="商品参数"></el-step>
	    <el-step title="商品属性"></el-step>
	    <el-step title="商品图片"></el-step>
	    <el-step title="商品内容"></el-step>
	    <el-step title="完成"></el-step>
	  </el-steps>
	  <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
	    <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClick">
	      <el-tab-pane label="基本信息" name="0">
		    <el-form-item label="商品名称" prop="goods_name">
			  <el-input v-model="addForm.goods_name"></el-input>
			</el-form-item>
			<el-form-item label="商品价格" prop="goods_price">
			  <el-input v-model="addForm.goods_price" type="number"></el-input>
			</el-form-item>
			<el-form-item label="商品重量" prop="goods_weight">
			  <el-input v-model="addForm.goods_weight" type="number"></el-input>
			</el-form-item>
			<el-form-item label="商品数量" prop="goods_number">
			  <el-input v-model="addForm.goods_number" type="number"></el-input>
			</el-form-item>
			<el-form-item label="商品分类" prop="goods_cat">
			  <el-cascader
				v-model="addForm.goods_cat"
				:options="cateList"
				:props="cascalerProps"
				@change="handleChange"
				clearable>
			  </el-cascader>
			</el-form-item>
		  </el-tab-pane>
	      <el-tab-pane label="商品参数" name="1">
			<el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
			  <el-checkbox-group v-model="item.attr_vals">
			    <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
			  </el-checkbox-group>
			</el-form-item>
		  </el-tab-pane>
	      <el-tab-pane label="商品属性" name="2">
			<el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
			  <el-input v-model="item.attr_vals"></el-input>
			</el-form-item>
		  </el-tab-pane>
	      <el-tab-pane label="商品图片" name="3">
			<el-upload
			  :action="uploadURL"
			  :on-preview="handlePreview"
			  :on-remove="handleRemove"
			  list-type="picture"
			  :headers="headerObj"
			  :on-success="handleSuccess">
			  <el-button size="small" type="primary">点击上传</el-button>
			</el-upload>
		  </el-tab-pane>
	      <el-tab-pane label="商品内容" name="4">
			  <!-- 富文本编辑器 -->
			<quill-editor v-model="addForm.goods_introduce">
			</quill-editor>
			<!-- 添加商品按钮 -->
			<el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
		  </el-tab-pane>
	    </el-tabs>
	  </el-form>
	</el-card>
	<el-dialog
	  title="图片预览"
	  :visible.sync="previewDialogVisible"
	  width="50%" @close="previewDialogClosed">
	  <img :src="previewPath" alt="" class="previewImg">
	</el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default{
  data(){
	return{
	  activeIndex: '0',
	  addForm:{
		goods_name: '',
		goods_cat: [],
		goods_price: 0,
		goods_number: 0,
		goods_weight: 0,
		goods_introduce:'',
		pics: [],
		attrs: []
	  },
	  addFormRules:{
		goods_name:[
			{ required: true, message:'请输入商品名称', trigger:'blur' }
		],
		goods_price:[
			{ required: true, message:'请输入商品价格', trigger:'blur' }
		],
		goods_weight:[
			{ required: true, message:'请输入商品重量', trigger:'blur' }
		],
		goods_number:[
			{ required: true, message:'请输入商品数量', trigger:'blur' }
		],
		goods_cat:[
			{ required: true, message:'请选择商品分类', trigger:'blur' }
		]
	  },
	  //分类列表
	  cateList: [],
	  //级联选择器设置props
	  cascalerProps:{
		expandTrigger: 'hover',
		value: 'cat_id',
		label: 'cat_name',
		children: 'children'
	  },
	  // 动态参数列表
	  manyTableData:[],
	  //静态属性列表
	  onlyTableData:[],
	  // 图片上传的路径
	  uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
	  headerObj:{
		Authorization: window.sessionStorage.getItem('token')
	  },
	  previewPath: '',
	  previewDialogVisible: false
	}
  },
  created(){
	this.getCateList()
  },
  methods:{
	async getCateList(){
	  const { data: res } = await this.$http.get('categories')
	  if(res.meta.status !== 200) return this.$message.error('获取分类列表失败！')
	  this.cateList = res.data
	},
	handleChange(){
	  console.log(this.addForm.goods_cat)
	  if(this.addForm.goods_cat.length !== 3){
		this.addForm.goods_cat = []
	  }
	},
	//跳转标签页前要确保已选择商品分类
	beforeTabLeave(activeName, oldActiveName){
	  if(oldActiveName === '0' && this.addForm.goods_cat.length !== 3){
		this.$message.error('请先选择商品分类')
		return false
	  }
	},
	//页面跳转触发的事件
	async tabClick(){
	  if(this.activeIndex === '1'){
		const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params: {sel: 'many'}})
		if(res.meta.status !== 200) return this.$message.error('获取动态参数列表失败')
		
		res.data.forEach(item => {
			item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
		})
		this.manyTableData = res.data
		console.log(this.manyTableData)
		
	  }else if(this.activeIndex === '2'){
		const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params: {sel: 'only'}})
		if(res.meta.status !== 200) return this.$message.error('获取静态属性列表失败')
		this.onlyTableData = res.data
		console.log(this.onlyTableData)
	  }
	},
	//查看图片
	handlePreview(file){
	  this.previewPath = file.response.data.url
	  this.previewDialogVisible = true
	},
	previewDialogClosed(){
	  this.previewPath = ''
	},
	//删除图片
	handleRemove(file){
	  const filePath = file.response.data.tmp_path
	  const i = this.addForm.pics.findIndex(x =>
	  x.pic === filePath)
	  this.addForm.pics.splice(i, 1)
	},
	// 监听图片上传成功的事件
	handleSuccess(response){
	  //拼接得到一个图片信息对象
	  const picInfo = {pic: response.data.tmp_path}
	  this.addForm.pics.push(picInfo)
	},
	add(){
	  this.$refs.addFormRef.validate(async valid => {
		if(!valid){return this.$message.error('请填写必要的表单项')}
		//执行添加的业务逻辑
		const form = _.cloneDeep(this.addForm)
		form.goods_cat = form.goods_cat.join(',')
		//处理动态参数
		this.manyTableData.forEach(item => {
		  const newInfo = { 
			attr_id: item.attr_id,
		    attr_value: item.attr_vals.join(' ')
		  }
		  this.addForm.attrs.push(newInfo)
		})
		//处理静态属性
		this.onlyTableData.forEach(item => {
		  const newInfo = { 
			attr_id: item.attr_id,
		    attr_value: item.attr_vals
		  }
		  this.addForm.attrs.push(newInfo)
		})
		// 将addForm上的attrs属性赋值给form
		form.attrs = this.addForm.attrs
		console.log(form)
		const { data: res } = await this.$http.post('goods', form)
		if(res.meta.status !== 201){ return this.$message.error('添加商品失败')}
		this.$message.success('添加商品成功')
		this.$router.push('/goods')
	  })
	}
  },
  computed:{
	cateId(){
	  if(this.addForm.goods_cat.length === 3){
		return this.addForm.goods_cat[2]
	  }
	  return null
	}
  }
};
</script>

<style lang="less" scoped>
  .el-card{
  	box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15)!important;
  }
  .el-step{
	margin: 15px 0;
  }
  .el-checkbox{
	margin: 0 10px 0 0;
  }
  .previewImg{
	  width: 100%;
  }
  .btnAdd{
	  margin-top: 15px;
  }
</style>
