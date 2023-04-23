const axios=require('axios');
const launchesModel=require('./launches.mongo')
const planets=require('./planets.mongo');



const SPACEX_URL='https://api.spacexdata.com/v4/launches/query';

async function findLaunch(filter) {
    return await launchesModel.findOne(filter);
}

async function populateLaunches() {
    const response=await axios.post(SPACEX_URL,{
        query:{},
        options:{
            pagination:false,
            populate:[
                {
                    path:'rocket',
                    select:{
                        name:1
                    }
                },
                {
                    path:'payloads',
                    select:{
                        customers:1
                    }
                }
            ]
        }
    });

    if(response.status!==200) {
        console.log('Launches Data cannot be loaded')
        throw new Error('Launches data cannot be loaded!')
    }

    const launchesDoc=response.data.docs;

    for(const launchDoc of launchesDoc) {
        const payloads=launchDoc.payloads;
        const customers=payloads.flatMap(payload=>{
            return payload['customers']
        })
        const launch={
            flightNumber:launchDoc['flight_number'],
            mission:launchDoc['name'],
            rocket:launchDoc['rocket']['name'],
            launchDate:launchDoc['date_local'],
            success:launchDoc['success'],
            upcoming:launchDoc['upcoming'],
            customers
        }

        console.log(`${launch.flightNumber} ${launch.mission} ${launch.customers}`)
        await saveLaunch(launch);
    }
}



async function loadLaunchesData() {
    const firstLaunch=await findLaunch({
        flightNumber:1,
        rocket:'Falcon 1',
        mission:'FalconSat'
    });

    if(firstLaunch) {
        console.log('SpaceX launches are already downloaded!')
    }else{
        await populateLaunches();
    }
}

async function saveLaunch(launch) {
    await launchesModel.findOneAndUpdate({flightNumber:launch.flightNumber},launch,{upsert:true});
}

async function getAllLaunches(skip,limit) {
    return await launchesModel.find({},{'_id':0,'__v':0}).sort({flightNumber:1}).skip(skip).limit(limit);
}

async function getLatestFlightNumber() {
    const latestLaunch=await launchesModel.findOne().sort('-flightNumber');
    if(!latestLaunch) {
        return LATEST_FLIGHT_NUMBER_DEFAULT;
    }
    return latestLaunch.flightNumber;
}

async function scheduleNewLaunch(launch) {
    const planet=await planets.findOne({keplerName:launch.target});
    if(!planet) {
        throw new Error('No Planet found')
    }
    const newFlightNumber=await getLatestFlightNumber()+1;
    const newLaunch=Object.assign(launch,{
        success:true,
        upcoming:true,
        customers:['NASA','ZTM'],
        flightNumber:newFlightNumber
    });
    await saveLaunch(newLaunch);
}

async function existsLaunch(launchId) {
    return await findLaunch({flightNumber:launchId})
}

async function abortLaunchById(launchId) {
        const aborted=await launchesModel.updateOne({flightNumber:launchId},{upcoming:false,success:false});
        return aborted.modifiedCount===1;
}

module.exports={
    loadLaunchesData,
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunch,
    abortLaunchById
}