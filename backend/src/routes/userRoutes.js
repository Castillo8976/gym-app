const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const userController = require('../controllers/userController');
const rankController = require('../controllers/rankController');

router.get('/me', requireAuth, userController.getMe);
router.patch('/me', requireAuth, userController.updateMe);
router.get('/me/last-sets', requireAuth, userController.getLastSets);
router.get('/me/rest-preferences', requireAuth, userController.getRestPreferences);
router.patch('/me/rest-preferences', requireAuth, userController.updateRestPreferences);
router.get('/me/plate-config', requireAuth, userController.getPlateConfig);
router.put('/me/plate-config', requireAuth, userController.upsertPlateConfig);
router.post('/me/plate-config/suggest', requireAuth, userController.suggestPlateStack);
router.get('/me/ranks', requireAuth, rankController.getMyRanks);
router.get('/me/records', requireAuth, rankController.getMyRecords);

module.exports = router;
