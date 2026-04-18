const express = require('express');
const router = express.Router();
const  userAccessController  = require('../controller/userAccessController');

router.post('/addUser', userAccessController.addUser);

router.get('/getUser', userAccessController.getUser);

router.post('/adminLogin',userAccessController.adminLogin);

router.put('/updateUser/:id', userAccessController.updateUser);

router.delete('/deleteUser/:id',userAccessController.deleteUser);

router.post('/loginUser',userAccessController.loginUser);

router.put('/userProfileUpdate',userAccessController.updateLoggeINUserProfile);

router.post('/userPreferredAddress/:id',userAccessController.addPrefferedAddress);

router.post('/removeAddress/:id',userAccessController.removeAddress);

router.post('/save-token',userAccessController.savetoken);


module.exports = router;