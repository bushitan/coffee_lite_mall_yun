// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const Route = require("./js/route")
// var  Route = require('./js/route')

// 云函数入口函数
exports.main = async (event, context) => {
    // const wxContext = cloud.getWXContext()
    // const actionName  = event.action || "adminGetList"
    // const db = cloud.database() // 数据库对象
    // event.openid = wxContext.OPENID
    // event.appid = wxContext.APPID
    // event.unionid = wxContext.UNIONID || ""


    // route = new Route(db)
    // route.init() //route 初始化
    // const result = route.start(actionName,event)

    // return result

    
    const wxContext = cloud.getWXContext()
    const db = cloud.database() // 数据库对象
    event.openid = wxContext.OPENID
    event.appid = wxContext.APPID
    event.unionid = wxContext.UNIONID || ""


    route = new Route(db)

    // var result = route.test()

    
    if(event.isGetAdmin == 1   )
        return route.getAdminMap(event)


    // route.init() //route 初始化

    var result = route.start(event)

    return result



    // return {
    //     event,
    //     openid: wxContext.OPENID,
    //     appid: wxContext.APPID,
    //     unionid: wxContext.UNIONID,
    // }
}