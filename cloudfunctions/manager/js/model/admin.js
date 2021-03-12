


var  Base = require("./base.js")
class Admin extends Base {
    constructor(db) {
        super(db)
    }
  
    name = "admin"

    admin(){
        return {
                    
            name:"管理员",
            displayName:"info-0-nickName",
            displayList: [ 
                { name: "头像", key: 'info', type: "arrayObjImage", objKey: "wxAvatarUrl", },
                { name: "昵称", key: 'info', type: "arrayObjText", objKey: "nickName", },
                { name: "权限", key: 'role', type: "arrayObjText", objKey: "name", },
            ], 
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
                {type:"radio" , name:"是否显示", key:"isShow" , group:[ { name:"全部",value:"" , } ,  { name:"显示",value:true , } ,  { name:"隐藏",value:false , } ,  ], }, // 数字查询

            ],

        }
    }
    model(){
        return {
            wxOpenId  :  "" , //  微信OPenId
            roleList : [],
        } 
    }


    // 获取列表
    async getList(event){
        const _ = this.db.command
        
        const $ = this.db.command.aggregate
        var res = await  this.db.collection('admin').aggregate() 
        .match({
            // wxOpenId:"oOY_U1KTeDL3W3PtecWdVp1QXi-A"
            wxOpenId:  _.exists(true)
             
        })
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
        // .project({

        // })
        .limit(20)
        .end() 

        console.log(res)
        
        return { data: res.list }
    }


    // 获取详情
    async getNode(event){
        var _id = event._id
        var res = await this.db.collection('admin').aggregate() 
        .match({
            _id:_id             
        })
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
        // .project({

        // })
        .limit(20)
        .end() 

        console.log(res)
        
        return { data: res.list[0] }
    }

    
    // 更新
    async updateNode(){}

    // 新增
    async addNode(){}
}
    
module.exports = Admin