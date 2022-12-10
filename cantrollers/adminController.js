var express = require('express');
var router = express.Router();
const adminHelpers = require('../helpers/admin-helpers')
const userHelpers = require('../helpers/user-helpers')
const productHelpers = require('../helpers/product-helpers')
const categoryHelpers = require('../helpers/category-helpers');
const orderHelpers = require('../helpers/order-helpers');
const offerHelpers = require('../helpers/offer-helpers');
const couponHelpers = require('../helpers/coupon-helpers');
const productofferHelpers = require('../helpers/productoffer-helpers');


const adminController = {

    ////////////////// Main Page (dash/Login) ///////////////////////. 

    mainPageGet: async (req, res, next) => {
        try {
            if (req.session.adminLoggedIn) {
                let Users = await userHelpers.totUsers()
                let Products = await userHelpers.totProducts()
                let Orders = await userHelpers.totOrders()
                let Revenue = await adminHelpers.graphdata()
                let revenue = Revenue.yearlySales[0].total
                res.render('admin/admin-dashbord', { admin: true, Orders, Products, Users, revenue });
            } else {
                res.redirect('/admin/admin-login')
            }
        } catch (error) {
            res.redirect('/wrong')
        }
    },

    ////////////////////// Admin Login ///////////////////////////////

    adminLoginGet: (req, res) => {
        try {
            if (req.session.adminLoggedIn) {
                res.redirect('/admin')
            } else {
                res.render('admin/admin-login', { "adminErr": req.session.adminErr })
                req.session.adminErr = false
            }
        } catch (error) {
            res.redirect('/wrong')
        }
    },

    adminLoginPost: function (req, res) {
        const credentials = {
            email: "admin@gmail.com",
            password: "admin"
        }
        if (req.body.Email == credentials.email && req.body.Password == credentials.password) {
            req.session.adminLoggedIn = true;
            req.session.admin = req.body.email;
            res.redirect('/admin');
        } else {
            console.log("admin not logged in");
            req.session.adminErr = "valid email or password"
            res.redirect('/admin')
        }
    },

    ////////////////////////// Dashboard ////////////////////////////////

    adminDashboardGet: async (req, res) => {
        try {

            let Users = await userHelpers.totUsers()
            let Products = await userHelpers.totProducts()
            let Orders = await userHelpers.totOrders()
            let Revenue = await adminHelpers.graphdata()
            let revenue = Revenue.yearlySales[0].total
            res.render('admin/admin-dashbord', { admin: true, Users, Products, Orders, revenue })
        } catch (error) {
            console.log('somthing wrong in  adminDashboardGet');
            res.redirect('/wrong')
        }
    },

    adminDashboardGet: async (req, res) => {
        try {
            let Users = await userHelpers.totUsers()
            let Products = await userHelpers.totProducts()
            let Orders = await userHelpers.totOrders()
            let Revenue = await adminHelpers.graphdata()
            let revenue = Revenue.yearlySales[0].total
            res.render('admin/admin-dashbord', { admin: true, Users, Products, Orders, revenue })
        } catch (error) {
            console.log('somthing wrong in  adminDashboardGet');
            res.redirect('/wrong')
        }
    },

    adminDashboardGetday: async (req, res) => {
        try {
            await adminHelpers.findOrdersByDay().then((data) => {
                res.json(data)
            })
        } catch (error) {
            res.redirect('/wrong')
        }
    },

    adminDashboardPostDataGrapgh: async (req, res) => {
        try {
            await adminHelpers.graphdata().then((data) => {
                console.log(data, 'jooooooo');
                res.json({ data })
            })
        } catch (error) {
            res.redirect('/wrong')
        }
    },

    getSalesReport: async (req, res) => {
        try {
            if (req.session.adminLoggedIn) {
                let myorder = await orderHelpers.getAllOrders()
                myorder.forEach(element => {
                    let a = element.date.toISOString().split('T')[0]
                    console.log(a);
                    element.date = a;
                });
                res.render('admin/sale-report', { myorder, admin: true })
            }
        } catch (error) {
            console.log('somthing wrong in getSalesReport ');
            res.redirect('/wrong')
        }
    },

    /////////////////////////// Listing(User,Category,Products, Orders) ///////////////////////////////

    listProductGet: (req, res) => {
        try {
            let pageNo = (Number(req.params.id) - 1) * 4;
            let passNo = req.params.id;
            productHelpers.getallProductPage(pageNo).then((products)=>{
                res.render('admin/list-product', { admin: true, products,passNo })

            })
            // productHelpers.getAllProduct().then((products) => {
            // })
        } catch (error) {
            res.redirect('/wrong')

        }
    },

    listUserGet: (req, res) => {
        try {
            userHelpers.getAllUsers().then((users) => {
                res.render('admin/list-user', { admin: true, users })
            })
        } catch (error) {
            res.redirect('/wrong')
        }
    },

    listCategoryGet: async (req, res) => {
        let category = await categoryHelpers.get_category_list()
        res.render('admin/list-category', { admin: true, category },)
    },

    listOrderGet: async (req, res) => {
        try {
            let allproduct = await productHelpers.getAllProduct()
            orderHelpers.getAllOrders().then((orderList) => {
                orderList.forEach(element => {
                    if (element.status == "delivered") {
                        element.delivered = true;
                    } else if (element.status == "cancelled") {
                        element.cancelled = true;
                    } else if (element.status == "returned") {
                        element.returned = true;
                    }
                });
                res.render('admin/list-order', { admin: true, orderList, allproduct })
            })
        } catch (error) {
            console.log('somthing wrong in listOrderGet ');
            res.redirect('/wrong')
        }
    },

    /////////////////////////// Adding (Category,Products) ///////////////////////////////

    addCategoryGet: (req, res) => {
        res.render('admin/add-category', { admin: true, categoryErr: false })
    },

    addCategoryPost: (req, res) => {
        try {
            categoryHelpers.add_category(req.body).then((data) => {
                if (data.status) {
                    console.log('fhdfhdhdhd');
                    res.redirect('/admin/list-category')
                } else {
                    res.render('admin/add-category', { categoryErr: true, admin: true })
                }
            })
        } catch (error) {
            console.log('somthing wrong in  addCategoryPost');
            res.redirect('/wrong')
        }
    },

    addProductGet: async (req, res) => {
        let category = await categoryHelpers.get_category_list()
        res.render('admin/add-product', { admin: true, category })
    },

    addProductPost: function (req, res) {
        try {
            const prdtDetails = {
                Name: req.body.Name,
                price: req.body.price,
                discriptions: req.body.discriptions,
                stock: req.body.stock,
                category: req.body.category,
                image1: req.files.image1.name,
                image2: req.files.image2.name,
                image3: req.files.image3.name,
                image4: req.files.image4.name
            }
            productHelpers.addProduct(prdtDetails).then((data) => {
                let image1 = req.files.image1
                let image2 = req.files.image2
                let image3 = req.files.image3
                let image4 = req.files.image4

                image1.mv(`./public/assets/product-images/${data}.jpg`, (err, done) => {   // id pass cheythond athe productnde image ne kittan vendi data pass acejythu
                })
                image2.mv(`./public/assets/product-images/${data}2.jpg`, (err, done) => {
                })
                image3.mv(`./public/assets/product-images/${data}3.jpg`, (err, done) => {
                })
                image4.mv(`./public/assets/product-images/${data}4.jpg`, (err, done) => {
                })
                res.redirect('/admin/list-product/1')
            })
        } catch (error) {
            console.log('somthing wrong in addProductPost ');
            res.redirect('/wrong')
        }
    },

    //////////////////// Deleting & Blocking (User , Products, Category)///////////////////////////////////////////////////

    deleteProductIdGet: (req, res) => {
        try {
            let proId = req.params.id
            productHelpers.deleteProduct(proId).then((response) => {
                res.redirect('/admin/list-product/1')
            })
        } catch (error) {
            res.redirect('/wrong')
        }
    },

    deleteCategoryIdGet: (req, res) => {
        try {
            let proId = req.params.id
            categoryHelpers.delete_category(proId).then((response) => {
                res.redirect('/admin/list-category')
            })
        } catch (error) {
            res.redirect('/wrong')
        }
    },

    changeStatusGet: (req, res) => {
        try {
            productHelpers.changeStatus(req.query.id).then((response) => {
                admin__msg = response
                res.redirect('/admin/list-user')
            })
        } catch (error) {
            res.redirect('/wrong') 
        }
    },

    changeStatusPost: (req, res) => {
        res.render('admin/list-order')
    },

    /////////////////////////// Editing (Category,Products) ///////////////////////////////

    editCategoryGet: async (req, res) => {
        try {
            let category = await categoryHelpers.getCategoryDetails(req.params.id)
            res.render('admin/edit-category', { category, admin: true })
            admin__msg = ''
        } catch (error) {
            res.redirect('/wrong') 
        }
    },

    editCategoryPost: (req, res) => {
        try {
            categoryHelpers.updateCategory(req.params.id, req.body).then((response) => {
                res.redirect('/admin/list-category')
            })
        } catch (error) {
            res.redirect('/wrong') 
        }        
    },

    editProductGet: async (req, res) => {
        // try {
            let product = await productHelpers.getProductDetails(req.params.id)
            let category = await categoryHelpers.get_category_list()
            res.render('admin/edit-product', { product, category, admin: true })
        // } catch (error) {
        //     res.redirect('/wrong') 
        // }
    },

    editProductPost: (req, res) => {
        let data = req.params.id
        productHelpers.updateProduct(data, req.body).then(async (response) => {
            try {
                if (req.files.image) {
                    let image = req.files?.image
                    await image.mv(`./public/product-image/${data}.png`, (err, succ) => {
                        if (err) {
                            console.warn(err)
                        } {
                            console.log('success')
                        }
                    })
                }
                if (req.files.image1) {
                    let image1 = req.files?.image1
                    await image1.mv(`./public/assets/product-images/${data}1.png`, (err, succ) => {
                        if (err) {
                            console.warn(err)
                        } else {
                            console.log('success')
                        }
                    })
                }
                if (req.files.image2) {
                    let image2 = req.files?.image2
                    await image2.mv(`./public/assets/product-images/${data}2.png`, (err, succ) => {
                        if (err) {
                            console.warn(err)
                        } {
                            console.log('success')
                        }
                    })
                }
                if (req.files.image3) {
                    let image3 = req.files?.image3
                    await image3.mv(`./public/assets/product-images/${data}3.png`, (err, succ) => {
                        if (err) {
                            console.warn(err)
                        } {
                            console.log('success')
                        }
                    })
                }
                if (req.files.image4) {
                    let image4 = req.files?.image4
                    await image4.mv(`./public/assets/product-images/${data}2.png`, (err, succ) => {
                        if (err) {
                            console.warn(err)
                        } {
                            console.log('success')
                        }
                    })
                }
                res.redirect('/admin/list-product/1')
            }
            catch (err) {
                res.redirect('/admin/list-product/1')
            }
        })
    },

    getviewdetails: async (req, res) => {
        try {
            let order = await orderHelpers.getOrderDetails(req.params.id)
            console.log(order, 'ololol');
            res.render('admin/view-details', { order,admin:true })

        } catch (error) {
            console.log('somthing wrong in getviewdetails ');
            res.redirect('/wrong')
        }
    },

    editStatusPost: (req, res) => {
        try {
            adminHelpers.productStatus(req.params.id, req.body.status).then(() => {
                res.redirect('/admin/list-order')
            })
        } catch (error) {
            res.redirect('/wrong') 
        }
    },

    /// category offeers      ////

    addCategorOfferyGet: async (req, res) => {
        try {
            let category = await categoryHelpers.getAllCategory()
            let alloffercategory = await offerHelpers.getAllCatOffers()
            res.render('admin/add-categoryoffer', { admin: true, category, alloffercategory })

        } catch (error) {
            console.log('somthing wrong in  addCategorOfferyGet');
            res.redirect('/wrong')
        }
    },

    addCategorOfferyPost: (req, res) => {
        try {
            offerHelpers.addCategoryOffer(req.body).then(() => {
                res.redirect('/admin/add-categoryoffer')

            }).catch(() => {
                req.session.offerExist = "offer for this category is already added"
                res.redirect('/admin/add-categoryoffer')
            })
        } catch (error) {
            console.log('somthing wrong in  addCategorOfferyPost');
            res.redirect('/wrong')
        }
    },

    editCategorOfferyGet: async (req, res) => {
        try {
            let data = await offerHelpers.getCatOfferDetails(req.params.id)
            let category = await categoryHelpers.get_category_list()
            res.render('admin/edit-categoryoffer', { admin: true, data, category })
        } catch (error) {
            console.log('somthing wrong in  editCategorOfferyGet');
            res.redirect('/wrong')
        }
    },

    editCategorOfferyPost: (req, res) => {
        try {
            console.log(req.body);
            let id = req.params.id
            offerHelpers.updateCatOffer(id, req.body).then(() => {
                res.redirect('/admin/add-categoryoffer')
            })
        } catch (error) {
            console.log('somthing wrong in editCategorOfferyPost ');
            res.redirect('/wrong')
        }
    },

    deleteCategorOfferyIdGet: (req, res) => {
        try {
            let catoffId = req.params.id
            offerHelpers.deleteCatOffer(catoffId).then((response) => {
                res.redirect('/admin/add-categoryoffer')
            })
        } catch (error) {
            res.redirect('/wrong') 
        }
    },

    deleteCategorOfferyGet: (req, res) => {
        res.render('/admin/add-categoryoffer')
    },

    /// product offer///

    addProductOfferGet: async (req, res) => {
        try {
            let product = await productHelpers.getAllProduct();
            let AllProductOffer = await productofferHelpers.getAllProductOffer();
            res.render('admin/add-productoffer', { admin: true, product, AllProductOffer })
        } catch (error) {
            console.log('somthing wrong in  addProductOfferGet');
            res.redirect('/wrong')
        }
    },

    addProductOfferPost: (req, res) => {
        try {
            productofferHelpers.addProductOffer(req.body).then(() => {
                res.redirect('/admin/add-productoffer')
            });
        } catch (error) {
            console.log('somthing wrong in  addProductOfferPost');
            res.redirect('/wrong')
        }
    },

    editProductOfferGet: async (req, res) => {
        try {
            let proOfferId = req.params._id;
            let proOfferDetails = await productofferHelpers.getProductOfferDetails(proOfferId);
            let product = await productHelpers.getAllProduct()
            res.render("admin/edit-productoffer", { admin: true, proOfferDetails, product })
        } catch (error) {
            console.log('somthing wrong in  editProductOfferGet');
            res.redirect('/wrong')
        }
    },

    editProductOfferPost: (req, res) => {
        try {
            let proOfferId = req.params._id;
            productofferHelpers.editProdOffer(proOfferId, req.body).then(() => {
                res.redirect("/admin/add-productoffer");
            })
        } catch (error) {
            console.log('somthing wrong in editProductOfferPost ');
            res.redirect('/wrong')
        }
    },

    deleteProductOfferGet: (req, res) => {
        try {
            let proOfferId = req.params._id;
            productofferHelpers.deleteProdOffer(proOfferId).then(() => {
                res.redirect("/admin/add-productoffer");
            });
        } catch (error) {
            console.log('somthing wrong in  deleteProductOfferGet');
            res.redirect('/wrong')
        }
    },

    /////coupon///////////

    getlistCoupon: async (req, res) => {
        try {
            let coupons = await couponHelpers.getAllCoupons()
            res.render('admin/list-coupon', { admin: true, coupons },)
        } catch (error) {
            res.redirect('/wrong') 
        }
    },

    getAddCoupon: (req, res) => {
        res.render('admin/add-coupon')

    },

    postAddCoupon: (req, res) => {
        try {
            
            couponHelpers.addCoupon(req.body).then(() => {
                res.redirect('/admin/list-coupon')
            })
        } catch (error) {
            res.redirect('/wrong') 
        }
    },

    DeleteCouponDelete: (req, res) => {
        try {
            let id = req.body.couponId
            couponHelpers.deleteCoupon(id).then((response) => {
                res.status(200).send({ response: true })
            })
        } catch (error) {
            res.redirect('/wrong') 
        }
    },

    /////////////////////////////////////////////////////////////////////////

    adminLogOut: (req, res) => {
        req.session.admin = null
        req.session.adminLoggedIn = null
        req.session.adminLoginError = null
        res.redirect('/admin')
    },
}

module.exports = adminController;
