var db = require('../config/connection')
var collection = require('../config/collections');
const { CATEGORY_COLLECTION } = require('../config/collections');
const { response } = require('../app');
const { ObjectID } = require('bson');
var objectId = require('mongodb').ObjectId
var moment=require('moment')

module.exports = {
    
    getAllCoupons: () => {
        return new Promise(async (resolve, reject) => {
            let coupon = db.get().collection(collection.COUPON_COLLECTION).find().toArray()
            resolve(coupon)
        })
    },

    addCoupon: (data) => {
        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({ coupon: data.coupon })
            if (coupon) {
                reject()
            } else {
                console.log('jjjjjjjjjjjjjjjjjjj');
                let startDateIso = new Date(data.starting);
                let endDateIso = new Date(data.expiry);
                let expiry =  moment(data.expiry).format("YYYY-MM-DD");
                let starting =  moment(data.starting).format("YYYY-MM-DD");
                let couponObj =  {
                    coupon: data.coupon,
                    offer: parseInt(data.offer),
                    starting:starting,
                    expiry: expiry,
                    startDateIso: startDateIso,
                    endDateIso: endDateIso,
                    users: [],
                };
                db.get().collection(collection.COUPON_COLLECTION).insertOne(couponObj).then(() => {
                    resolve()
                })
            }
        
        })
    },

    editCoupon: (data) => {
        console.log(data);
        return new Promise((resolve, reject) => {
            try{
            let startDateIso = new Date(data.starting);
            let endDateIso = new Date(data.expiry);
            db.get().collection(collection.COUPON_COLLECTION).updateOne({ _id: objectId(data.id) }, {
                $set: {
                    coupon: data.coupon,
                    starting: data.starting,
                    expiry: data.expiry,
                    offer: data.offer,
                    startDateIso: startDateIso,
                    endDateIso: endDateIso,

                }
            }).then(() => {
                resolve()
            })
        }catch{
            resolve(0)
        }
        })
    },

    deleteCoupon: (coupId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).deleteOne({ coupon: coupId }).then(() => {
                resolve()
            })
        })
    },

    getCoupon: (coupId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).findOne({ _id: objectId(coupId) }).then((response) => {
                resolve(response)
            })
        })
    },

    validateCoupon: (data, userId,totalAmount) => {
        return new Promise(async (resolve, reject) => {
            try{

            obj = {}
            let date = new Date()
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({ coupon: data.coupon, Available: true })
            if (coupon) {
                
                console.log('coupon available');
                let users = coupon.users
                let userCheck = users.includes(userId)
                if (userCheck) {
                    console.log('coupon used');
                    obj.couponUsed = true
                    obj.offer = coupon.offer
                    resolve(obj) 
                } else {
                    console.log("coupon valid");
                    console.log("coupon valid ",coupon);

                    obj.offer = coupon.offer
                    obj.coupon = coupon.coupon
                    obj.couponId = coupon._id

                    console.log(date);
                    console.log(coupon.endDateIso);
                    if (date <= coupon.endDateIso) {
                        let total = parseInt(totalAmount)
                        let percentage = parseInt(coupon.offer)

                        let discountValue = ((total * percentage) / 100).toFixed()
                        obj.total = total - discountValue
                        obj.success = true
                        obj.discountValue = discountValue
                        resolve(obj)
                    } else {
                        console.log("coupon expired");
                        obj.couponExpired = true
                        resolve(obj)
                    }
                }
            } else {
                console.log("coupon invalid");  
                obj.invalidCoupon = true
                resolve(obj)
            }
        }catch{
            resolve(0)
        }
        })
    },

    startCouponOffer: (date) => {
        let couponStartDate = new Date(date);
        console.log(couponStartDate);
        return new Promise(async (resolve, reject) => {
            try{
            let data = await db.get().collection(collection.COUPON_COLLECTION).find({ startDateIso: { $lte: couponStartDate } }).toArray();
            console.log(data);
            if (data) {
                await data.map(async (oneData) => {
                    db.get().collection(collection.COUPON_COLLECTION).updateOne({ _id: objectId(oneData._id) },
                        {
                            $set: {
                                Available: true
                            }
                        }).then(() => {
                            resolve();
                        })
                })
            } else {
                resolve()
            }
        }catch{
            console.log('catched err');
            resolve(0)
        }
        })
    }

}


