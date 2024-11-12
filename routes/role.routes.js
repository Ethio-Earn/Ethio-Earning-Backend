import express from "express";
import * as roleController from '../controllers/role.controller.js'
const router=express.Router()

router.get("/",roleController.getRoles)
router.get("/:id",roleController.getRoleById)
router.put("/:id",roleController.updateRole)
router.post("/",roleController.addRole)
router.delete("/:id/",roleController.deleteRole)
router.put("/permissions/:id",roleController.addRolePermission)
// for removing permission from a role
router.put("/remove/permissions/:id",roleController.removeRolePermission)
export default router;