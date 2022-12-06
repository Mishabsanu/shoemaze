var express = require('express');
var router = express.Router();
const adminController = require('../cantrollers/adminController');
const orderHelpers = require('../helpers/order-helpers');

///////////////////////////////// Login Credentials ////////////////////////
const credentials = {
  email: "admin@gmail.com",
  password: "admin"
}

//////////////////////////////// Check Admin Logged In //////////////////////////////////
const verifyLogin1 = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next()
  } else {
    res.redirect('/admin')
  }
}

router.get('/', adminController.mainPageGet);

router.get('/admin-login', adminController.adminLoginGet);

router.post('/adminlogin', adminController.adminLoginPost);

router.get('/admin-dashboard',verifyLogin1, adminController.adminDashboardGet);

router.get('/list-product/:id',verifyLogin1, adminController.listProductGet);

router.get('/list-user',verifyLogin1,adminController.listUserGet);

router.get('/list-category', adminController.listCategoryGet);

router.get('/list-order',verifyLogin1, adminController.listOrderGet);

router.get('/add-category',verifyLogin1, adminController.addCategoryGet);

router.post('/add-category',verifyLogin1, adminController.addCategoryPost);

router.get('/add-product',verifyLogin1, adminController.addProductGet);

router.post('/add-product',verifyLogin1, adminController.addProductPost);

router.get('/delete-product/:id',verifyLogin1, adminController.deleteProductIdGet);

router.get('/delete-category/:id',verifyLogin1, adminController.deleteCategoryIdGet);

router.get('/changestatus',verifyLogin1, adminController.changeStatusGet);

router.post('/change-status',verifyLogin1, adminController.changeStatusPost);

router.get('/edit-category/:id',verifyLogin1, adminController.editCategoryGet);

router.post('/edit-category/:id',verifyLogin1, adminController.editCategoryPost);

router.get('/edit-product/:id',verifyLogin1, adminController.editProductGet);

router.post('/edit-product/:id',verifyLogin1, adminController.editProductPost);

router.post('/edit-status/:id',verifyLogin1, adminController.editStatusPost);

router.get('/admin-dashbord',verifyLogin1, adminController.adminDashboardGet);

router.get('/admin-dashbord/day', adminController.adminDashboardGetday);

router.post('/admin-dashbord/graphdata',verifyLogin1, adminController.adminDashboardPostDataGrapgh);

router.get('/sale-report',verifyLogin1, adminController.getSalesReport);

router.get('/view-details/:id',verifyLogin1,adminController.getviewdetails);

router.get('/add-categoryoffer',verifyLogin1, adminController.addCategorOfferyGet);

router.post('/add-categoryoffer',verifyLogin1, adminController.addCategorOfferyPost);

router.get('/list-coupon',verifyLogin1,adminController.getlistCoupon);

router.get('/add-coupon',verifyLogin1,adminController.getAddCoupon);

router.post('/add-coupon',verifyLogin1,adminController.postAddCoupon);
router.get('/add-productoffer',verifyLogin1, adminController.addProductOfferGet);

router.post('/add-productoffer',verifyLogin1, adminController.addProductOfferPost);

router.get('/edit-productoffer/:_id',verifyLogin1, adminController.editProductOfferGet);

router.post('/edit-productoffer/:_id',verifyLogin1, adminController.editProductOfferPost);

router.get('/delete-productoffer/:_id',verifyLogin1, adminController.deleteProductOfferGet);

router.get('/edit-categoryOffer/:id',verifyLogin1, adminController.editCategorOfferyGet);

router.post('/edit-categoryOffer/:id',verifyLogin1, adminController.editCategorOfferyPost);

router.get('/delete-categoryOffer/:id',verifyLogin1, adminController.deleteCategorOfferyIdGet);

router.delete('/deleteCoupon',adminController.DeleteCouponDelete);

router.get('/adminlogout',adminController.adminLogOut);


module.exports = router;
