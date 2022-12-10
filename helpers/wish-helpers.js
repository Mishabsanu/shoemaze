const db = require('../config/connection')
const collection = require('../config/collections')
const objectId = require('mongodb').ObjectId

module.exports = {

    addToWishlist: (produtID, userID) => {
        console.log(produtID);
        return new Promise(async (resolve, reject) => {
            let productWishList = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userID) })
            if (productWishList) {
                let proExist = productWishList.product.findIndex(product => product.item == produtID)
                if (proExist != -1) {
                    db.get().collection(collection.WISHLIST_COLLECTION)
                        .updateOne({ user: objectId(userID) },
                            {
                                $pull: { product: { item: objectId(produtID) } }
                            }
                        )
                    resolve({ wishlist: false })
                } else {
                    db.get().collection(collection.WISHLIST_COLLECTION)
                        .updateOne({ user: objectId(userID) },
                            {
                                $push: { product: { item: objectId(produtID) } }
                            }
                        )
                    resolve({ wishlist: true })
                }
            } else {
                proObj = {item: objectId(produtID)};
                let wishListObj = { 
                    user: objectId(userID),
                    product: [proObj]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishListObj).then((res) => {
                    resolve(res)
                })
            }

        })

   
    },
    getWishListProducts: (userID) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match: {
                        user: objectId(userID)
                    }
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
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            resolve(cartItems)
        })
    },
    getWishListCount: (userID) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            let cart = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userID) })
            if (cart) {
                count = cart.product.length
            }
            resolve(count)
        })
    },
    removeWishListProduct: (proId, userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WISHLIST_COLLECTION)
                .updateOne({ user: objectId(userId) },
                    {
                        $pull: { product: { item: objectId(proId) } }
                    }
                ).then((response) => {

                    resolve({ removeProduct: true })
                })

        })
    },
}