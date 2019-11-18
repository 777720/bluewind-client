class Bill {
    constructor(opts) {
        this.shopAccount = opts['店铺账号'];
        this.orderTime = opts['下单时间'];
        this.orderNumber = opts['订单号'];
        this.sku = opts['SKU'];
        this.buyerName = opts['买家姓名'];
        this.buyerDesignLogistics = opts['买家指定物流'];
        this.orderRemarks =  opts['订单备注'];
        this.myRemarks =  opts['备注'];
        this.generateOrderList(opts['多品名'], opts['产品规格'])
    }

    generateOrderList(multiName, products)  {
        this.productSpecify = products.split(/\n/g);
        this.multiName = multiName.split(/\n/g);
    }
}

export default Bill;
