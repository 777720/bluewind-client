<template>
  <div class="pg-bill2pdf">
      <input type="file" ref="upload" accept=".xls,.xlsx" class="outputlist_upload">
      <button v-if="!loading" @click="dowwloadFn">导出PDF</button>
      <div class="content" v-if="!loading">
          <div ref="pdfPage" :style="{ width: '595px' }">
              <div v-for="(item, index) in outputs" :key="index" class="content-item"  >
                    <p>{{ item['店铺账号'] }}----提货单-{{ index }}</p>
                    <div class="row">
                        <div class="title">产品名称:</div>
                        <div class="value">{{ item['产品名称'] }}</div>
                    </div>
                    <div class="row">
                        <div class="title">详细地址:</div>
                        <div class="value">&nbsp;{{ item['详细地址'] }}</div>
                    </div>
                    <div class="row">
                        <div class="title">产品数量:</div>
                        <div class="value">{{ item['产品数量'] }}</div>
                    </div>
                    <div class="row">
                        <div class="title">买家姓名:</div>
                        <div class="value">{{ item['买家姓名'] }}</div>
                    </div>
                    <div class="row">
                        <div class="title">下单时间:</div>
                        <div class="value">{{ item['下单时间'] }}</div>
                    </div>
                    <div class="row">
                        <div class="title">产品规格:</div>
                        <div class="value">{{ item['产品规格'] }}</div>
                    </div>
                    <div class="row" v-if="item['备注']" :style="{ height: '120px' }">
                        <div class="title">备注:</div>
                        <div class="value">{{ item['备注'] }}</div>
                    </div>
              </div>
          </div>
      </div>
      <div>
          =======================
      </div>
  </div>
</template>

<script>
import XLSX from 'xlsx'

export default {
  name: 'HelloWorld',
  data() {
      return {
          outputs: [],
          loading: false
      }
  },
  mounted() {
    this.$refs.upload.addEventListener('change', e => {
        this.readExcel(e);
    })
  },
  methods: {
      dowwloadFn() {
          if (this.outputs.length === 0) {
              return;
          }
          setTimeout(() => {
              this.$pdf(this.$refs.pdfPage, {}, '提货单集合', () => {
                  console.log('ok');
              });
          }, 200)
      },
      readExcel(e) {
        var that = this;
        const files = e.target.files;
        if(files.length<=0){
            return false;
        } else if(!/\.(xls|xlsx)$/.test(files[0].name.toLowerCase())){
            this.$Message.error('上传格式不正确，请上传xls或者xlsx格式');
            return false;
        }
 
        const fileReader = new FileReader();
        fileReader.onload = (ev) => {
        try {
            this.loading = true;
            const data = ev.target.result;
            const workbook = XLSX.read(data, {
            type: 'binary'
            });
            const wsname = workbook.SheetNames[0];
            const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname]);//生成json表格内容
            that.outputs = ws; 
            this.$refs.upload.value = '';
            this.loading = false;
 
        } catch (e) {
            return false;
            this.loading = false;
        }
        };
        fileReader.readAsBinaryString(files[0]);
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
    .pg-bill2pdf {
        .row {
            border-top: 1px solid black;
            display: flex;
            justify-content: flex-start;
            align-items: flex-start;
            .title {
                border-right: 1px solid black;
                height: 100%;
                text-align: left;
                width: 100px;
            }
            .value {
                padding-left: 4px;
                flex: 1;
                text-align: left;
                white-space: normal;
            }
        }
        .content {
            .content-item {
                margin-top: 12px;
                border: 1px solid black;
            }
        }
    }
</style>
