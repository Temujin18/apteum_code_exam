const request = require('supertest');
const app = require('./index');

describe('GET /lga/:id', () => {
  test('responds with 404 if LGA id is not found in the database', async () => {
    const response = await request(app).get('/lga/9999'); 
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Data not found');
  });

  test('responds with 400 if :id parameter is not a valid integer', async () => {
    const response = await request(app).get('/lga/invalid_id');
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Invalid LGA id parameter');
  });

  test('responds with 200 and JSON representation of LGA data if request is successful', async () => {
    const response = await request(app).get('/lga/1');
    expect(response.status).toBe(200);
    expect(response.body.data[0]).toHaveProperty('gid', 1);
    expect(response.body.data[0]).toHaveProperty('lga_name', 'BAYSIDE');
  });
});