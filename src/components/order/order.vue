<template>
  <div>
	<!-- 面包屑导航 -->
	<el-breadcrumb separator="/">
	  <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
	  <el-breadcrumb-item>订单管理</el-breadcrumb-item>
	  <el-breadcrumb-item>订单列表</el-breadcrumb-item>
	</el-breadcrumb>
	<!-- 卡片区域 -->
	<el-card>
	  <el-row>
	    <el-col :span="8">
		  <el-input placeholder="请输入内容">
			<el-button slot="append" icon="el-icon-search"></el-button>
		  </el-input>
	    </el-col>
	  </el-row>
	  <el-table :data="ordersList" stripe border>
		<el-table-column type="index" label="#"></el-table-column>
		<el-table-column prop="order_number" label="订单编号"></el-table-column>
		<el-table-column prop="order_price" label="订单价格"></el-table-column>
		<el-table-column prop="order_pay" label="是否付款">
		  <el-tag type="success" v-if="ordersList.order_pay === '1'">已付款</el-tag>
		  <el-tag type="danger" v-else>未付款</el-tag>
		</el-table-column>
		<el-table-column prop="is_send" label="是否发货"></el-table-column>
		<el-table-column prop="create_time" label="下单时间">
		  <template slot-scope="scope">
			{{scope.row.create_time|dateFormat}}
		  </template>
		</el-table-column>
		<el-table-column label="操作">
		  <template>
			<el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditAttrBox"></el-button>
			<el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
		  </template>
		</el-table-column>
	  </el-table>
	  <!-- 分页功能 -->
	  <el-pagination
	    @size-change="handleSizeChange"
	    @current-change="handleCurrentChange"
	    :current-page="queryInfo.pagenum"
	    :page-sizes="[5, 10, 15]"
	    :page-size="queryInfo.pagesize"
	    layout="total, sizes, prev, pager, next, jumper"
	    :total="total">
	  </el-pagination>
	  <!-- 修改地址对话框 -->
	  <el-dialog
	    title="修改地址"
	    :visible.sync="editDialogVisible"
		@close="editDialogClosed">
	    <el-form label-width="100px" :model="editForm" :rules="editFormRules" ref="editFormRef">
	  	  <el-form-item label="省市区/县" prop="address1">
		    <el-cascader
		  	v-model="editForm.address1"
		  	:options="cityData"
		  	clearable>
		    </el-cascader>
	  	  </el-form-item>
		  <el-form-item label="详细地址" prop="address2">
		    <el-input v-model="editForm.address2"></el-input>
	      </el-form-item>
	    </el-form>
	    <span slot="footer" class="dialog-footer">
	      <el-button @click="editDialogVisible = false">取 消</el-button>
	      <el-button type="primary" @click="editDialogVisible = false">确 定</el-button>
	    </span>
	  </el-dialog>
	  <!-- 查看物流进度 -->
	  <el-dialog title="物流进度" :visible.sync="progressBoxVisible">
		<el-timeline :reverse="reverse">
		  <el-timeline-item
		    v-for="(activity, index) in progressInfo"
		    :key="index"
		    :timestamp="activity.time">
		    {{activity.context}}
		  </el-timeline-item>
		</el-timeline>
	  </el-dialog>
	</el-card>
  </div>
</template>

<script>
import cityData from './citydata.js'

export default{
  data(){
	return{
	  queryInfo:{
		  query: '',
		  pagenum: 1,
		  pagesize: 5
	  },
	  ordersList:[],
	  total: 0,
	  editDialogVisible: false,
	  //修改地址表单
	  editForm:{
		address1: [],
		address2: ''
	  },
	  editFormRules:{
		address1:[
		  { required: true, message:'请选择省市区县', trigger:'blur' }
		],
		address2:[
		  { required: true, message:'请填写详细地址', trigger:'blur' }
		]
	  },
	  cityData,
	  progressBoxVisible: false,
	  progressInfo: [],
	  reverse: true
	}
  },
  created(){
	this.getOrdersList()
  },
  methods:{
	async getOrdersList(){
	  const { data: res } = await this.$http.get('orders',{params: this.queryInfo})
	  if(res.meta.status !== 200) return this.$message.error('获取订单列表失败')
	  this.ordersList = res.data.goods
	  this.total = res.data.total
	},
	handleSizeChange(newSize){
	  this.queryInfo.pagesize = newSize
	  this.getOrdersList()
	},
	handleCurrentChange(newPage){
	  this.queryInfo.pagenum = newPage
	  this.getOrdersList()
	},
	// 显示修改地址对话框
	showEditAttrBox(){
	  this.editDialogVisible = true
	},
	editDialogClosed(){
	  this.$refs.editFormRef.resetFields()
	},
	//显示物流信息
	async showProgressBox(){
	  const { data: res } = await this.$http.get('/kuaidi/1106975712662')
	  if(res.meta.status !== 200) return this.$message.error('获取物流信息失败')
	  this.progressInfo = res.data
	  this.progressBoxVisible = true
	  console.log(this.progressInfo)
	}
  }
}
</script>

<style lang="less" scoped>
@import '../../plugins/timeline-item/timeline-item.css';
@import '../../plugins/timeline/timeline.css';

  .el-card{
  	box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15)!important;
  }
  .el-table{
	margin-top: 15px;
	font-size: 13px;
  }
  .el-pagination{
	margin-top: 15px;
  }
  .el-cascader{
	width: 100%;
  }
</style>
