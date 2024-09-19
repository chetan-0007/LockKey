import {Router} from 'express'
import { deleteCredential, getAllCredentials, getCredential, saveCredential, updateCredential } from '../controllers/Credential.contoller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router=Router()

router.route("/addCredential")
    .post(verifyJWT, saveCredential)
router.route("/allCredentials")
    .get(verifyJWT, getAllCredentials);
router.route("/:id")
    .get(verifyJWT, getCredential)
    .put(verifyJWT, updateCredential)
    .delete(verifyJWT, deleteCredential);


export default router