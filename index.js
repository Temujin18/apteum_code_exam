const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();

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

  if (id && isNaN(parseInt(id))) {
    return res.status(400).json({ error: "Invalid LGA id parameter" });
  }

  next();
}

app.get("/lgas/:id?", validateParams, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const id = req.params.id;

  try {
    let result;
    if (id) {
      const query = {
        text: "SELECT *, ST_AsGeoJSON(geom) AS geom FROM public.vic_lga WHERE gid = $1",
        values: [id],
      };

      result = await pool.query(query);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Data not found" });
      }
    } else {
      const query = {
        text: "SELECT *, ST_AsGeoJSON(geom) AS geom FROM public.vic_lga OFFSET $1 LIMIT $2",
        values: [offset, limit],
      };
      result = await pool.query(query);

      const totalCount = await pool.query(
        "SELECT COUNT(*) FROM public.vic_lga",
      );
      const totalPages = Math.ceil(totalCount.rows[0].count / limit);

      const pagination = {
        totalItems: totalCount.rows[0].count,
        totalPages,
        currentPage: page,
        pageSize: limit,
      };

      return res.json({ data: result.rows, pagination });
    }

    return res.json({ data: result.rows });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

module.exports = app;
