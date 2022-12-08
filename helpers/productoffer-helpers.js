var db = require('../config/connection')
var collection = require('../config/collections');
var objectId = require('mongodb').ObjectId
var moment = require('moment');

module.exports = {

  addProductOffer: (data) => {
    return new Promise(async (resolve, reject) => {
      let exist = await db
        .get()
        .collection(collection.PRODUCTOFFER_COLLECTION)
        .findOne({ product: data.product });
      if (exist) {
        reject();
      } else {
        data.startDateIso = new Date(data.starting);
        data.endDateIso = new Date(data.expiry);
        data.productOfferPercentage = parseInt(data.productOfferPercentage);
        let exist = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .findOne({ Name: data.Name, offer: { $exists: true } });
        if (exist) {
          reject();
        } else {
          db.get()
            .collection(collection.PRODUCTOFFER_COLLECTION)
            .insertOne(data)
            .then(() => {
              resolve();
            });
        }
      }
    });
  },

  getAllProductOffer: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let AllCatOffers = await db.get().collection(collection.PRODUCTOFFER_COLLECTION).find().toArray()
        resolve(AllCatOffers)
      } catch {
        resolve(0)
      }
    })
  },

  getProductOfferDetails: (id) => {
    return new Promise((resolve, reject) => {
      try {
        db.get().collection(collection.PRODUCTOFFER_COLLECTION).findOne({ _id: objectId(id) }).then((response) => {
          resolve(response)
        })
      } catch {
        resolve(0)
      }
    })
  },

  getProductOffer: (id) => {
    return new Promise((resolve, reject) => {
      try {


        db.get().collection(collection.PRODUCTOFFER_COLLECTION).findOne({ _id: objectId(id) }).then((response) => {
          resolve(response)
        })
      } catch {
        resolve(0)
      }
    })

  },

  editProdOffer: (proOfferId, data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCTOFFER_COLLECTION)
        .updateOne(
          { _id: objectId(proOfferId) },
          {
            $set: {
              product: data.product,
              starting: data.starting,
              expiry: data.expiry,
              productOfferPercentage: parseInt(data.productOfferPercentage),
              startDateIso: new Date(data.starting),
              endDateIso: new Date(data.expiry),
            },
          }
        )
        .then(async () => {
          let products = await db
            .get()
            .collection(collection.PRODUCT_COLLECTION)
            .find({ product: data.Name, offer: { $exists: true } })
            .toArray();
          if (products) {
            await products.map(async (product) => {
              await db
                .get()
                .collection(collection.PRODUCT_COLLECTION)
                .updateOne(
                  { _id: objectId(product._id) },
                  {
                    $set: {
                      price: product.actualPrice,
                    },
                    $unset: {
                      offer: "",
                      productOfferPercentage: "",
                      actualPrice: "",
                    },
                  }
                )
                .then(() => {
                  resolve();
                });
            });
          } else {
            resolve();
          }
          resolve();
        });
    });
  },

  deleteProdOffer: (proOfferId) => {
    return new Promise(async (resolve, reject) => {
      let productOfferPercentage = await db
        .get()
        .collection(collection.PRODUCTOFFER_COLLECTION)
        .findOne({ _id: objectId(proOfferId) });
      let pname = productOfferPercentage.product;
      let product = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ Name: pname });
      console.log(product);
      db.get()
        .collection(collection.PRODUCTOFFER_COLLECTION)
        .deleteOne({ _id: objectId(proOfferId) })
        .then(() => {
          db.get()
            .collection(collection.PRODUCT_COLLECTION)
            .updateOne(
              { Name: pname },
              {
                $set: {
                  price: product.actualPrice,
                },
                $unset: {
                  offer: "",
                  productOfferPercentage: "",
                  actualPrice: "",
                },
              }
            )
            .then(() => {
              resolve();
            });
        });
    });
  },

  startProductOffer: (date) => {
    try {
      let proStartDateIso = new Date(date);
      return new Promise(async (resolve, reject) => {
        let data = await db.get().collection(collection.PRODUCTOFFER_COLLECTION).find({ startDateIso: { $lte: proStartDateIso } }).toArray();
        if (data.length > 0) {
          await data.map(async (onedata) => {
            let product = await db
              .get()
              .collection(collection.PRODUCT_COLLECTION)
              .findOne({ offer: { $exists: false }, Name: onedata.product });
            if (product) {
              let actualPrice = parseInt(product.price);
              let newPrice = (actualPrice * onedata.productOfferPercentage) / 100;
              newPrice = newPrice.toFixed();
              db.get()
                .collection(collection.PRODUCT_COLLECTION)
                .updateOne(
                  { _id: objectId(product._id) },
                  {
                    $set: {
                      actualPrice: actualPrice,
                      price: actualPrice - newPrice,
                      offer: true,
                      productOfferPercentage: onedata.productOfferPercentage,
                    },
                  }
                );
              resolve();
              console.log("get");
            } else {
              resolve();
              console.log("rejected");
            }
          });
        }
        resolve();
      });

    } catch (error) {
      console.log(error);

    }
  },
}