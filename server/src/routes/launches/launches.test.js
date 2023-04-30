const app=require('../../app')
const request=require('supertest')
const {mongoConnect,mongooseDisconnect}=require('../../services/mongo')
const {loadAllPlanets}=require('../../models/planets.model')

describe('Launches API',()=>{
    beforeAll(async()=>{
        await mongoConnect();
        await loadAllPlanets();
    })
    describe('GET /launches',()=>{
        test('get launches returns 200',async()=>{
            await request(app).get('/v1/launches').expect(200).expect('Content-Type',/json/);
        })
    })
    
    
    describe('POST /launches',()=>{
        const completedData={
            mission:'nini',
            rocket:'nini',
            target:'Kepler-62 f',
            launchDate:'January 14, 2028'
        }
    
        const dataWithoutDate={
            mission:'nini',
            rocket:'nini',
            target:'Kepler-62 f', 
        }
    
        const dataInvalidDate={
            mission:'nini',
            rocket:'nini',
            target:'Kepler-62 ',
            launchDate:'kukuruuku'
        }
    
        test('POST /launches returns 201',async()=>{
            const response=await request(app).post('/v1/launches').send(completedData).expect(201).expect('Content-Type',/json/);
            const requestDate=new Date(completedData.launchDate).valueOf();
            const responseDate=new Date(response.body.launchDate).valueOf();
            expect(requestDate).toBe(responseDate);
            expect(response.body).toMatchObject(dataWithoutDate);
        })
    
        test('missing laucnh property returns 400',async()=>{
            const response=await request(app).post('/v1/launches').send(dataWithoutDate).expect(400);
            expect(response.body).toStrictEqual({ error: 'missing launch property' })
        })
    
        test('invalid date',async()=>{
            const response=await request(app).post('/v1/launches').send(dataInvalidDate).expect(400);
            expect(response.body).toStrictEqual({ error: 'Invalid Date' })
        })
    })
})

