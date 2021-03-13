

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


    /************查询公共条件*************/
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
    // 获取排序字段
    getSort(baseSort , foreignIdList){
        var sort = {}
        sort["isSelect"] = -1
        sort["sn"] = -1
        return  Object.assign(baseSort,sort)  
    }


    /************CURD公共函数*************/
    // model的CURD操作，给子类继承
    async getList(){}


    /**
        @method 更新list序号
         {
            "model":"admin", 
            "action": "updateSN",
            "snJson":{
                "79550af260435f87089d72cd7e4db0a2":"6",
                "79550af260435f89089d731043f82d71":"2",
                "79550af2604397df08a67e053d784295":"3",
                "b00064a7604397f008a8a76645f52fc7":"2"
            }
         }

         
            // console.log(event.snJson)
     */
    async updateSN(event){
        try {
            var  num = 0 
            var count = 0 
            var snJson = JSON.parse( event.snJson )
            const result = await this.db.runTransaction(async transaction => {
                for (var _id in snJson){
                    var temp = parseInt( snJson[_id] ) || 0
                    var res = await transaction.collection(this.name).doc(_id).update({  data: { sn : temp}  })
                    num = num + res.stats.updated
                    count++
                }
            })
            return { data:count ,msg:`对${count}条数据操作，更新：${num}条` }

        } catch (e) {
            console.error(`transaction error`, e)
            return { data:num ,msg:`更新失败` ,code:-1 }
            
        }
    }

    async getNode(){}
    async updateNode(){}
    async addNode(){}
    async getCount(match){
        var res = await this.db.collection(this.name).where(match).count() 
        return res.total
    }

     

}
module.exports = Base