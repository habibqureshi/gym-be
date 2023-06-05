const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const morgan = require('morgan')
const db = require('./models/index.js')
const apiRouter = require('./routes')
dotenv.config()

db.sequelize.sync().then(res => {
    console.log('sync done')
})

const app = express()
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use(morgan('dev'))
app.use('/api', apiRouter)
app.get('/', (req, res) => {
    res.status(200).send("Hello World!!!")
})

app.listen(process.env.PORT, () => {
    console.log("server listening on port ", process.env.PORT)
})