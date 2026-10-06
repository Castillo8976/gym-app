const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const leagueController = require('../controllers/leagueController');

router.get('/', requireAuth, leagueController.listLeagues);
router.post('/', requireAuth, leagueController.createLeague);
router.post('/:id/join', requireAuth, leagueController.joinLeague);
router.get('/:id/members', requireAuth, leagueController.getLeagueMembers);

module.exports = router;
