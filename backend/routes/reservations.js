const router = require('express').Router();
const { create, getAll, getMine, update, remove, stats } = require('../controllers/reservationController');
const { protect, staffOrAdmin } = require('../middleware/auth');

router.post('/', create);
router.get('/', protect, staffOrAdmin, getAll);
router.get('/mine', protect, getMine);
router.get('/stats', protect, staffOrAdmin, stats);
router.put('/:id', protect, staffOrAdmin, update);
router.delete('/:id', protect, staffOrAdmin, remove);

module.exports = router;
