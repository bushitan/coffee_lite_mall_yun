

var db 
class Base {
    constructor(db) {
        this.db = db 
        
        this._ = db.command
        
        this.$ = db.command.aggregate
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


    /************查询的条件拼接,可子类重写*************/
    // 获取查询字段
    getMatch(base,data){
        data = data || {}
        for (var key in data){
            if ( data[key]  instanceof Array ) data[key] = this._.in(data[key])
            if ( data[key] == "true")  data[key] = true               
            if ( data[key] == "false")  data[key] = false
        }
        return  Object.assign(base,data)  
    }

    // 获取增加的字段，判断是否选择
    getAddFields(foreignIdList){ 
        var isSelectObj = {}
        isSelectObj["isSelect"] = this.$.indexOfArray([foreignIdList,'$_id']) 
        return isSelectObj
    }
    getSort(baseSort , foreignIdList){
        var sort = {}
        sort["isSelect"] = -1
        return  Object.assign(baseSort,sort)  
    }


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