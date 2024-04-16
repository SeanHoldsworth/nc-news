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

          expect(article.title).toBe('Living in the shadow of a great man');
          expect(article.author).toBe('butter_bridge');
          expect(article.topic).toBe('mitch');
          expect(article.body).toBe('I find this existence challenging');
          expect(article.votes).toBe(100);

          expect(typeof article.created_at).toBe('string');
          expect(typeof article.article_img_url).toBe('string');

          // Expect the article to have the expected set of properties and no others.

          const expected_properties =
            ['title', 'author', 'article_id', 'topic', 'created_at', 'votes', 'article_img_url', 'body'];

          expect(Object.keys(article).length).toBe(expected_properties.length);

          expected_properties.forEach(property => {
            expect(article).toHaveProperty(property);
          });
        });
    });

    test('GET 404: Responds with status 404 when there is no article with specified id.', () => {
      return request(app)
        .get('/api/articles/999')
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("No such article");
        });
    });

    test('GET 400: Responds with status 400 when specified id is invalid.', () => {
      return request(app)
        .get('/api/articles/not-a-number')
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });

  describe('/api/articles', () => {
    test('GET 200: Responds with an object containing a list of articles.', () => {
      return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(13);
        expect(articles).toBeSortedBy('created_at', { descending: true });

        // Expect the article objects to have the expected set of properties and no others.

        const expected_properties =
          ['title', 'article_id', 'author', 'topic', 'created_at', 'votes', 'article_img_url', 'comment_count'];

        const comment_counts = [ -1, 11, 0, 2, 0, 2, 1, 0, 0, 2, 0, 0, 0, 0 ];

        articles.forEach(article => {
          expect(article.comment_count).toBe(comment_counts[article.article_id]);

          expect(Object.keys(article).length).toBe(expected_properties.length);

          expected_properties.forEach(property => {
            expect(article).toHaveProperty(property);
          });
        });
      });
    });
  });

  describe('/api/articles/:article_id/comments', () => {
    test('GET 200: Responds with a list of the comments associated with the specified article, most recent first.', () => {
      return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toHaveLength(11);
        expect(comments).toBeSortedBy('created_at', { descending: true });

        // Expect the comment objects to have the expected set of properties and no others.

        const expected_properties =
          ['comment_id', 'body', 'article_id', 'author', 'created_at', 'votes'];

        comments.forEach(comment => {
          // All comments should have an article_id of 1.
          expect(comment.article_id).toBe(1);

          expect(Object.keys(comment).length).toBe(expected_properties.length);

          expected_properties.forEach(property => {
            expect(comment).toHaveProperty(property);
          });

          if (comment.comment_id === 2) {
            expect(comment.author).toBe('butter_bridge');
            expect(comment.votes).toBe(14);
          }
        });
      });
    });
    
    test('GET 200: Responds with an empty comment list for an article with no comments.', () => {
      return request(app)
      .get('/api/articles/2/comments')
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toHaveLength(0);
      });
    });

    test('GET 404: Responds with status 404 when there is no article with specified id.', () => {
      return request(app)
        .get('/api/articles/999/comments')
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("No such article");
        });
    });

    test('GET 400: Responds with status 400 when specified id is invalid.', () => {
      return request(app)
        .get('/api/articles/not-a-number/comments')
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });
});