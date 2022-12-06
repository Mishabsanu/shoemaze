var db = require('../config/connection')
var collection = require('../config/collections');
const bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectId
module.exports = {

    addProduct: (productData) => {
        return new Promise(async (resolve, reject) => {
            productData.price = parseInt(productData.price)
            productData.stock = parseInt(productData.stock)
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(productData).then((data) => {
                resolve(data.insertedId)
            })
        })
    },

    getAllProduct: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },

    deleteProduct: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(productId) }).then((response) => {
                resolve(response)
            })
        })
    },

    getProductDetails: (productId) => {
        console.log(productId);
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(productId) })

            console.log(product);
            resolve(product)
        })
    },

    getProduct: (id) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.PRODUCT_COLLECTION)
                .findOne({ _id: objectId(id) })
                .then((response) => [resolve(response)]);
        });
    },

    updateProduct: (productId, productDetails) => {
        var statuss = null
        let price = parseInt(productDetails.price)
        let stock = parseInt(productDetails.stock)

        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION)
                .updateOne({ _id: objectId(productId) }, {
                    $set: {
                        Name: productDetails.Name,
                        category: productDetails.category,
                        discriptions: productDetails.discriptions,
                        stock: stock,
                        price: price
                    }
                }).then((response) => {

                    resolve(`successfully edited`)
                })
        })
    },

    changeStatus: function (id) {
        return new Promise(async function (resolve, reject) {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(id) })
            if (user.blocked == true) {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(id) }, {
                    $set: {
                        blocked: false
                    }
                }).then(() => {
                    resolve("unblocked")
                })
            } else {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(id) }, {
                    $set: {
                        blocked: true
                    }
                }).then((response) => {
                    resolve("blocked")
                })
            }
        })
    },

    findStock: (id) => {
        return new Promise(async (resolve, reject) => {
            let product = await db

                .get()
                .collection(collection.PRODUCT_COLLECTION)
                .findOne({ _id: objectId(id) });

            resolve(product);
        });
    },
    getallProductPage: (pageNo) => {
        return new Promise(async (res, rej) => {
          let users = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([        
              {
                $skip: parseInt(pageNo),
              },
              {
                $limit:4,
              },
            ])
            .toArray();
          res(users);
        });
      }
}