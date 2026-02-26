const router = require('express').Router();
const { create, getAll, getMine, getOne, update, remove, stats, confirmPayment } = require('../controllers/orderController');
const { protect, staffOrAdmin, adminOnly } = require('../middleware/auth');

router.post('/', create);
router.get('/mine', protect, getMine);
router.get('/stats', protect, staffOrAdmin, stats);

// Public – called by frontend after PayHere return_url redirect
router.post('/:id/confirm-payment', confirmPayment);

router.get('/', protect, staffOrAdmin, getAll);
router.get('/:id', getOne);
router.put('/:id', protect, staffOrAdmin, update);
router.delete('/:id', protect, adminOnly, remove);

module.exports = router;
