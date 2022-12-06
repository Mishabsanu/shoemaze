var db = require('../config/connection')
var collection = require('../config/collections');
const { CATEGORY_COLLECTION } = require('../config/collections');
// const { response } = require('../app');
const { ObjectID, ObjectId } = require('bson');
var objectId = require('mongodb').ObjectId




module.exports = {

    getOrderProduct: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: ObjectId(userId) }).sort({ $natural: -1 }).toArray()
            console.log(orders);
            resolve(orders)
        })
    },

    getOrderProductList: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderItem = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: ObjectId(orderId) }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        item: '$product.item',
                        quantity: '$product.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            console.log();
            resolve(orderItem)
        })
    },
    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            let allOdres = await db.get().collection(collection.ORDER_COLLECTION).find().sort({ $natural: -1 }).toArray()
            resolve(allOdres)
        })
    },
    // <----------------------------------- Admin ------------------------------------------->

    changeOrderStatus: (orderId, status) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) })
        })
    },

    updateStatus: (body, details) => {
        let { status } = body
        console.log(status)
        return new Promise((resolve, reject) => {
            if (status == 'delivered' || status == 'cancelled') {
                db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(details) },
                    {
                        $set: {
                            do: true,
                            status: status
                        }
                    }).then((response) => {
                        console.log('hqqqqqhhhh')
                        resolve()
                        console.log('hhrrrrrrrrhh')
                    })
            } else {
                db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(details) },
                    {
                        $set: {
                            status: status
                        }
                    }).then((response) => {
                        console.log('second')
                        resolve()
                        console.log('2second')
                    })
            }
        })
    },

    deleteOrder: (orderId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ORDER_COLLECTION).deleteOne({ _id: ObjectId(orderId) }).then((response) => {
                resolve(response)
            })
        })
    },

    getOrderDetail: (ordrId) => {
        return new Promise(async (resolve, reject) => {
            let orderdetail = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(ordrId) })
            resolve(orderdetail)
        })
    },

    getOrderDetails: (id) => {
        console.log(id, 'its id');
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(id) }
                },
                {
                    $lookup: {
                        from: collection.USER_COLLECTION,
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'product.item',
                        foreignField: '_id',
                        as: 'orderdetail'
                    }
                },
                {
                    $unwind: '$orderdetail'
                },

                {
                    $unwind: '$user'
                },
                {
                    $project: {
                        id: '$orderdetail._id',
                        name: '$orderdetail.Name',
                        totalAmount: '$orderdetail.price',
                        ordercanceled: '$orders.ordercanceled',
                        Category: '$orderdetail.category',
                        homeaddress: '$deliveryDitails.homeaddress',
                        fulladdress: '$deliveryDitails.fullAddress',
                        town: '$deliveryDitails.town',
                        Country: '$deliveryDitails.Country',
                        pincode: '$deliveryDitails.pincode',

                        status: '$status',
                        discountPrice: '$orderdetail.actualPrice',
                        payment: '$paymentMethod',
                        category: '$orderdetail.category',
                        image: '$orderdetail._id',
                        email: '$user.Email',
                        Nameuser: '$user.Name'
                    }
                }
            ]).toArray()
            console.log('oooooooo');
            console.log(order);
            resolve(order)
        })
    },
}






