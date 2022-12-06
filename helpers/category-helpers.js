var db = require('../config/connection')
var collection = require('../config/collections');
const { CATEGORY_COLLECTION } = require('../config/collections');
// const { response } = require('../app');
var objectId = require('mongodb').ObjectId

module.exports = {

    get_category_list: (req) => {
        return new Promise(async (resolve, reject) => {
            var category_list = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(category_list)
        })
    },

    add_category: (data) => {
        let response={}
        data.category=data.category.toUpperCase()
        console.log('aetasetaeta', data.category);
        return new Promise(async (resolve, reject) => {
            let category=await db.get().collection(collection.CATEGORY_COLLECTION).findOne({category:data.category})
            if(category){
                resolve({status:false})
            }else{
                db.get().collection(collection.CATEGORY_COLLECTION).insertOne(data).then((response) => {
                    resolve({status:true})
    
                })
           }
        })
    },

    delete_category: (id) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: objectId(id) }).then((response) => {
                resolve("sucsusses deleted  category")
            })
        })
    },

    updateCategory: (categoryId, categoryList) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: objectId(categoryId) },
             {$set: 
                { 
                    category: categoryList.category,
                   
                }
                }).then((response) => {
                    resolve(`successfully edited`)
                })
        })
    },

    getCategoryDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })

    },

    getAllCategory: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(category)
        })
    },

    getAllCategoryProduct: (oneCat)=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({category:oneCat}).toArray()
            resolve(products)
        })
    },
    
    getCategory: (catID)=>{
        return new Promise(async(resolve,reject)=>{
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(catID)})
            // let category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({category:catID})
            resolve(category)
        })
    },
}