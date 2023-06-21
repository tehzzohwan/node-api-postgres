const {pool} = require('./queries.js')
const express = require('express');
const bodyParser = require('body-parser')
const app = express()

app.listen(3002, () => console.log('app is runnning'))



const testPostgres = async () => {
  const result = await pool.query('SELECT $1::text as name', ['db connected'])
  console.log(result.rows[0].name)
}

testPostgres();