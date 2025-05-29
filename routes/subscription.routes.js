import { Router } from "express";
import  {
    createSubscription, 
    getAllSubscriptions, 
    getASubscription, 
    getUserSubscriptions } 
    from "../controllers/subscription.controller.js";
import  {userAuthorize, adminAuthorize } from "../middlewares/auth.middleware.js";

const subscriptionRouter =Router();

subscriptionRouter.get('/:adminId',adminAuthorize,getAllSubscriptions);

subscriptionRouter.get('/:id',getASubscription);

subscriptionRouter.get('/user/:id',userAuthorize, getUserSubscriptions);

subscriptionRouter.get('/upcoming-renewals',(req,res)=>res.send({title: 'GET upcoming renewals'}));

subscriptionRouter.post('/',userAuthorize,createSubscription);

subscriptionRouter.put('/:id',(req,res)=>res.send({title: 'UPDATE subscription'}));

subscriptionRouter.put('/:id/cancel',(req,res)=>res.send({title: 'CANCEL subscriptions'}));

subscriptionRouter.delete('/:id',(req,res)=>res.send({title: 'DELETE subscription'}));

export default subscriptionRouter;