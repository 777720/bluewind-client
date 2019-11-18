<style lang="less">
    .pg-bill2pdf {
        .title-col {
            font-weight: 600;
        }

        .row {
            border-top: 1px solid black;
            display: flex;
            justify-content: flex-start;
            align-items: flex-start;

            .title {
                font-weight: 600;
                height: 100%;
                text-align: left;
                width: 120px;
            }

            .value {
                border-left: 1px solid black;
                padding-left: 4px;
                flex: 1;
                text-align: left;
                white-space: normal;
            }
        }

        .content {
            .content-item {
                margin-top: 52px;
                border: 1px solid black;
            }
        }

        .row-table {
            border: 1px solid;
            border-collapse: collapse;
            text-align: left;
            width: 100%;

            thead {
                border-bottom: 1px solid
            }

            tbody tr {
                border-bottom: 1px solid;

                &:last-child {
                    border-bottom: 0;
                }
            }
        }
    }
</style>
<template>
    <div class="pg-bill2pdf">
        <input type="file" ref="upload" accept=".xls,.xlsx" class="outputlist_upload">
        <button v-if="!loading" @click="dowwloadFn">导出PDF</button>
        <div class="content" v-if="!loading">
            <div ref="pdfPage" :style="{ width: '585px', margin: '0 50px' }">
                <div v-for="(k, i) in outputs" :key="i" :ref="`out-${i}`">
                    <div v-for="(item, index) in k" :key="index" class="content-item">
                        <p class="title-col">【{{ item.shopAccount }}】提货单-{{ index + 1 }}【{{ item.orderTime || '-'
                            }}】</p>
                        <div class="row">
                            <div class="title">订单号</div>
                            <div class="value">&nbsp;{{ item.orderNumber }}</div>
                        </div>
                        <div class="row">
                            <div class="title">SKU:</div>
                            <div class="value">&nbsp;{{ item.sku }}</div>
                        </div>
                        <div class="row" :style="{ padding: '6px' }">
                            <table class="row-table">
                                <thead class="thead-header">
                                <tr>
                                    <th>产品规格</th>
                                    <th>数量</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr v-for="(k,i) in item.productSpecify" :key="i">
                                    <th>{{ k }}</th>
                                    <th>{{ item.multiName[i] }}</th>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="row">
                            <div class="title">买家姓名:</div>
                            <div class="value">{{ item.buyerName }}</div>
                        </div>
                        <div class="row">
                            <div class="title">买家指定物流:</div>
                            <div class="value">{{ item.buyerDesignLogistics }}</div>
                        </div>
                        <div class="row">
                            <div class="title">订单备注:</div>
                            <div class="value">{{ item.orderRemarks|| '-' }}</div>
                        </div>
                        <div class="row" v-if="item.myRemarks">
                            <div class="title">备注:</div>
                            <div class="value">{{ item.myRemarks }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div>
            ===========打印时间{{ this.printDate }}============
        </div>
    </div>
</template>

<script>
    import XLSX from 'xlsx'
    import html2canvas from "html2canvas";
    import JsPDF from "jspdf";
    import dayjs from 'dayjs';
    import Bill from '../utils/model/bill'

    export default {
        name: 'HelloWorld',
        data() {
            return {
                outputs: [],
                loading: false,
            }
        },
        mounted() {
            document.title = '佩奇的提货单打印系统';
            this.$refs.upload.addEventListener('change', e => {
                this.readExcel(e);
            })
        },
        computed: {
            printDate() {
                return dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
            }
        },
        methods: {
            dowwloadFn() {
                if (this.outputs.length === 0) {
                    return;
                }
                setTimeout(() => {
                    this.sliceData()
                }, 200)
            },

            sliceData() {
                const that = this
                this.outputs.forEach((item, index) => {
                    const el = that.$refs[`out-${index}`];
                    html2canvas(el[0], {scale: 3}).then((canvas) => {
                        let contentWidth = canvas.width;
                        let contentHeight = canvas.height;
                        //一页pdf显示html页面生成的canvas高度;
                        let pageHeight = contentWidth / 592.28 * 841.89;
                        // 未生成pdf的html页面高度
                        let leftHeight = contentHeight;
                        // 页面偏移
                        let position = 0;
                        //a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
                        let imgWidth = 555;
                        let imgHeight = 555 / contentWidth * contentHeight;


                        let pageData = canvas.toDataURL('image/jpeg', 1.0);
                        let pdf = new JsPDF('', 'pt', 'a4');
                        pdf.addImage(pageData, 'JPEG', 10, 0, imgWidth, imgHeight);
                        pdf.save(`提货单-${index}.pdf`);
                    })
                })

            },
            chunk(arr, num) {
                num = num * 1 || 1;
                let ret = [];
                arr.forEach(function (item, i) {
                    if (i % num === 0) {
                        ret.push([]);
                    }
                    ret[ret.length - 1].push(item);
                });
                return ret;
            },
            readExcel(e) {
                let that = this;
                this.outputs = [];
                const files = e.target.files;
                if (files.length <= 0) {
                    return false;
                } else if (!/\.(xls|xlsx)$/.test(files[0].name.toLowerCase())) {
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
                        console.log('workbook', workbook);
                        const wsname = workbook.SheetNames[0];
                        const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname]);//生成json表格内容
                        let list = [];
                        ws.forEach((item, index) => {
                            list.push(new Bill(item))
                        });
                        const resetArr = this.chunk(list, 2)
                        that.outputs = resetArr;
                        this.loading = false;

                    } catch (e) {
                        console.error(e);
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

