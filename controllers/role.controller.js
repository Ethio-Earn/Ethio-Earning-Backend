import EmployeeRole from "../models/role.model.js";
import Redis from "ioredis";


const redisClient = new Redis(process.env.REDIS_URL)

export const addRole=async (req,res)=>{
    try {
        const {name,code,permission}=req.body;
        var newRole = new EmployeeRole({
            name,
            code,
            permission:[
                {
                    "transaction":[],
                    "package":[],
                    "category":[]
                }
            ]
        });
        if (permission){
            newRole.permission=[...permission]
        }
        const savedRole= await newRole.save();
        
        await redisClient.del('roles');
        await redisClient.del(`roles:${savedRole._id}`);

        res.status(201).json(savedRole);
    } catch (error) {
        res.status(400).json({message:error.message});
    }
}

export const getRoles=async (req,res)=>{
    const cacheKey = 'roles';
    try {
        const cachedRoles = await redisClient.get(cacheKey);
        if (cachedRoles) {
            return res.status(200).json(JSON.parse(cachedRoles));
        }

        const roles = await EmployeeRole.find()
        await redisClient.set(cacheKey, JSON.stringify(roles));
        res.status(200).json(roles);
    } catch (error) {
        res.status(404).json({message:error.message});
    }
}

export const getRoleById=async (req,res)=>{
    const {id} =req.params;
    const cacheKey = `roles:${id}`;

    try {
        const cachedRole = await redisClient.get(cacheKey);

        if (cachedRole) {
            return res.status(200).json(JSON.parse(cachedRole));
        }
        const role = await EmployeeRole.findById(id);
        await redisClient.set(cacheKey, JSON.stringify(role));
        res.status(200).json(role);
    } catch (error) {
        res.status(404).json({message:error.message});
    }
}

export const updateRole=async (req,res)=>{
    const {id}=req.params;
    const {name,code}=req.body;

    try {
        const updatedRole=await EmployeeRole.findByIdAndUpdate(id,{name,code},{new:true,runValidators:true});
        if (!updatedRole) {
            return res.status(404).json({message:"Role not found"});
        }
        await redisClient.del('roles');
        await redisClient.del(`roles:${id}`);

        res.status(200).json(updatedRole);
    }
    catch (error) {
        res.status(404).json({message:error.message});
    }
}

export const addRolePermission=async (req,res)=>{
    const {id}=req.params;
    const {type,action}=req.body;
    try {
        const role=await EmployeeRole.findById(id);
        if (!role) {
            return res.status(404).json({message:"Role not found"});
        }
        if(!role.permission[0][type]){
            role.permission[0][type]=[];
        }
        action.forEach(act => {
            if (act.length>0 && !role.permission[0][type].includes(act.toUpperCase()))  {
                role.permission[0][type].push(act.toUpperCase());
            }
            
        });
        const updatedRole=await role.save();
        await redisClient.del('roles');
        await redisClient.del(`roles:${id}`);
        res.status(200).json(updatedRole);
    }
    catch (error) {
        res.status(404).json({message:error.message});
    }
}
export const removeRolePermission=async (req,res)=>{
    const {id}=req.params;
    var {type,action}=req.body;
    type=type.toLowerCase();
    
    try {
        const role=await EmployeeRole.findById(id);
        if (!role) {
            return res.status(404).json({message:"Role not found"});
        }
        if(!role.permission[0][type]){
            return res.status(404).json({message:"Permission type not found"});
        }
        action.forEach(act => {
            role.permission[0][type]=role.permission[0][type].filter(a=>a!==act.toUpperCase());            
        });
        const updatedRole=await role.save();
        await redisClient.del('roles');
        await redisClient.del(`roles:${id}`);
        res.status(200).json(updatedRole);
    }
    catch (error) {
        res.status(404).json({message:error.message});
    }
}

export const deleteRole=async (req,res)=>{
    const {id}=req.params;
    try {
        const deletedRole=await EmployeeRole.findByIdAndDelete(id);
        if (!deletedRole) {
            return res.status(404).json({message:"Role not found"});
        }
        await redisClient.del('roles');
        await redisClient.del(`roles:${id}`);
        res.status(200).json({message:"Role deleted successfully"});
    } catch (error) {
        res.status(404).json({message:error.message});
    }
}
