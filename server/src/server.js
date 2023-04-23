require('dotenv').config()
const http = require('http');
const {mongoConnect}=require('./services/mongo')

const app = require('./app');

const { loadAllPlanets } = require('./models/planets.model');
const {loadLaunchesData}=require('./models/launches.model')

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
  await mongoConnect();
  await loadAllPlanets();
  await loadLaunchesData();
  server.listen(PORT, () => {
    console.log(`Server running at ${PORT}`);
  });
}

startServer();
