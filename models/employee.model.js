import mongoose,{Schema} from "mongoose";

const EmployeeSchema=new Schema({
    name:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    roleId:{type:Schema.Types.ObjectId, ref:"EmployeeRole", required:true},
    createdBy:{type:Schema.Types.ObjectId, ref:"User", required:true},
    active:{type:Boolean, default:false}
},{timestamps:true});
 
const Employee = mongoose.model("Employee",EmployeeSchema);
export default Employee;