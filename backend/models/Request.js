import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema({
  contractor: 
  {
     type: mongoose.Schema.Types.ObjectId, 
     ref: "User", 
     required: true },
  item:   
  { 
     type: mongoose.Schema.Types.ObjectId, 
     ref: "Item", 
     required: true },
  requestedBy: 
  {   
     type: mongoose.Schema.Types.ObjectId, 
     ref: "User", 
     required: true },
  status: 
  {  
    type: String, enum: ['Pending', 'Accepted', 'Rejected'], 
    default: 'Pending' },
  createdAt:
 {  
    type: Date, 
    default: Date.now },
});

export default mongoose.models.Request || mongoose.model("Request", RequestSchema);
