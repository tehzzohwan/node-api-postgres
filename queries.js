const Pool = require('pg').Pool
const pool = new Pool({
  user: 'tehzz',
  host: 'localhost',
  database: 'api',
  password: 's@m123u3l',
  port: 5432
})


module.exports = {pool}