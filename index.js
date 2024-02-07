const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL connection configuration
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

function validateParams(req, res, next) {
  const id = req.params.id;

  // Check if id is present and is a valid integer
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid id parameter' });
  }

  next();
}

app.get('/lga/:id', validateParams, async (req, res) => {
  const id = req.params.id;

  try {
    const query = {
      text: `SELECT 
        gid, pfi, lga_code, lga_name, gaz_lga, gazregn, abslgacode, pfi_cr, ufi, ufi_cr, ufi_old, 
        ST_AsGeoJSON(geom) AS geom 
        FROM public.vic_lga 
        WHERE gid = $1;`,
      values: [id],
    };

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }


    res.json({ data: result.rows});
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

module.exports = app;