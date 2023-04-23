const express=require('express')

const launchesRouter=require('./launches/launches.router')
const  planetsRouter=require('./planets/planets.router');

const router=express.Router();

router.use('/launches',launchesRouter);
router.use('/planets',planetsRouter);

module.exports=router;