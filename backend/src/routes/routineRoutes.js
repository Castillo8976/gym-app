const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const routineController = require('../controllers/routineController');

router.get('/', requireAuth, routineController.listRoutines);
router.post('/', requireAuth, routineController.createRoutine);
router.get('/:id', requireAuth, routineController.getRoutine);
router.post('/:id/apply', requireAuth, routineController.applyRoutine);

module.exports = router;
