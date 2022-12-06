var db = require('../config/connection')
var collection = require('../config/collections');
const { ObjectId, ObjectID } = require('mongodb');
require('dotenv').config()

module.exports = {
    addAddress: function (userID, addressDetails) {
        return new Promise(function (resolve, reject) {
            addressDetails.userId = userID
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userID) }, {
                $push: { 'address': addressDetails }
            }).then((response) => {
                resolve(response)
            })
        })
    },

    getAllAddress: function (userId) {
        return new Promise(async function (resolve, reject) {
            let addresses = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) })
            resolve(addresses)
        })
    },

    getAddressbyId: function (id) {
        return new Promise(async function (resolve, reject) {
            let address = await db.get().collection(collection.ADDRESS_COLLECTION).find({ userId: id }).toArray()
            resolve(address)
        })
    },

    getAllAddressbyUserId: function (userId) {
        return new Promise(async function (resolve, reject) {
            let addresses = await db.get().collection(collection.ADDRESS_COLLECTION).find({ userId: userId }).toArray();
            resolve(addresses)
        })
    },

    editAddress: function (id, addressData) {
        return new Promise(function (resolve, reject) {
            db.get().collection(collection.ADDRESS_COLLECTION).updateOne({ _id: ObjectId(id) }, {
                $set: {
                    homeaddress: addressData.houseName,
                    fullAddress: addressData.address,
                    town: addressData.town,
                    Country: addressData.country,
                    pincode: addressData.pincode,
                    phone: addressData.phone,
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },

    deleteAddress: (userId, id) => {
        return new Promise(function (resolve, reject) {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, {
                $pull: { address: { id: id } }
            }).then((response) => {
                resolve(response)
            })
        })
    },

    orderStatusChange: (status, orderId) => {
        return new Promise((resolve, reject) => {
            if (status == "cancelled") {
                db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) }, {
                    $set: {
                        status: status,
                        isCancelled: true,
                        cancellDate: new Date()
                    }
                }).then(() => {
                    resolve()
                })
            } else if (status == "delivered") {
                db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) }, {
                    $set: {
                        status: status,
                        isDelivered: true,
                        deliveredDate: new Date()
                    }
                }).then((res) => {
                    resolve()
                })

            } else if (status == "shipped") {
                console.log("at shipped");
                db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) }, {
                    $set: {
                        status: status,
                        isShipped: true,
                        shippedDate: new Date()
                    }
                }).then((res) => {
                    resolve()
                })
            } else if (status == "out for delivery") {
                console.log("at out for delivery");
                db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) }, {
                    $set: {
                        status: status,
                        isOutForDelivery: true,
                        outForDeliveryDate: new Date()
                    }
                }).then((res) => {
                    resolve()
                })
            }
            else {
                db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) }, {
                    $set: {
                        status: status,
                    }
                }).then((response) => {
                    console.log(response);
                    resolve()
                })
            }
        })
    },

    getAllOrderss: () => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
            resolve(orders)
        })
    },
}