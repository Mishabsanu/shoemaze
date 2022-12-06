var db = require('../config/connection')
var collection = require('../config/collections');
var objectId = require('mongodb').ObjectId
var moment = require('moment');

module.exports = {

    addCategoryOffer: (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                data.startDateIso = new Date(data.starting)
                data.endDateIso = new Date(data.expiry)
                let exist = await db.get().collection(collection.CATEGORYOFFER_COLLECTION).findOne({ category: data.category })
                if (exist) {
                    reject()
                } else {
                    db.get().collection(collection.CATEGORYOFFER_COLLECTION).insertOne(data).then(() => {
                        resolve()
                    })
                }
            } catch {
                resolve(0)
            }
        })
    },

    getAllCatOffers: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let AllCatOffers = await db.get().collection(collection.CATEGORYOFFER_COLLECTION).find().toArray()
                resolve(AllCatOffers)
            } catch {
                resolve(0)
            }
        })
    },

    getCatOfferDetails: (id) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.CATEGORYOFFER_COLLECTION).findOne({ _id: objectId(id) }).then((response) => {
                    resolve(response)
                })
            } catch {
                resolve(0)
            }
        })
    },

    updateCatOffer: (catOfferId, data) => {
        console.log(catOfferId);
        console.log(data);
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.CATEGORYOFFER_COLLECTION).updateOne({ _id: objectId(catOfferId) }, {
                    $set: {
                        category: data.category,
                        starting: data.starting,
                        expiry: data.expiry,
                        catOfferPercentage: parseInt(data.catOfferPercentage),
                        startDateIso: new Date(data.starting),
                        endDateIso: new Date(data.expiry)
                    }
                }).then(async () => {
                    let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: data.category, offer: { $exists: true } }).toArray()
                    if (products) {
                        await products.map(async (product) => {
                            await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(product._id) }, {
                                $set: {
                                    price: product.actualPrice
                                },
                                $unset: {
                                    offer: "",
                                    catOfferPercentage: "",
                                    actualPrice: "",
                                }
                            }).then(() => {
                                resolve()
                            })

                        })

                    } else {
                        resolve()
                    }
                    resolve()
                })
            } catch {
                resolve(0)
            }
        })
    },

    deleteCatOffer: (catOfferId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let catOffer = await db.get().collection(collection.CATEGORYOFFER_COLLECTION).findOne({ _id: objectId(catOfferId) })
                let category = catOffer.category
                let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: category, offer: { $exists: true } }).toArray()
                if (products) {
                    await db.get().collection(collection.CATEGORYOFFER_COLLECTION).deleteOne({ _id: objectId(catOfferId) }).then(async () => {
                        await products.map(async (product) => {
                            await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(product._id) }, {
                                $set: {
                                    price: product.actualPrice
                                },
                                $unset: {
                                    offer: "",
                                    catOfferPercentage: "",
                                    actualPrice: "",
                                }
                            }).then(() => {
                                resolve()
                            })

                        })

                    })
                } else {
                    resolve()
                }
            } catch {
                resolve(0)
            }
        })
    },

    startCategoryOffer: (date) => {
        let startDateIso = new Date(date)
        return new Promise(async (resolve, reject) => {
            try {

                let data = await db.get().collection(collection.CATEGORYOFFER_COLLECTION).find({ startDateIso: { $lte: startDateIso } }).toArray()
                if (data.length > 0) {
                    await data.map(async (onedata) => {
                        let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: onedata.category, offer: { $exists: false } }).toArray()
                        if (products) {

                            await products.map((product) => {

                                let actualPrice = product.price
                                let newPrice = (((actualPrice) * (onedata.catOfferPercentage)) / 100)
                                newPrice = newPrice.toFixed()
                                console.log(actualPrice, newPrice);
                                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(product._id) },
                                    {
                                        $set: {
                                            actualPrice: actualPrice,
                                            price: (actualPrice - newPrice),
                                            offer: true,
                                            catOfferPercentage: onedata.catOfferPercentage
                                        }
                                    })
                            })
                        }
                    })
                    resolve()

                } else {
                    resolve()
                }
            } catch {
                resolve(0)
            }
        })
    }
}