

var db 
class Base {
    constructor(db) {
        this.db = db 
    }

    baseAdmin(){
        return {

        }
    }
    getAdmin(){ return Object.assign(this.baseAdmin() , this.admin() ) }


    // model = {} // 数据模型    
    baseModel(){
        return { // 基础数据模型
            name : "" , // 名称
            sn : 0 , // 序号
            createTime : this.db.serverDate() , //创建时间
            updateTime :  this.db.serverDate() , //更新时间
            isEnable : true , // 可使用
            isDeleted : false , // 已删除
        }
    }
    // 将父类的model合成返回
    getModel(){ return Object.assign(this.baseModel() , this.model() ) }

    // model的CURD操作，给子类继承
    async getList(){}
    async getNode(){}
    async updateNode(){}
    async addNode(){}
    async getCount(){
        var res = await this.db.collection(this.name).count() 
        return res.total
    }

     

}
module.exports = Base