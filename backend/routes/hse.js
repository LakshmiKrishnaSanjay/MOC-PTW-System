import express from 'express';
import auth from '../middleware/auth.js';
import restrictTo from '../middleware/role.js';
import User from '../models/User.js';
import Request from '../models/Request.js';


const router = express.Router();

// All routes in this file require authentication
router.use(auth);

// GET /api/contractors
// Only HSE can see the list of contractors
router.get(
  '/',
  restrictTo('HSE'),
  async (req, res) => {
    try {
      console.log(`[GET /api/contractors] Accessed by ${req.user.username} (${req.user.role})`);

      const contractors = await User.find({ role: 'Contractor' })
        .select('-password -__v')
        .sort({ username: 1 })
        .lean();

      res.json(contractors);
    } catch (err) {
      console.error('Error fetching contractors:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET /api/contractors/:id
router.get(
  '/:id',
  restrictTo('HSE'),
  async (req, res) => {
    try {
      const contractor = await User.findById(req.params.id)
        .select('-password -__v')
        .lean();

      if (!contractor) {
        return res.status(404).json({ message: 'Contractor not found' });
      }

      // Optional: only allow seeing contractors (not HSE or admin)
      if (contractor.role !== 'Contractor') {
        return res.status(403).json({ message: 'Not a contractor account' });
      }

      res.json(contractor);
    } catch (err) {
      console.error('Error fetching contractor:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// POST /api/requests
// Body: { contractorId, itemId }
router.post('/sendRequests', restrictTo('HSE'), async (req, res) => {
  const { contractorId, itemId } = req.body;

  const request = await Request.create({
    contractor: contractorId,
    item: itemId,
    requestedBy: req.user.id,
    status: 'Pending'
  });

  res.status(201).json(request);
});


export default router;