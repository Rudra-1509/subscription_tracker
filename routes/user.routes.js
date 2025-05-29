import {Router} from 'express';
import { getUser, getUsers } from '../controllers/user.controller.js';
import{ userAuthorize} from '../middlewares/auth.middleware.js';

const userRouter=Router();

userRouter.get('/',getUsers);

userRouter.get('/:id',userAuthorize,getUser);

userRouter.post('/',(req,res)=>{res.send({Title:'CREATE user'})});

userRouter.put('/:id',(req,res)=>{res.send({Title:'UPDATE user'})});

userRouter.delete('/:id',(req,res)=>{res.send({Title:'DELETE user'})});

export default userRouter;