const request = require('supertest');
const app = require('../app');
const db = require('../db/connection');

const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data');
const endpointsData = require('../endpoints.json');

beforeEach(() => {
  return seed(data);
})

afterAll(() => {
  return db.end();
})

describe("NC News", () => {
  describe('Invalid Path', () => {
    test('GET 404: Responds with an "Endpoint not found" message.', () => {
      return request(app)
        .get('/api/invalid')
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Endpoint not found"); 
        });
    });
  });

  describe('/api', () => {
    test('GET 200: Responds with list of available endpoints as an object.', () => {
      return request(app)
        .get('/api')
        .expect(200)
        .then(({ body: { endpoints } }) => {
          expect(endpoints).toEqual(endpointsData);
        });
    });
  });

  describe('/api/topics', () => {
    test('GET 200: Responds with an object containing a list of topics.', () => {
      return request(app)
      .get('/api/topics')
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics).toHaveLength(3);

        topics.forEach(topic => {
          expect(typeof topic.slug).toBe('string');
          expect(typeof topic.description).toBe('string');
        });
      });
    });
  });
});