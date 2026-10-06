const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const controller = require('../controllers/workoutSessionController');

router.post('/', requireAuth, controller.createSession);
router.get('/', requireAuth, controller.listSessions);
router.get('/:id', requireAuth, controller.getSessionDetail);
router.post('/:id/sets', requireAuth, controller.addSet);
router.patch('/:id/sets/:setId', requireAuth, controller.updateSet);
router.delete('/:id/sets/:setId', requireAuth, controller.deleteSet);

module.exports = router;
