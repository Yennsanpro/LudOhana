require('dotenv').config()
const router = require('./api/routes/index.route')
const morgan = require('morgan')

const express = require('express')
const api = express()

const sequelize = require ('./db')
const dbSync = require ('./db/sync')

api.use(morgan('dev'))
api.use(express.json())
api.use('/api',router)

api.get('/', (req, res) => res.send('Connected') )

const dbCheck = async() => {
    try {
        await sequelize.authenticate()
        await dbSync()
        console.log('connected to DB')
    }catch (error){
        throw new Error(error)
    }
}

api.listen(process.env.PORT, async (err) => {  // paso 3  creo las valiable de entorno
    if (err) throw new Error ('Cannot start API')
    await dbCheck()
    console.log('*'.repeat(50))
    console.log(`API Running on port ${process.env.PORT}`)
    console.log('*'.repeat(50))
})