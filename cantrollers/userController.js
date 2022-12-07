var express = require('express');
const bcrypt = require('bcrypt')
const adminHelpers = require('../helpers/admin-helpers');
const userHelpers = require('../helpers/user-helpers');
const productHelpers = require('../helpers/product-helpers')
const categoryHelpers = require('../helpers/category-helpers')
const cartHelpers = require('../helpers/cart-helpers')
const addressHelpers = require('../helpers/address-helpers')
const paymentHelpers = require('../helpers/payment-helpers')
const couponHelpers = require('../helpers/coupon-helpers');
var router = express.Router();
const configTwilio = require('../config/twilio');
const orderHelpers = require('../helpers/order-helpers');
const e = require('express');
const offerHelpers = require('../helpers/offer-helpers');
const productofferHelpers = require('../helpers/productoffer-helpers');
const moment = require("moment");
require('dotenv')
const serviceSID = process.env.serviceSID
const accountSID = process.env.accountSID
const authToken = process.env.authToken
const client = require('twilio')(accountSID, authToken, serviceSID);
let phone

const userController = {


    //////////////////////////////home page////////////////////////

    homePage: async (req, res) => {
        let todayDate = new Date().toISOString().slice(0, 10);
        let startCouponOffer = await couponHelpers.startCouponOffer(todayDate)
        let startCategoryOffer = await offerHelpers.startCategoryOffer(todayDate)
        let startProductOffer = await productofferHelpers.startProductOffer(todayDate)
        try {
            if (req.session.loggedIn) {
                let userss = req.session.user
                let todayDate = new Date().toISOString().slice(0, 10);
                let startCouponOffer = await couponHelpers.startCouponOffer(todayDate)
                let startCategoryOffer = await offerHelpers.startCategoryOffer(todayDate)
                let startProductOffer = await productofferHelpers.startProductOffer(todayDate)
                let person = await userHelpers.getUser(userss._id)
                let cartCount = null
                if (req.session.user) {
                    cartCount = await cartHelpers.getCartCount(req.session.user._id)
                }
                let category = await categoryHelpers.getAllCategory()
                console.log('categoryDetails', category);
                productHelpers.getAllProduct().then((products) => {
                    products.forEach(async (element) => {
                        if (element.stock <= 10 && element.stock != 0) {
                            element.fewStock = true;
                        } else if (element.stock == 0) {
                            element.noStock = true;
                        }
                    });
                    console.log(category);
                    res.render('user/main', { user: true, category, products, users: true, person, cartCount });
                });
            }
        } catch (error) {
            res.redirect('user/main');

        }
        let userss = req.session.user
        let category = await categoryHelpers.getAllCategory()
        productHelpers.getAllProduct().then((products) => {
            products.forEach(async (element) => {
                if (element.stock <= 10 && element.stock != 0) {
                    element.fewStock = true;
                } else if (element.stock == 0) {
                    element.noStock = true;
                }
            });
            res.render('user/main', { user: true, category, products, userss });
        })

    },

    ///////////////////////////////////////////////////  User Login And SignUp  /////////////////////////////////////////////////////////

    // Users Logins

    userLoginGet: function (req, res, next) {
        if (req.session.loggedIn) {
            res.redirect('/')
        } else {
            res.render('user/login', { loginErr: req.session.logginError, otpUserBlock: req.session.blockErr, invalidUser: req.session.invalidUser, blockErr: req.session.blockError });
            req.session.blockErr = false
            req.session.logginError = false
            req.session.invalidUser = false
            req.session.blockError = false
        }
    },



    userLoginPost: (req, res) => {
        userHelpers.doLogin(req.body).then((response) => {
            if (response.isblocked) {
                req.session.blockError = "user block"
                res.redirect('/login')
            }
            else if (response.status) {
                req.session.loggedIn = true
                req.session.user = response.user
                res.redirect('/')
            } else {
                req.session.logginError = "invalid user name or password"
                res.redirect('/login')
            }
        })
    },

    // Users SignUp

    userSignupGet: function (req, res, next) {
        res.render('user/signup', { signupErr: req.session.signupErr });
        req.session.signupErr = false
    },

    userSignupPost: (req, res) => {
        userHelpers.doSignup(req.body).then((response) => {
            if (response.statuss) {
                res.redirect('/login')
            } else {
                req.session.signupErr = "email already exists"
                res.redirect('/signup')
            }
        })
    },

    // Otp Login

    otpPageGet: (req, res) => {
        res.render('user/otp', { otpErr: req.session.invalidOtpError, phone })
    },

    getOtpPost: (req, res) => {
        phone = req.body.phone
        console.log(phone, 'phone');
        userHelpers.verifyPhone(phone).then(() => {
            client.verify
                .services(process.env.serviceSID)
                .verifications.create({
                    to: `+91${phone}`,
                    channel: "sms"
                }).then((response) => {
                    res.render('user/otp', { phone })
                }).catch((e) => {
                    console.log(e);
                    console.log('failedd');
                })
        }).catch((response) => {
            if (response.nouser) {
                req.session.invalidUser = "invalid number"
                res.redirect('/login')
            } else {
                req.session.blockErr = "user blocked"
                res.redirect('/login')
            }
        })
    },

    submitOtpPost: (req, res) => {
        userHelpers.verifyOTP(phone).then((response) => {
            let users = req.session.user
            let otp = req.body.otp
            client.verify
                .services(process.env.serviceSID)
                .verificationChecks.create({
                    to: `+91${phone}`,
                    code: otp
                }).then((data) => {
                    if (data.valid) {
                        req.session.loggedIn = true
                        req.session.user = response
                        res.redirect('/')
                    } else {
                        req.session.invalidOtpError = "invalid otp"
                        res.redirect('/otp')
                    }
                })
        })
    },

    // all product 

    allProductGet: async (req, res) => {
        try {
            let users = req.session.user
            let category = await categoryHelpers.getAllCategory()
            let cartCount = await cartHelpers.getCartCount(req.session.user._id)
            productHelpers.getAllProduct().then((products) => {

                res.render('user/all-product', { user: true, products, category, users, cartCount })
            })
        } catch (error) {
            res.redirect('/wrong')
        }
    },

    // show category

    showCategoryIdGet: async (req, res) => {
        try {
            let userss = req.session.user
            let person = await userHelpers.getUser(userss._id)
            let category = await categoryHelpers.getAllCategory()
            let cartCount = await cartHelpers.getCartCount(req.session.user._id)
            let oneCat = await categoryHelpers.getCategory(req.params.id)
            console.log('ererberbewerwerw', oneCat);
            let products = await categoryHelpers.getAllCategoryProduct(oneCat.category)
            let productss = await productHelpers.getAllProduct();
            products.forEach(async (element) => {
                if (element.stock <= 10 && element.stock != 0) {
                    element.fewStock = true;
                } else if (element.stock == 0) {
                    element.noStock = true;
                }
            });
            res.render('user/all-product', { user: true, login: true, products, productss, category, oneCat, userss, users: true, cartCount, person });
        } catch (error) {
            res.redirect('/wrong')
        }
    },

    ///////////////////////////////////////////////  Product  ////////////////////////////////////////////////////////////////


    productViewGetId: async (req, res) => {
        try {
            let users = req.session.user
            let userss = req.session.user
            let person = await userHelpers.getUser(userss._id)
            let id = req.params.id
            let category = await categoryHelpers.getAllCategory()
            let products = await productHelpers.getAllProduct();
            let productss = await productHelpers.getAllProduct();

            productss.forEach(async (element) => {
                if (element.stock <= 10 && element.stock != 0) {
                    element.fewStock = true;
                } else if (element.stock == 0) {
                    element.noStock = true;
                }
            });
            let cartCount = await cartHelpers.getCartCount(req.session.user._id)
            let onePro = await productHelpers.getAllProduct(req.params.id)
            let product = await productHelpers.getProductDetails(id)
            if (product.stock <= 10 && product.stock != 0) {
                product.fewStock = true;
            } else if (product.stock == 0) {
                product.noStock = true;
            }
            res.render('user/product-view', { user: true, product, category, product, productss, products, onePro, userss, users: true, cartCount, zoom: true, person })
        } catch (error) {
            res.redirect('/wrong')
        }
    },

    ///////////////////////////////////////   Cart  /////////////////////////////////////////////////////////////////


    viewCartGet: async (req, res) => {
        try {
            let users = req.session.user
            let userss = req.session.user
            let person = await userHelpers.getUser(userss._id)
            let cartCount = await cartHelpers.getCartCount(req.session.user._id)
            let totalValue = await cartHelpers.getTotalAmount(req.session.user._id)
            console.log(totalValue);
            let category = await categoryHelpers.getAllCategory()
            let products = await cartHelpers.getCartList(req.session.user._id)
            const userId = await req.session.user._id
            res.render('user/view-cart', { user: true, category, products, cartCount, totalValue, userId, users, person })

        } catch (error) {
            console.log('somthing wrong in view cart get');

        }
    },

    addToCartGet: async (req, res) => {
        try {
            let user = req.session.user;
            let proQuantity = await cartHelpers.findCartProdQty(req.session.user._id, req.params.id)
            let product = await productHelpers.findStock(req.params.id);
            if (product.stock == 0) {
                res.json({ status: "noStock" });
            } else if (product.stock == proQuantity) {
                res.json({ status: "fewStock" });
            } else if (proQuantity == 3) {
                res.json({ status: "maxLimitStock" });
            } else {
                if (user) {
                    cartHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
                        res.json({ status: "add" });
                    });
                } else {
                    res.json({ status: "login" });
                }
            }
        } catch (error) {
            console.log('somthing wrong in addToCartGet');

        }
    },

    changeProductQuantityPost: async (req, res, next) => {
        try {
            var obj = req.body
            obj.user = await req.session.user._id
            cartHelpers.changeProductQuantity(obj).then(async (response) => {
                total = await cartHelpers.getTotalAmount(req.session.user._id)
                //resposnill varunna data convert cheyyunne ennitte json pass cheyyunnu
                response.total = total
                res.json(response)
            }).catch((response) => {
                if (response.status || response.noStock) {
                    res.json({ noStock: true });
                } else {
                    res.json({ maxLimitStock: true });
                }
            })

        } catch (error) {
            console.log('somthing wrong in changeProductQuantityPost ');

        }
    },

    ////////////////////////////////////////// Order ///////////////////////////////////////////////////////////

    placeOrderGet: async (req, res) => {
        try {
            let users = req.session.user
            let userss = req.session.user

            let person = await userHelpers.getUser(userss._id)
            let cartCount = await cartHelpers.getCartCount(req.session.user._id)
            let eachAddress = await addressHelpers.getAddressbyId(users._id)
            let address = await userHelpers.getAllAddress(req.session.user._id)
            let alladdress = address.address
            let total = await cartHelpers.getTotalAmount(req.session.user._id)
            let wallet = false
            if (total <= person.wallet) {
                wallet = true
            }
            let product = await categoryHelpers.getAllCategoryProduct(req.params.id)
            let cartsProducts = await cartHelpers.getCartList(req.session.user._id)
            let category = await categoryHelpers.getAllCategory()
            let listcoupon = await couponHelpers.getAllCoupons()
            console.log('351 = ', listcoupon);
            res.render('user/place-order', { user: true, wallet, category, total, user: req.session.user, cartsProducts, product, users, cartCount, eachAddress, alladdress, person, listcoupon })
        } catch (error) {
            console.log('somthing wrong in placeOrderGet ');
        }
    },

    placeOrderPost: async (req, res) => {
        try {
            let products = await cartHelpers.getCartProductList(req.session.user._id)
            if (req.session.couponTotal) {
                totalPrice = req.session.couponTotal
                req.session.couponTotal = null
            } else {
                totalPrice = await cartHelpers.getTotalAmount(req.body.userId)
            }
            console.log('347 ', req.body);
            cartHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
                console.log(orderId, 'cod');
                if (req.body['payment-method'] === 'COD' || req.body['payment-method'] === 'wallet') {
                    res.json({ codStatus: true })
                } else if (req.body['payment-method'] === 'paypal') {
                    paymentHelpers.genaretePaypal(orderId, totalPrice).then((link) => {
                        paymentHelpers.changePaymentStatus(orderId).then(() => {
                            res.json({ link, paypal: true })
                        })
                    })
                } else if (req.body['payment-method'] == 'razorpay') {
                    paymentHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
                        console.log(response, 'responsee');
                        console.log(orderId, "ordeereeee");
                        res.json(response)
                    })
                }
            })
        } catch (error) {
            console.log(error)
            console.log('somthing wrong in  placeOrderPost');
        }
    },

    verifyPaymentPost: (req, res) => {
        try {
            paymentHelpers.verifyPayment(req.body).then(() => {
                console.log(req.body, 'rq.body')
                paymentHelpers.changePaymentStatus(req.body.order.receipt).then(() => {
                    console.log('success full');
                    res.json({ status: true })
                })
            }).catch((err) => {
                console.log(err, 'is the error in the user.js verify payment');
                res.json({ status: false, erMsg: 'payment failed' })
            })
        } catch (error) {
            console.log('somthing wrong in verifyPaymentPost ');
        }
    },

    myOrderGet: async (req, res) => {
        try {
            let users = req.session.user
            let userss = req.session.user
            let person = await userHelpers.getUser(userss._id)
            let category = await categoryHelpers.getAllCategory()
            let cartCount = await cartHelpers.getCartCount(req.session.user._id)
            let order = await orderHelpers.getOrderProduct(req.session.user._id)
            order.forEach(element => {
                let a = element.date.toISOString().split('T')[0]
                console.log(a);
                element.date = a;
            });
            order.forEach(element => {
                if (element.status == "delivered") {
                    element.delivered = true;
                } else if (element.status == "cancelled") {
                    element.cancelled = true;
                } else if (element.status == "returned") {
                    element.returned = true;
                }
            });
            res.render('user/myorder', { user: true, users, userss, category, cartCount, order, person, order })
        } catch (error) {
            console.log('somthing wrong in myOrderGet ');
        }
    },

    removeFromCartGet: (req, res) => {
        cartHelpers.removeFromCart(req.params.id, req.session.user._id).then((response) => {
            res.json({ status: true })
        })
    },

    cancelOrderIdGet: (req, res) => {
        userHelpers.orderCancel(req.params.id).then(() => {
            res.redirect('/myorder')
        })
    },

    reterunOrderIdGet: (req, res) => {
        userHelpers.orderReturn(req.params.id).then(() => {
            res.redirect('/myorder')
        })
    },

    paymentSuccesGet: (req, res) => {
        res.render('user/payment-success')
    },

    orderedproductGet: async (req, res) => {
        try {
            let users = req.session.user
            let userss = req.session.user
            let person = await userHelpers.getUser(userss._id)
            let cartCount = await cartHelpers.getCartCount(req.session.user._id)
            let category = await categoryHelpers.getAllCategory()
            let orderId = req.params.id
            console.log(orderId, 'ooooooooooooooooooooooooooooooooooooooooooo');
            let orderItems = await orderHelpers.getOrderProductList(orderId)
            let orderdetails = await orderHelpers.getOrderDetail(orderId)
            orderdetails.date = moment(orderdetails.date).format("lll");
            console.log(orderdetails, 'iiiiiiiiiiooooooooopppppppp');
            // let coupId=req.params.id
            // let coupon=await couponHelpers.getCoupon(coupId)
            // console.log('allCoupon',coupon);
            console.log(orderItems, 'koiiiiiiiiiiiiiii');
            res.render('user/ordered-products', { orderItems, user: true, users, userss, category, zoom: true, cartCount, orderdetails, person })
        } catch (error) {
            console.log('somthing wrong in  orderedproductGet');
        }
    },

    addressGet: (req, res) => {
        res.render('user/address')
    },

    addressPost: (req, res) => {
        try {
            let userID = req.session.user._id
            addressHelpers.addAddress(userID, req.body).then(() => {
                res.redirect('/place-order')
            })
        } catch (error) {
            res.redirect('/wrong')
        }
    },

    //////////////////////////////////////  Profile  ///////////////////////////////////////////////////////////

    profileGet: async (req, res) => {
        try {
            let userss = req.session.user
            let users = req.session.user
            let userId = req.session.user._id
            let category = await categoryHelpers.getAllCategory()
            let address = await userHelpers.getAddressDetails()
            let cartCount = await cartHelpers.getCartCount(req.session.user._id)
            let userAddress = await addressHelpers.getAllAddress(userId)
            let person = await userHelpers.getUser(users._id)

            let add = userAddress.address
            res.render('user/profile', { user: true, category, userss, users, address, cartCount, person, userAddress, add, passErr: req.session.changePasswordError })
            req.session.changePasswordError = false
        } catch (error) {
            console.log('somthing wrong in profileGet ');
        }
    },


    changePasswordPost: async (req, res) => {
        try {
            let userId = req.session.user._id;
            let enteredPassword = req.body.old;
            let newPassword = req.body.new;
            let confirmPassword = req.body.confirm

            if (newPassword == confirmPassword) {
                let userdetails = await userHelpers.getUser(userId)
                bcrypt.compare(enteredPassword, userdetails.Password).then((status) => {
                    if (status) {
                        userHelpers.changePassword(userId, newPassword).then((response) => {
                            req.session.success = true
                            res.redirect('/profile')
                        })
                    }
                })
            } else {
                req.session.changePasswordError = "Entered wrong password pleace enter same password";
                res.redirect('/profile')
            }
        } catch (error) {
            console.log('somthing wrong in changePasswordPost ');
        }
    },

    userAddressPost: (req, res) => {
        try {
            let userID = req.session.user._id
            addressHelpers.addAddress(userID, req.body).then(() => {
                res.redirect('/profile')
            })
        } catch (error) {
            res.redirect('/wrong')
        }
    },

    editProfilePost: (req, res) => {
        let userID = req.params.id
        userHelpers.updateProfile(userID, req.body).then(async (data) => {
            try {
                if (req.files.profileImg) {
                    let image = req.files?.profileImg
                    await image.mv(`./public/assets/product-images/${userID}.jpg`, (err, succ) => {
                        if (err) {
                            console.warn(err)
                        } {
                            console.log('success')
                        }
                    })
                }
                res.redirect('/profile')
            }
            catch (err) {
                res.redirect('/profile')
            }
        })
    },

    editUserAddressPost: (req, res) => {
        try {
            addressHelpers.editAddress(req.params.id, req.body).then((response) => {
                console.log(req.body);
                res.redirect('/profile')

            })
        } catch (error) {
            res.redirect('/wrong')
        }
    },

    DeleteAdressGet: (req, res) => {
        try {
            let userId = req.session.user._id
            let id = req.params.id
            addressHelpers.deleteAddress(userId, id).then((response) => {
                res.redirect('/profile')
            })
        } catch (error) {
            res.redirect('/wrong')
        }
    },

    DeleteAdress2Get: (req, res) => {
        try {
            let userId = req.session.user._id
            let id = req.params.id
            addressHelpers.deleteAddress(userId, id).then((response) => {
                res.redirect('/place-order')
            })
        } catch (error) {
            res.redirect('/wrong')
        }
    },

    postApplyCoupon: async (req, res) => {
        try {
            console.log(req.body);
            let id = req.session.user._id
            let coupon = req.body.coupon
            let totalAmount = await cartHelpers.getTotalAmount(req.session.user._id)
            couponHelpers.validateCoupon(req.body, id, totalAmount).then((response) => {
                req.session.couponTotal = response.total
                if (response.success) {
                    console.log(response);
                    console.log('success');
                    res.json({ couponSuccess: true, total: response.total, discountValue: response.discountValue, coupon, resCoupon: response })
                } else if (response.couponUsed) {
                    res.json({ couponUsed: true })
                }
                else if (response.couponExpired) {
                    console.log('expired');
                    res.json({ couponExpired: true })
                }
                else {
                    res.json({ invalidCoupon: true })
                }
            })
        } catch (error) {
            console.log('somthing wrong in  ');
        }
    },

    viewWalletHistory: async (req, res) => {
        try {
            console.log('hii');

            let userId = req.session.user._id
            let user = await userHelpers.getUserDetails(userId)
            if (user.walletHistory == undefined) {
                user.walletHistory == false
            } else {
                user.walletHistory.forEach(element => {
                    let a = element.date.toISOString().split('T')[0]
                    console.log(a);
                    element.date = a;
                });
            }
            console.log(user.walletHistory, 'oooooo');


            console.log(user, 'userrrrrrrrr');
            let users = req.session.user
            let userss = req.session.user
            let person = await userHelpers.getUser(userss._id)
            let category = await categoryHelpers.getAllCategory()
            let cartCount = await cartHelpers.getCartCount(req.session.user._id)
            res.render('user/walletHistory', { user: true, user, userss, person, category, users, cartCount })
        } catch (error) {
            console.log(error);
            res.redirect('/wrong')

        }
    },

    wrongGet: async (req, res) => {
        res.render('user/wrong')
    },

    ////////////////////////////////////////////// LogOut /////////////////////////////////////////////////////////////

    logOutGet: (req, res) => {
        req.session.loggedIn = null
        req.session.user = null
        res.redirect('/')
    },
};

module.exports = userController;