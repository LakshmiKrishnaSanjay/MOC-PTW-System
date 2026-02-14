// routes/requests.js
import express from "express";
import Request from "../models/Request.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// ====================== CREATE REQUEST ======================
router.post("/", auth, async (req, res) => {
  const { contractorId, itemId } = req.body;

  if (!contractorId || !itemId) {
    return res.status(400).json({ message: "Missing contractor or item" });
  }

  try {
    const request = await Request.create({
      contractor: contractorId,
      item: itemId,
      requestedBy: req.user.id, // logged-in HSE
      status: "Pending",
    });

    // Populate item & requestedBy before sending
    await request
      .populate("item", "title type")
      .populate("requestedBy", "username email")
      .populate("contractor", "username");

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ====================== GET REQUESTS ======================
router.get("/", auth, async (req, res) => {
  try {
    let requests;

    if (req.user.role === "Contractor") {
      // Contractor sees only their requests
      requests = await Request.find({ contractor: req.user.id });
    } else {
      // HSE sees all requests
      requests = await Request.find();
    }

    requests = await Request.populate(requests, [
      { path: "item", select: "title type" },
      { path: "requestedBy", select: "username email" },
      { path: "contractor", select: "username" },
    ]);

    requests.sort((a, b) => b.createdAt - a.createdAt); // newest first

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ====================== UPDATE REQUEST STATUS ======================
router.put("/:id", auth, async (req, res) => {
  try {
    const { status } = req.body;

    // Find request by ID
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Contractors can update only their own requests
    if (req.user.role === "Contractor" && String(request.contractor) !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this request" });
    }

    // HSE can update any request (optional: restrict only to certain status changes)
    request.status = status;
    await request.save();

    await request
      .populate("item", "title type")
      .populate("requestedBy", "username email")
      .populate("contractor", "username");

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// routes/requests.js
router.get("/:id", auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate("item", "title type description")
      .populate("requestedBy", "username email")
      .populate("contractor", "username");
    
    if (!request) return res.status(404).json({ message: "Request not found" });

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;
