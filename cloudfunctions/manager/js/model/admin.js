

var  Base = require("./base")
class Admin extends Base {
    constructor(db) {
        super(db)
        this.name = "admin"
    }

    // 模型
    model(){
        return {
            wxOpenId  :  "" , //  微信OPenId
            roleList : [],
        } 
    }
    // 管理端展示配置 
    admin(){
        return {
                    
            name:"管理员",
            displayName:"info-0-nickName",
            displayList: [ 
                { name: "ID", key: '_id', type: "text", },
                { name: "头像", key: 'info', type: "arrayObjImage", objKey: "wxAvatarUrl", },
                { name: "昵称", key: 'info', type: "arrayObjText", objKey: "nickName", },
                { name: "权限", key: 'role', type: "arrayObjText", objKey: "name", },
            ], 
            pageLimit:5, // 列表长度
            // 详情页配置字段
            fieldsets: [
                {
                    name: "基础",
                    fields: [ 
                        { name: "1、文本", key: 'info-0-nickName', type: "text", formName: "nickName" },  //从node的 ['infor'][0]['nickName'] 中取值
                        { name: "2、图片", key: 'info-0-wxAvatarUrl', type: "image" },
                        { name: "3、数字", key: 'sn', type: "number", formName: "sn" },
                        { name: "4、Boolean", key: 'isDelete', type: "boolean" },

                    ]
                },
                {
                    name: "列表",
                    fields: [    
                        { name: "4、图片列表", key: 'logoList', type: "arrayImage", formName: "sn" },
                        { name: "5、文字列表", key: 'markerList', type: "arrayText",  },
                    
                    ]
                },
                {
                    name: "外键",
                    fields: [ 
                        { name: "6、外键-父亲", key: 'fatherInfo-0-nickName', type: "foreign", foreignKey: "father", model: "admin", },
                        { name: "7、多对多-儿子们", key: 'sonListInfo', type: "arrayForeign", foreignListKey: "sonList", foreignItemKey: "nickName", model: "admin", },
                    ]
                },
                {
                    name: "商品SKU",
                    fields: [
                        { name: "8、属性编辑", key: 'attrs', type: "sku", }, 
                    ]
                },
            ],

            search:[
                {type:"text" , name:"ID" , key:"_id" }, // 文本查询
                {type:"number"  , name:"数字-排序" , key:"sn" }, // 数字查询
                {type:"radio" , name:"是否显示", key:"isShow" , 
                    group:[ { name:"全部",value:"" , } ,  { name:"显示",value:true , } ,  { name:"隐藏",value:false , } ,  ], 
                }, // 多选查询
                {type: "foreign", name: "外键-父亲", model: "admin", }, //外键查询
                   
            ],

        }
    }


    /**
     *  获取列表
     * 需要3个操作
     * 1、 获取普通列表， 部分需要去除wxOpenId为空的参数   _.exists(true)
     * 2、 获取搜索筛选后的列表， 指定 _.in([])
     * 3、 获取外键，指定 _.nin([]) 
    列表请求参数
    {
        "model":"admin", 
        "action": "getList",
        "pageIndex":0,
        "pageLimit":5,
        
        "search":{
            "isDelete":true,
            "father": ["28ee4e3e603f309f089c1609293881bc"]
        },
        "foreignIdList" : ["79550af260435f87089d72cd7e4db0a2"],
        "sort":{ 
            "isSelect":-1,
            "sn" : -1 
        }
 
    }
    */
    async getList(event){

        // 过滤基础数据
        var index = event.pageIndex || 0
        var skip = event.pageIndex * event.pageLimit
        var limit = event.pageLimit
        var foreignIdList = event.foreignIdList.length > 0 ? event.foreignIdList.reverse() : []
        var search = event.search || {}     
        var baseSort = event.sort || {} // 前端传上来的排序

        //配置查询条件
        var base = {
            wxOpenId: this._.exists(true),
        }
        var match = this.getMatch(base,search  )

        // 若是外键，增加查询参数，并放到最上层
        var addFields = this.getAddFields(foreignIdList)  
        var sort = this.getSort(baseSort,foreignIdList)

        var res = await this.queryNodeList(match,addFields,sort,skip,limit)

        console.log(res)

        var count = await this.getCount(match)
        
        return { data: {
            list:res.list,
            pageCount: Math.ceil( count / limit)
        } }
    }

    // list 和 node  共用的查询函数
    async queryNodeList(match,addFields,sort,skip,limit){
        //开始查询
        var res = await  this.db.collection(this.name ).aggregate() 
        .match(match)
        .lookup({
            from:"wxMemberInfo",
            localField: 'wxOpenId',
            foreignField: 'wxOpenId',
            as:"info"
        })        
        .lookup({
            from:"role",
            localField: 'roleList',
            foreignField: '_id',
            as:"role"
        })
        .lookup({
            from:"wxMemberInfo",
            localField: 'father',
            foreignField: '_id',
            as:"fatherInfo"
        })
        
        .lookup({
            from:"wxMemberInfo",
            localField: 'sonList',
            foreignField: '_id',
            as:"sonListInfo"
        })
        .addFields(addFields)
        .sort(sort)
        .skip( skip )
        .limit(limit)
        .end()    
        return res
    }
 

    /**
     * @method  获取详情
      {
        "model":"admin", 
        "action": "getNode",
        "_id":"79550af260435f87089d72cd7e4db0a2"
       
        }

     */
    async getNode(event){
        var _id = event._id

        var match = { _id:_id }
        var addFields =  this.getAddFields([])
        var sort = this.getSort({},[])
        var skip = 0
        var limit = 1
        var res = await this.queryNodeList(match,addFields,sort,skip,limit)
        
        console.log(res)
        
        return { data: res.list[0] }
    }


    /**
    @method 新增节点
        {
            "model":"admin", 
            "action": "addNode",
        }
    */
    async addNode(event){
        var model = this.getModel()

        var res =  await this.db.collection(this.name ).add({
            data:model
        })

        console.log(res)
        return  { data: res._id , msg:'添加节点成功' }
    }
    
    /**
     * @method 更新列表
     * 
     * 更新node的fieldsets各项数值 
     */
    async updateNode(event){

        //TODO 按照条件,更新内容
        return { data:event , msg:'更新列表成功' }
    }
 

}
     
module.exports = Admin





// .match({
//     wxOpenId:_.in( event.data.foreignIdList)
// })
// 拼装查询字段
// var foreignIdList = ["79550af2604397df08a67e053d784295","79550af260435f87089d72cd7e4db0a2"]
// var foreignIdList = ["79550af260435f87089d72cd7e4db0a2","79550af2604397df08a67e053d784295"].reverse()
// 拼装搜索字段

// var search = event.search || {}
// var search =   { 
//     "isDelete":true,
//     "fahter": ["28ee4e3e603f309f089c1609293881bc"]
// }

    // wxOpenId:_.nin([undefined,"oOY_U1KTeDL3W3PtecWdVp1QXi-A"]),
    // wxOpenId:_.in([undefined,"oOY_U1KTeDL3W3PtecWdVp1QXi-A"]),
    // roleList: _.in(["b00064a760439be708a91adf2606a5cc"])
    // father: _.in(["28ee4e3e603f309f089c1609293881bc"])