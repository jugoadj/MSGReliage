const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/userController');

//auth
router.post("/register", authController.signUp);
router.post("/login", authController.signIn);
router.get("/logout", authController.logOut);

//user display
router.get("/", userController.getAllUsers);
router.get("/:id", userController.userInfo);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

//reset password email
router.post('/trustedemail', authController.demanderResetMotDePasse);
router.post('/resetpassword', authController.resetMotDePasse);

//reset password email
router.post('/secretquestion', authController.getSecretQuestion);
router.post('/resetpassword2', authController.resetPasswordWithSecretAnswer);



module.exports = router;