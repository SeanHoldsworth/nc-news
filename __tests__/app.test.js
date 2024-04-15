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

  describe('/api/articles/:article_id', () => {
    test('GET 200: Responds with the article with the specified article_id.', () => {
      return request(app)
      .get('/api/articles/1')
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.article_id).toBe(1);

        expect(Object.hasOwn(article, 'author'));
        expect(Object.hasOwn(article, 'title'));
        expect(Object.hasOwn(article, 'body'));
        expect(Object.hasOwn(article, 'topic'));
        expect(Object.hasOwn(article, 'created_at'));
        expect(Object.hasOwn(article, 'votes'));
        expect(Object.hasOwn(article, 'article_img_url'));

        expect(typeof article.author).toBe('string');
        expect(typeof article.title).toBe('string');
        expect(typeof article.body).toBe('string');
        expect(typeof article.topic).toBe('string');
        expect(typeof article.created_at).toBe('string');
        expect(typeof article.votes).toBe('number');
        expect(typeof article.article_img_url).toBe('string');
      });
    });
  });

  describe('/api/articles/:article_id', () => {
    test('GET 404: Responds with status 404 when there is no article with specified id.', () => {
      return request(app)
      .get('/api/articles/999')
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("No such article");
      });
    });
  });

  describe('/api/articles/:article_id', () => {
    test('GET 400: Responds with status 400 when specified id is invalid.', () => {
      return request(app)
      .get('/api/articles/not-a-number')
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
    });
  });
});