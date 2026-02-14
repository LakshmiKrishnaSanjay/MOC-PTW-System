import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
  type: {
    type: String,
    enum: ["MOC", "PTW"],
    required: [true, "Type is required"],
  },
  status: {
    type: String,
    enum: ["Draft", "Submitted", "Approved", "Rejected", "Job Started"],
    default: "Draft",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // HSE manager assigned to review or issue PTW
  },
  reasonForChange: { type: String, default: "" }, // Reason for change
  pros: { type: String, default: "" }, // Benefits
  cons: { type: String, default: "" }, // Disadvantages
  riskFactor: { type: String, default: "" }, // Risk factor
  submittedAt: {
    type: Date, // When contractor submits MOC or HSE issues PTW
  },
  reviewedAt: {
    type: Date, // When HSE approves/rejects MOC or acknowledges PTW
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  mocId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Item" // links PTW to the MOC
  },
});

// Virtual to check if contractor can edit MOC (only Draft)
ItemSchema.virtual("isEditable").get(function () {
  return this.status === "Draft" && this.type === "MOC";
});

// Virtual to check if HSE can review MOC
ItemSchema.virtual("isReviewable").get(function () {
  return this.status === "Submitted" && this.type === "MOC";
});

// Virtual to check if PTW can be issued
ItemSchema.virtual("canIssuePTW").get(function () {
  return this.type === "MOC" && this.status === "Approved";
});

// Ensure virtuals are included when converting to JSON
ItemSchema.set("toJSON", { virtuals: true });
ItemSchema.set("toObject", { virtuals: true });

export default mongoose.models.Item || mongoose.model("Item", ItemSchema);
