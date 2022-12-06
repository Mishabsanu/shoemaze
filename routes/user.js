var express = require('express');
const userController = require('../cantrollers/userController');
const adminController = require('../cantrollers/adminController');
const userHelpers = require('../helpers/user-helpers');
var router = express.Router();
// Checking Whether the user is loggedIn
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}
const verifyBlock= async(req,res,next)=>{
  let user= await userHelpers.getUser(req.session.user._id)
  if(user.blocked){
    req.session.loggedIn = null
    req.session.user = null
    res.redirect('/login')
  }else{
    next()
  }
}

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})


router.get('/', userController.homePage);

router.get('/login',userController.userLoginGet); 

router.post('/login',userController.userLoginPost);

router.get('/logout',userController.logOutGet)

router.get('/signup', userController.userSignupGet);

router.post('/signup',userController.userSignupPost);

router.get('/otp',userController.otpPageGet);

router.post('/get-otp',userController.getOtpPost);

router.post('/submit-otp',userController.submitOtpPost);

router.get('/product-view/:id',verifyLogin,userController.productViewGetId);

router.get('/all-product',verifyLogin,userController.allProductGet);

router.get('/show-category/:id',verifyLogin,userController.showCategoryIdGet);

router.get('/view-cart',verifyBlock,verifyLogin,userController.viewCartGet);

router.get('/add-to-cart/:id',verifyBlock,verifyLogin,userController.addToCartGet)
;
router.patch('/change-product-quantity',verifyLogin,userController.changeProductQuantityPost);

router.get('/place-order',verifyBlock,verifyLogin,userController.placeOrderGet);

router.post('/place-order',verifyBlock,verifyLogin,userController.placeOrderPost);

router.get('/myorder',verifyLogin,userController.myOrderGet);

router.post('/verify-payment',verifyLogin,userController.verifyPaymentPost);

router.get('/cancel-Order/:id',verifyLogin,userController.cancelOrderIdGet);

router.get('/order-return/:id',verifyLogin,userController.reterunOrderIdGet);

router.get('/removefromcart/:id',userController.removeFromCartGet);

router.get('/payment-success',verifyLogin,userController.paymentSuccesGet);

router.get('/ordered-products/:id',verifyLogin,userController.orderedproductGet);

router.get('/address',userController.addressGet);

router.post('/address',userController.addressPost);

router.get('/profile',verifyBlock,verifyLogin,userController.profileGet);

router.post('/change-password',verifyLogin,userController.changePasswordPost);

router.post('/useraddress',userController.userAddressPost);

router.post('/edit-profile/:id',userController.editProfilePost);

router.post('/edit-user-address/:id',userController.editUserAddressPost);

router.get('/deleteAdress/:id',userController.DeleteAdressGet);

router.get('/deleteAdress2/:id',userController.DeleteAdress2Get);

router.post('/coupon-apply',userController.postApplyCoupon);

router.get('/walletHistory', userController.viewWalletHistory);

router.get('/wrong', userController.wrongGet);




module.exports = router;


