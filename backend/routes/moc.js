import express from "express";
import Item from "../models/Item.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Protect all routes
router.use(auth);

// ==================== CREATE MOC ====================
// POST /api/items
router.post("/", async (req, res) => {
  try {
    const { type } = req.body;

    if (type === "MOC") {
      // Only Contractors can create MOC
      if (req.user.role !== "Contractor") {
        return res.status(403).json({ message: "Only Contractors can create MOC" });
      }
    } else if (type === "PTW") {
      // Only HSE can create PTW
      if (req.user.role !== "HSE") {
        return res.status(403).json({ message: "Only HSE can create PTW" });
      }

      // PTW can only be created if the linked MOC is Approved
      const moc = await Item.findById(req.body.mocId);
      if (!moc || moc.status !== "Approved") {
        return res.status(400).json({ message: "PTW can only be created from approved MOC" });
      }
    } else {
      return res.status(400).json({ message: "Invalid item type" });
    }

    const itemData = {
      ...req.body,
      createdBy: req.user.id,
      status: "Draft",
    };

    const item = await Item.create(itemData);
    await item.populate("createdBy", "username email role");
    res.status(201).json(item);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


// ==================== GET MOC LIST ====================
router.get("/", async (req, res) => {
  try {
    if (req.user.role === "Contractor") {
      const mocs = await Item.find({ type: "MOC", createdBy: req.user.id })
        .sort({ createdAt: -1 })
        .populate("createdBy", "username email role")
        .lean();
      return res.json(mocs);
    } else if (req.user.role === "HSE") {
      const mocs = await Item.find({ type: "MOC" })
        .sort({ createdAt: -1 })
        .populate("createdBy", "username email role")
        .lean();
      // Only show contractor-created MOCs
      const contractorMOCs = mocs.filter(m => m.createdBy.role === "Contractor");
      return res.json(contractorMOCs);
    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/contractor", auth, async (req, res) => {
  try {
    // Only allow contractors
    if (req.user.role !== "Contractor") {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    const mocs = await Item.find({ type: "MOC", createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email role")
      .lean();

    res.json(mocs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch MOCs" });
  }
});
// ==================== GET SINGLE MOC ====================
router.get("/:id", async (req, res) => {
  try {
    const moc = await Item.findById(req.params.id)
      .populate("createdBy", "username email role");

    if (!moc) return res.status(404).json({ message: "MOC not found" });

    res.json(moc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ==================== SUBMIT MOC ====================
router.put("/:id/submit", async (req, res) => {
  try {
    const moc = await Item.findById(req.params.id);

    if (!moc) return res.status(404).json({ message: "MOC not found" });
    if (moc.status !== "Draft") {
      return res.status(400).json({ message: "Only Draft MOCs can be submitted" });
    }

    moc.status = "Submitted";
    moc.submittedAt = new Date();

    await moc.save();

    // Populate createdBy for response
    await moc.populate("createdBy", "username email role");

    res.json(moc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/moc/:id/approve
router.put("/:id/approve", async (req, res) => {
  try {
    const moc = await Item.findById(req.params.id);
    if (!moc) return res.status(404).json({ message: "MOC not found" });
    if (moc.status !== "Submitted") return res.status(400).json({ message: "Only submitted MOCs can be approved" });

    moc.status = "Approved";
    moc.reviewedAt = new Date();
    await moc.save();

    res.json(moc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/moc/:id/reject
router.put("/:id/reject", async (req, res) => {
  try {
    const moc = await Item.findById(req.params.id);
    if (!moc) return res.status(404).json({ message: "MOC not found" });
    if (moc.status !== "Submitted") return res.status(400).json({ message: "Only submitted MOCs can be rejected" });

    moc.status = "Rejected";
    moc.reviewedAt = new Date();
    await moc.save();

    res.json(moc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// PUT /api/items/:id/accept
router.put("/:id/accept", auth, async (req, res) => {
  try {
    const ptw = await Item.findById(req.params.id);
    if (!ptw) return res.status(404).json({ message: "PTW not found" });

    if (req.user.role !== "Contractor") {
      return res.status(403).json({ message: "Only Contractors can accept PTW" });
    }

    if (ptw.status !== "Approved") {
      return res.status(400).json({ message: "Only Approved PTWs can be accepted" });
    }

    ptw.status = "Job Started";
    ptw.acceptedAt = new Date();
    await ptw.save();

    res.json(ptw);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET PTW by MOC ID
// GET /api/ptws/moc/:mocId
router.get("/moc/:mocId", async (req, res) => {
  try {
    const { mocId } = req.params;

    const ptw = await Item.findOne({ type: "PTW", mocId })
      .populate("createdBy", "username email role")      // Contractor who owns MOC
      .populate("ptwCreatedBy", "username email role")   // HSE who created PTW
      .lean();

    if (!ptw) return res.status(404).json({ message: "PTW not found for this MOC" });

    res.json(ptw);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch PTW" });
  }
});


router.put("/:id/accept", async (req, res) => {
  try {
    const ptw = await Item.findById(req.params.id);
    if (!ptw) return res.status(404).json({ message: "PTW not found" });

    if (ptw.status !== "Approved") {
      return res.status(400).json({ message: "Only Approved PTWs can be accepted" });
    }

    ptw.status = "Job Started";
    ptw.acceptedAt = new Date();
    await ptw.save();

    res.json(ptw);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to accept PTW" });
  }
});


router.get("/job-started", async (req, res) => {
  try {
    const contractorId = req.user._id;

    const jobs = await Item.find({
      createdBy: contractorId,
      status: "Job Started",
    }).sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching jobs" });
  }
});


router.get("/jobStarted", auth, async (req, res) => {
  try {
    // Fetch only jobs where status is "Job Started"
    const jobs = await Item.find({ status: "Job Started" })
      .populate("createdBy", "username role") // get contractor username
      .populate("assignedTo", "username role") // optional: assigned HSE
      .sort({ createdAt: -1 }); // newest first

    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch Job Started items" });
  }
});



export default router;