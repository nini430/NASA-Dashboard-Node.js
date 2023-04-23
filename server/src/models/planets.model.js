const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const planets=require('../models/planets.mongo');

function isHabitable(planet) {
  return (
    planet['koi_disposition'] === 'CONFIRMED' &&
    planet['koi_insol'] > 0.36 &&
    planet['koi_insol'] < 1.11 &&
    planet['koi_prad'] < 1.6
  );
}

function loadAllPlanets() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, '..', '..', 'data', 'kernel_data.csv')
    )
      .pipe(parse({ comment: '#', columns: true }))
      .on('data', async(object) => {
        if (isHabitable(object)) {
            createOrUpdatePlanet(object);
        }
      })
      .on('error', (err) => {
        reject(err);
      })
      .on('end', async() => {
        const planetsCount=(await getAllPlanets()).length;
        console.log(`${planetsCount} habitable planets found`)
        resolve();
      });
  });
}


async function getAllPlanets() {
  return await planets.find({},{'_id':0,'__v':0}); 
}

async function createOrUpdatePlanet(planet) {
    await planets.updateOne({keplerName:planet['kepler_name']},{keplerName:planet['kepler_name']},{upsert:true})
}
module.exports = {
  loadAllPlanets,
  getAllPlanets
};
