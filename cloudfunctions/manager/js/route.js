

var  Admin = require("./model/admin")


class Route {

    constructor(db) { 
        this.admin =  new Admin(db)
    }  
    
    getAdminMap(){
         var map = {
            "admin": this.admin.getAdmin(), 
         }

         return this.pack({ data:map , msg :"获取Admin配置成功"})
    }

    /**
     * @method 在这里做切面OOP
     */
    async start(event) { 
            
        var model  = event.model || ""
        var action  = event.action || ""

        
        // 判断model
        if(this.hasOwnProperty(model) == false)
            return this.pack({  msg: '传入model[' + model + ']无模型',  code: -1,   })       
        
        // 判断model下的action
        if( typeof this[model].__proto__[action] === 'function' ? false : true )        
            return this.pack({  msg: '传入model[' + model + ']的action[' + action + ']无事件',  code: -1,   })       

        // 执行model下的action
        const data = await this[model][action](event) // 路由执行
        return this.pack(data) //打包返回信息

    } 

    /**
     * @method 打包返回参数
     */
    pack(obj){
        return {
            data:obj.data || {},
            msg: obj.msg || "",
            code: obj.code || 0, 
        }
    }



    // 单元测试
    async test(){
        console.log(await  this.admin.getCount())
    }
   
}

// var route = new Route()
module.exports = Route





















    // init(){
    //     this.url = {
    //         "adminGetList":(event) => this['admin']['getList'](event),
    //         // "adminGetList":(event) => this.admin.getList(event),
    //         // "adminGetDetail":(event) => this.admin.getNode(event),
    //     }
    // }

    // /**
    //  * @method 在这里做切面OOP
    //  */
    // async start(actionName, event) {
    //     //TODO 增加查询记录
    //     const url = this.url
    //     if(url.hasOwnProperty(actionName) == false)
    //         return this.pack({
    //             msg: '传入action错误',
    //             code: -1, 
    //         })        
    //     const data = await url[actionName](event) // 路由执行
    //     return this.pack(data) //打包返回信息

    // }
