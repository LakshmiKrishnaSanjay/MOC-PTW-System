import express from 'express';
import Item from '../models/Item.js';
import auth from '../middleware/auth.js';
import restrictTo from '../middleware/role.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

/**
 * GET /api/items
 * HSE and Contractor both can see all items
 * Optional filters: type, status, search
 */
router.get('/', async (req, res) => {
  try {
    const { type, status, search } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const items = await Item.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username role')
      .lean();

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/items/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('createdBy', 'username role')
      .lean();

    if (!item) return res.status(404).json({ message: 'Not found' });

    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/items
 * Only HSE can create items
 */
router.post('/', async (req, res) => {
  try {
    if (req.user.role !== 'HSE') {
      return res.status(403).json({ message: 'Only HSE can create items' });
    }

    const item = await Item.create({
      ...req.body,
      createdBy: req.user.id,
      status: 'Draft',
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * PUT /api/items/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });

    const { status, title, description } = req.body;

    if (req.user.role === 'Contractor') {
      if (status === 'Submitted' && item.status === 'Draft') {
        item.status = 'Submitted';
        item.submittedAt = new Date();
      } else {
        return res.status(403).json({ message: 'Contractors cannot edit this item' });
      }
    } else {
      if (title) item.title = title;
      if (description !== undefined) item.description = description;
      if (status) item.status = status;
    }

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * PUT /api/items/:id/approve
 */
router.put('/:id/approve', restrictTo('HSE'), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });

    item.status = 'Approved';
    item.reviewedAt = new Date();
    await item.save();

    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * PUT /api/items/:id/reject
 */
router.put('/:id/reject', restrictTo('HSE'), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });

    item.status = 'Rejected';
    item.reviewedAt = new Date();
    await item.save();

    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// Update item by ID
router.put("/:id", auth, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
/**
 * DELETE /api/items/:id
 * Only HSE can delete items
 */
router.delete('/:id', restrictTo('HSE'), async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
