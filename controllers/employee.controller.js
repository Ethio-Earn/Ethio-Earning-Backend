import Redis from "ioredis";
import Employee from "../models/employee.model.js";
import EmployeeRole from "../models/role.model.js";

const redisClient= new Redis(process.env.REDIS_URL);
export const getEmployees=async (req,res)=>{
    try {
        const cachedEmployees=await redisClient.get('employees');
        if (cachedEmployees){
            return res.status(200).json(JSON.parse(cachedEmployees));
        }

        const employees=await Employee.find()
            .populate('roleId','name')
            .populate('createdBy','name');
        await redisClient.set('employees',JSON.stringify(employees));
        res.status(200).json(employees);
    } catch (error) {
        res.status(404).json({message:error.message});
    }
}

export const getEmployeeById=async (req,res)=>{
    const {id}=req.params;
    if (!id){
        return res.status(400).json({message:'Id is required'});
    }
    try {
        const cachedEmployees=await redisClient.get(`employees:${id}`);
        if (cachedEmployees){
            return res.status(200).json(JSON.parse(cachedEmployees));
        }

        const employee=await Employee.findById(id)
            .populate('role','name')
            .populate('createdBy','name');
        res.status(200).json(employee);
    } catch (error) {
        res.status(404).json({message:error.message});
    }
}

export const addEmployee=async (req,res)=>{
    try {
        const {name,email,roleId}=req.body;
        const userId=req.user.id;
        const role=await EmployeeRole.findById(roleId);
        if (!role){
            return res.status(400).json({message:'Role does not exist'});
        }
        const newEmployee=new Employee({
            name,
            email,
            roleId,
            createdBy:userId
        });
        const exist=await Employee.findOne({email});
        if (exist){
            return res.status(400).json({message:'Employee already exist'});
        }
        const savedEmployee=await newEmployee.save();
        await redisClient.del('employees');
        await redisClient.del(`employees:${savedEmployee._id}`);
        res.status(201).json(savedEmployee);
    } catch (error) {
        res.status(400).json({message:error.message});
    }

}

export const updateEmployee=async (req,res)=>{
    const {id}=req.params;
    try {
        const updatedEmployee=await Employee.findByIdAndUpdate(id,req.body,{new:true});
        await redisClient.del('employees');
        await redisClient.del(`employees:${id}`);
        res.status(200).json(updatedEmployee);
    }
    catch (error) {
        res.status(400).json({message:error.message});
    }
}

export const deleteEmployee=async (req,res)=>{
    const {id}=req.params;
    try {
        const deletedEmployee=await Employee.findByIdAndDelete(id);
        await redisClient.del('employees');
        await redisClient.del(`employees:${id}`);
        res.status(200).json(deletedEmployee);
    } catch (error) {
        res.status(400).json({message:error.message});
    }
}



