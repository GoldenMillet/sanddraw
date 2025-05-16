<template>
    <div>
        <el-container>
            
            <!-- 主要部分 -->
            <el-main>
                <div class="title"><b>基于深度学习的图像转沙画系统 Alpha-Build-2</b></div>

                <el-row class="biggest_frame" :gutter="20">

                    <!-- 请上传原始图片 -->
                    <el-col :span="12"><div class="grid_content">
                        <div class="sub_title">第一步 请上传原始图片</div>
                        <div style="color: #4D4D4D">※请注意，图片上传最好是11:9格式的，否则会被作形变处理</div>

                        <!-- 上传图片组件 -->
                        <el-upload
                            class = "upload"
                            action="http://127.0.0.1:8000/submit/"
                            list-type="picture-card"
                            multiple = false
                            limit = 1
                            accept = ".jpg, .png"
                            :file-list="fileList"

                            :on-success="submit_success"
                            :on-error="submit_failed"
                            :on-exceed="submit_exceed"
                            :auto-upload="true">

                            <i slot="default" class="el-icon-plus"></i>
                            <div slot="file" slot-scope="{file}">
                                <img
                                    class="el-upload-list__item-thumbnail"
                                    :src="file.url" alt=""
                                >
                                <span class="el-upload-list__item-actions">

                                    <!-- 预览大图 -->
                                    <span
                                    class="el-upload-list__item-preview"
                                    @click="handlePictureCardPreview(file)"
                                    >
                                        <i class="el-icon-zoom-in"></i>
                                    </span>

                                    <!-- 删除图片 -->
                                    <span
                                    v-if="!disabled"
                                    class="el-upload-list__item-delete"
                                    @click="handleRemove(file)"
                                    >
                                        <i class="el-icon-delete"></i>
                                    </span>
                                </span>
                            </div>
                        </el-upload>
                        <el-dialog :visible.sync="dialogVisible">
                            <img width="100%" :src="dialogImageUrl" alt="">
                        </el-dialog>
                        <el-divider></el-divider>

                        <!-- 训练设置 -->
                        <div class="sub_title">第二步 请决定训练的设置：</div>
                        <div style="color: #4D4D4D">※迭代次数越大、粗糙度越低，生成的图片越清晰，但过于清晰的图片会影响沙画的视觉性</div>

                        <el-row class="train_settings1" :gutter="20">
                            <el-col :span="8"><div class="settings_split">                                
                                <div style="line-height: 40px;">选择迭代的次数：</div>
                            </div></el-col>
                            <el-col :span="8"><div class="settings_split">
                                <el-input-number v-model="settings.train_step" :step="5" :min="1"></el-input-number>
                            </div></el-col>
                            <el-col :span="8"><div class="settings_split">
                                <el-button
                                    type="warning"
                                    plain
                                    @click = "start_train"
                                    v-loading.fullscreen.lock="fullscreenLoading"

                                    :disabled = "!isConnected || !isSubmit"
                                    :loading="isTrainning"
                                >开始训练</el-button>
                            </div></el-col>
                        </el-row>
                        <el-row class="train_settings2" :gutter="20">
                            <el-col :span="8"><div class="settings_split">                                
                                <div style="line-height: 40px;">选择沙砾粗糙度：</div>
                            </div></el-col>
                            <el-col :span="16"><div class="settings_split">
                                <el-slider
                                    v-model="settings.styleWeight"
                                    :min = "3"
                                    :max = "5"
                                    :step = 0.01
                                    :format-tooltip = "formatTooltip"
                                ></el-slider>
                            </div></el-col>
                        </el-row>
                        
                        <!-- 训练进度条 -->
                        <el-progress :text-inside="true" :stroke-width="24" :percentage="train_pricess" status="warning" :stroke-linecap="square" :show-text = "false"></el-progress>
                    </div></el-col>

                    <!-- 请等待图片转换 -->
                    <el-col :span="12"><div class="grid_content">
                        <div class="sub_title">第三步 请等待图片转换</div>
                        <div style="color: #4D4D4D;">※请耐心等待图片胜场完毕</div>
                        <el-image :src="output_src" class="output">
                            <div slot="placeholder" class="image-slot">
                                加载中<span class="dot">...</span>
                            </div>
                            <div slot="error" class="image-slot">
                                <i class="el-icon-picture-outline"></i>
                            </div>
                        </el-image>
                    </div></el-col>
                </el-row>
            </el-main>

            <!-- 脚注 -->
            <el-footer>============== 20080216 黄嘉祺 毕业设计@沙画转换器 ==============</el-footer>
        </el-container>
    </div>
</template>

<script>
import axios from 'axios';

    export default {
        data() {
            return {
                dialogImageUrl: '',
                dialogVisible: false,
                disabled: false,
                fileList: [],
                fullscreenLoading: false,
                
                // 输出图片的地址
                // output_src: 'D://Documenttttttttttttt/projects/PycharmProjects/sandtrans/testImg/output.jpg',
                output_src: 'http://ys-d.ysepan.com/622374755/120322269/mogVyss3G6J4T5J5JMM7V2f/[%E9%A2%84%E8%A7%88]1.jpg',
                isConnected : false,
                isSubmit: false,

                // 训练次数与风格比重
                settings:{
                    train_step: 50,
                    styleWeight: 4,
                },

                // 训练进度
                train_pricess: 0,
                isTrainning: false,
            };
        },
        mounted() {
            this.testLink();
        },
        methods: {
            handleRemove(file) {
                this.fileList = [];
                this.isSubmit = false;
                this.train_pricess = 0;
                console.log(file);
            },
            handlePictureCardPreview(file) {
                this.dialogImageUrl = file.url;
                this.dialogVisible = true;
            },

            // 沙砾权重，把1e3~1e5映射为1~100
            formatTooltip(val){
                let ret = Math.floor((val - 3) * 49.5 + 1)
                return ret;
            },

            //  打开网页时触发，测试链接
            testLink:function(){
                let that = this;

                //  通知栏
                axios.get("http://127.0.0.1:8000/test/")
                .then(function(res){
                    console.log(res);
                    that.isConnected = true;
                    if(res.data == "False"){
                        that.isTrainning = false;
                    } else {
                        that.isTrainning = true;
                    }

                    that.$message({
                        message: '网络连接正常，可以开始训练',
                        type: 'success'
                    });
                })
                .catch(function(err){
                    console.log(err);
                    that.isConnected = false;
                       
                    that.$message({
                        message: '网络错误！请检查网络设置！',
                        type: 'error'
                    });
                });
            },

            submit_success:function(){
                this.isSubmit = true;
                this.$message({
                    message: '图片上传成功',
                    type: 'success'
                });
            },
            submit_failed:function(){
                this.isSubmit = false;
                this.$message({
                    message: '图片上传失败，请重试！',
                    type: 'error'
                });
            },
            submit_exceed:function(){
                this.$message({
                    message: '一次只能上传一张图片！',
                    type: 'warn'
                });
            },

            // 点击按钮开始训练
            start_train:function(){
                let that = this;
                that.testLink();

                //  训练开始
                if (this.isConnected == true){
                    this.isTrainning = true;
                    this.train_pricess = 0;
                    this.fullscreenLoading = true;
                    this.train_pricess = 66;

                    axios.post("http://127.0.0.1:8000/start/", this.settings)
                    .then(function(res){
                        console.log(res);
                        that.output_src = res.data
                        alert("训练完毕！！");

                        that.train_pricess = 100;
                        that.isTrainning = false;
                    })
                    .catch(function(err){
                        console.log(err);
                        
                        that.isTrainning = false;
                    });

                    this.fullscreenLoading = false;
                } else {
                    this.train_pricess = 66
                    this.$message({
                        message: '请检查网络！',
                        type: 'error'
                    });
                }
            },
        }
    }
</script>

<style>
    .el-container {
        min-height: 100vh;
    }

    .el-main {
        color: #333;
        text-align: center;
    }

    .el-footer {
        background-color: #F2F2F2;

        color: #4D4D4D;
        text-align: center;
        line-height: 60px;
        font-size: 14px;
    }

    .title {
        padding-top: 30px;
        padding-bottom: 35px;

        font-size: 40px;
    }

    /* 分栏布局，两栏 */
    .biggest_frame {
        margin-bottom: 20px;
        margin-top: 20px;
        padding-left: 100px;
        padding-right: 100px;

        &:last-child {
            margin-bottom: 0;
        }
    }
    .grid_content {
        border-radius: 4px;        
        background: #ffedc6;
    }

    .sub_title {
        padding-top: 10px;
        padding-bottom: 0px;

        font-size: 20px;
    }
    .upload {
        padding-top: 30px;
        padding-bottom: 30px;

        width:100%;
    }
    .output{
        padding-top: 30px;
    }

    .train_settings1{
        padding-top: 30px;
        padding-left: 10%;
        padding-right: 10%;
        padding-bottom: 30px;
    }
    .train_settings2{
        padding-left: 10%;
        padding-right: 10%;
        padding-bottom: 30px;
    }
    .settings_split {
        min-height: 36px;
    }
</style>