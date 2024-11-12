import mongoose,{Schema} from "mongoose";

const RoleSchema =new Schema({
    name:{type:String, required:true},
    code:{type:String, required:true},
    permission:[
        {
            "transaction":[],
            "package":[],
            "category":[]
        }
    ]
})

const EmployeeRole = mongoose.model("EmployeeRole",RoleSchema);
export default EmployeeRole;
