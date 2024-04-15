const request = require('supertest');
const app = require('../app');
const db = require('../db/connection');

const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/');

beforeEach(() => {
  return seed(data);
})

afterAll(() => {
  return db.end();
})

describe("NC News", () => {
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