import express from "express";
import * as employeeController from "../controllers/employee.controller.js";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/", employeeController.getEmployees);
router.get("/:id", employeeController.getEmployeeById);
router.post("/", authenticateAdmin,employeeController.addEmployee);
router.put("/:id",authenticateAdmin, employeeController.updateEmployee);
router.delete("/:id",authenticateAdmin, employeeController.deleteEmployee);


export default router;