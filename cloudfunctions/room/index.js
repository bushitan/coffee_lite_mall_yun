// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

/**
 * @method 获取店铺员工列表
 *  * @event 
 *      _id:"1acf1de95e391ac20a211b3a12713cb2" , 员工ID
 * @return 
 *      {}
 */
var openID

var STATUS_PREPARE = 10
var STATUS_PROCESSING = 20
var STATUS_COMPLETE = 30
exports.main = async (event, context) => {

    const wxContext = cloud.getWXContext()
    openID = wxContext.OPENID
    console.log(event)
    switch (event.action) {
        case 'get_list': {
            return getList(event)
        }
        case 'get_list_by_status': {
            return getListByStatus(event)
        }
        case 'get_detail': {
            return getDetail(event)
        }
        case 'add': {
            return add(event)
        }
        case 'add_user_info': {
            return addUserInfo(event)
        }
        case 'check_user_power': {
            return checkUserPower(event)
        }
            
        // case 'getOpenData': {
        //     // return getOpenData(event)
        // }
        default: {
            return { msg: "未传入action", code: 1 }
        }
    }


}
// 获取直播间列表
async function getList(event) {
    var data = {}, msg = "", code = 0
    const db = cloud.database()
    const r = await db.collection('room').where({
        isShow: true,
    }).orderBy('sn', 'desc').get()

    // msg = "报名成功"
    data = r.data

    return { data: data, msg: msg, code: code }
}

// 根据属性获取直播间
async function getListByStatus(event) {
    var data = {}, msg = "", code = 0
    const db = cloud.database()
    var status = event.status
    const r = await db.collection('room').where({
        isShow: true,
        status: status,
    }).orderBy('sn', 'desc').get()

    // msg = "报名成功"
    data = r.data

    return { data: data, msg: msg, code: code }
}

// 获取直播间详情
async function getDetail(event) {
    var data = {}, msg = "", code = 0
    const db = cloud.database()
    const r = await db.collection('room').where({
        _id: event._id,
    }).get()

    // msg = "报名成功"
    data = r.data[0]

    return { data: data, msg: msg, code: code }
}



// // 获取直播间详情
// async function isExists(event) {
//     var data = {}, msg = "", code = 0
//     const db = cloud.database()
//     const r = await db.collection('room').where({
//         _id: event._id,
//     }).count()

//     if(r.detail > 0)
//         return true
//     else
//         return false
// }


// 增加直播间
async function add(event) {
    var data = {}, msg = "", code = 0
    const db = cloud.database()

    // const r = await db.collection('room').where({
    //     _id: event._id,
    // }).count()

    var _id = event._id || ""
    if (_id == ""){
        const add = await db.collection('room').add({
            data: {
                isShow: event.isShow || false,
                sn: event.sn || 0,
                roomID: event.roomID || 0,
                title: event.title || "",
                coverUrl: event.coverUrl || "",
                status: event.status || STATUS_PREPARE, // 1、进行中  2、已结束                 
                hostLogoUrl: event.hostLogoUrl || "",
                hostName: event.hostName || "",
                desc: event.desc || "",
                goodUrl: event.goodUrl || "", // 商品连接
                startTime: event.startTime || "",
            }
        })
        msg = "添加"
    } else{
        const add = await db.collection('room').where({
            _id: _id,
        }).update({
            data: {
                isShow: event.isShow || false,
                sn: event.sn || 0,
                roomID: event.roomID || 0,
                title: event.title || "",
                coverUrl: event.coverUrl || "",
                status: event.status || STATUS_PREPARE, // 1、进行中  2、已结束                 
                hostLogoUrl: event.hostLogoUrl || "",
                hostName: event.hostName || "",
                desc: event.desc || "",
                goodUrl: event.goodUrl || "", // 商品连接
                startTime: event.startTime || "",
            }
        })
        msg = "更新成功"
    }

    return { data: data, msg: msg, code: code }
}




// 增加用户
async function addUserInfo(event) {
    var data = {}, msg = "", code = 0
    const db = cloud.database()


    const res = await db.collection('user').where({
        openID: openID,
    }).count()

    // return { data: data, msg: res, code: code }
    // msg = res
    if(res.total == 0){
        var data = event
        data.openID = openID
        data.isPower = false
        const add = await db.collection('user').add({
            data: data
        })
        msg = "添加"
    } else{
        const add = await db.collection('user').where({
            openID: openID,
        }).update({
            data: event
        })
        msg = "更新成功"
    }
    return { data: data, msg: msg, code: code }
}



// 5验证权限
async function checkUserPower(event) {
    var data = {}, msg = "", code = 0
    const db = cloud.database()

    const res = await db.collection('user').where({
        openID: openID,
    }).get()
    if (res.data[0])
        data = res.data[0].isPower
    else
        data = false

    return { data: data, msg: msg, code: code }
}

