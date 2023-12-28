const router = require('express').Router();
const emailController = require ('../controllers/email.controller.js');

router.post('/save', emailController.saveSendEmails);
//router.post('/save-draft', emailController.saveSendEmails);

router.post('/inbox', emailController.getReceivedEmails);
router.get('/sentemails/:email', emailController.getSentEmails);

router.post('/starred/:email', emailController.toggleStarredEmail);
router.post('/unstarred/:email', emailController.untoggleStarredEmail);
router.get('/starreddisplay/:email', emailController.getStarredEmails);

router.post('/bin/:email', emailController.moveEmailsToBin);
router.post('/unbin/:email', emailController.removeEmailsFromBin);
router.get('/bindisplay/:email', emailController.displayBinEmails);

router.put('/delete/:email', emailController.deleteEmail);



module.exports = router;