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

    test('POST 201: Responds with status 201 and a new topic when topic successfully added.', () => {
      return request(app)
        .post('/api/topics')
        .send({
          slug: 'dodgy-site',
          description: 'Buy stuff at www.dodgy-site.com'
        })
        expect(201)
        then(({ body: { topic } }) => {
          expect(topic.slug).toBe('dodgy-site');
          expect(topic.description).toBe('Buy stuff at www.dodgy-site.com');
          expect(Object.keys(topic)).toHaveLength(2);
        });
    });

    test('POST 400: Responds with status 400 when attempting to post a topic with an existing slug.', () => {
      return request(app)
        .post('/api/topics')
        .send({
          slug: 'mitch',
          description: 'Buy stuff at www.dodgy-site.com'
        })
        expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });

    test('POST 400: Responds with 400 when posted topic is invalid.', () => {
      return request(app)
        .post('/api/topics')
        .send({
          slug: 'dodgy-site',
          description: 'Buy stuff at www.dodgy-site.com',
          colour: 'institution green'
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
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
          expect(article.comment_count).toBe(11);

          expect(typeof article.created_at).toBe('string');
          expect(typeof article.article_img_url).toBe('string');
        });
    });

    test('GET 200: Check that the returned article object is correctly formed.', () => {
      return request(app)
        .get('/api/articles/1')
        .expect(200)
        .then(({ body: { article } }) => {
          // Expect the article to have the expected set of properties and no others.

          expect(article).toContainAllKeys(
            ['title', 'author', 'article_id', 'topic', 'created_at',
                'votes', 'article_img_url', 'body', 'comment_count']);
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

    test('GET 400: Responds with status 400 when the article id is invalid.', () => {
      return request(app)
        .get('/api/articles/not-a-number')
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });

    test('PATCH 200: Updates the votes associated with a specified article and returns the article.', () => {
      return request(app)
        .patch('/api/articles/1')
        .send({
          incVotes: 42
        })
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article.votes).toBe(142);
        });
    });

    test('PATCH 404: Responds with 404 when there is no article with the specified id.', () => {
      return request(app)
        .patch('/api/articles/999')
        .send({
          incVotes: 42
        })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("No such article");
        });
    });

    test('PATCH 400: Responds with 400 when the article_id is invalid.', () => {
      return request(app)
        .patch('/api/articles/not-a-number')
        .send({
          incVotes: 42
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });

    test('PATCH 400: Responds with 400 when the incVotes key is missing.', () => {
      return request(app)
        .patch('/api/articles/1')
        .send({})
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });

    test('PATCH 400: Responds with 400 when the incVotes value is invalid.', () => {
      return request(app)
        .patch('/api/articles/1')
        .send({
          incVotes: "not-a-number"
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });

    test('PATCH 400: Responds with 400 when the patch data has extra keys.', () => {
      return request(app)
        .patch('/api/articles/1')
        .send({
          incVotes: 42,
          colour: "institution green"
        })
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

          const comment_counts = [ -1, 11, 0, 2, 0, 2, 1, 0, 0, 2, 0, 0, 0, 0 ];

          articles.forEach(article => {
            // Expect the article objects to have the expected set of properties and no others.
            expect(article).toContainAllKeys(
              ['title', 'article_id', 'author', 'topic', 'created_at', 'votes', 'article_img_url', 'comment_count']);

            expect(article.comment_count).toBe(comment_counts[article.article_id]);
          });
        });
    });

    test('GET 200: By default all articles are sorted newest first.', () => {
      return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy('created_at', { descending: true });
        });
    });

    test('GET 200: Articles can be sorted on any column in either sort order.', () => {
      return request(app)
        .get('/api/articles?sort_by=author&order=asc')
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy('author');
        });
    });

    test('GET 400: Respond with status 400 if passed an invalid sort order.', () => {
      return request(app)
        .get('/api/articles?sort_by=author&order=new')
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid sort order");
        });
    });

    test('GET 400: Respond with status 400 if passed an invalid sort_by parameter.', () => {
      return request(app)
        .get('/api/articles?sort_by=no_such_column')
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });

    test('GET 200: When given a topic that exists, return all articles with that topic.', () => {
      return request(app)
        .get('/api/articles?topic=cats')
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toHaveLength(1);
          expect(articles[0].topic).toBe('cats');
        });
    });

    test("GET 404: When given a topic that doesn't exist return 404 status.", () => {
      return request(app)
        .get('/api/articles?topic=dogs')
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("No such topic");
        });
    });

    test('GET 200: When given a page specifier, paginate the page accordingly.', () => {
      return request(app)
        .get('/api/articles?p=1')
        .expect(200)
        .then(({ body: { articles, total_count } }) => {
          expect(articles).toHaveLength(10);
          expect(total_count).toBe(13);
        });
    });

    test('GET 200: When paginating, return the total of filtered articles.', () => {
      return request(app)
        .get('/api/articles?p=1&topic=mitch')
        .expect(200)
        .then(({ body: { articles, total_count } }) => {
          expect(articles).toHaveLength(10);
          expect(total_count).toBe(12);
        });
    });

    test('GET 200: When paginating, reduce the number of articles returned to a maximum of the limit value.', () => {
      return request(app)
        .get('/api/articles?p=1&limit=4')
        .expect(200)
        .then(({ body: { articles, total_count } }) => {
          expect(articles).toHaveLength(4);
          expect(total_count).toBe(13);
        });
    });

    test('GET 200: When paginating, return results from the correct page.', () => {
      return request(app)
        .get('/api/articles?p=2&limit=4&sort_by=article_id&order=asc')
        .expect(200)
        .then(({ body: { articles, total_count } }) => {
          expect(articles).toHaveLength(4);
          expect(articles[0].article_id).toBe(5);
          expect(articles[3].article_id).toBe(8);
        });
    });

    test('GET 200: When paginating, the final page may not be full.', () => {
      return request(app)
        .get('/api/articles?p=4&limit=4')
        .expect(200)
        .then(({ body: { articles, total_count } }) => {
          expect(articles).toHaveLength(1);
        });
    });

    test('GET 200: When paginating, pages beyond the last page should be empty.', () => {
      return request(app)
        .get('/api/articles?p=999&limit=4')
        .expect(200)
        .then(({ body: { articles, total_count } }) => {
          expect(articles).toHaveLength(0);
        });
    });

    test('GET 200: Paginating should work when filtering by topic.', () => {
      return request(app)
        .get('/api/articles?p=2&limit=3&topic=mitch&sort_by=article_id&order=asc')
        .expect(200)
        .then(({ body: { articles, total_count } }) => {
          expect(articles).toHaveLength(3);
          expect(articles[0].article_id).toBe(4);
          expect(articles[1].article_id).toBe(6);
          expect(articles[2].article_id).toBe(7);
        });
    });

    test('POST 201: Responds with status 201 and new article when article successfully added.', () => {
      const url = 'https://secureblitz.com/wp-content/uploads/2020/02/Most-Dangerous-Websites-You-Should-Avoid.png'
      return request(app)
        .post('/api/articles')
        .send({
          author: 'lurker',
          title: 'Why you should buy stuff from www.dodgy-site.com',
          body: 'Buy stuff at https://dodgy-site.com',
          topic: 'paper',
          article_img_url: url
        })
        .expect(201)
        .then(({ body: { article } }) => {
            expect(article.article_id).toBe(14);
            expect(article.author).toBe('lurker');
            expect(article.title).toBe('Why you should buy stuff from www.dodgy-site.com');
            expect(article.body).toBe('Buy stuff at https://dodgy-site.com');
            expect(article.topic).toBe('paper');
            expect(article.article_img_url).toBe(url);
            expect(article.votes).toBe(0);
            expect(article.comment_count).toBe(0);
            
            expect(typeof article.created_at).toBe('string');
        });
    });

    test('POST 201: Uses default article_img_url if one is not provided.', () => {
      const url = 'https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700';
      return request(app)
        .post('/api/articles')
        .send({
          author: 'lurker',
          title: 'Why you should buy stuff from www.dodgy-site.com',
          body: 'Buy stuff at https://dodgy-site.com',
          topic: 'paper',
        })
        .expect(201)
        .then(({ body: { article } }) => {
            expect(article.article_img_url).toBe(url);
        });
    });

    test('POST 404: Responds with 404 if referenced author does not exist in users.', () => {
      return request(app)
        .post('/api/articles')
        .send({
          author: 'Honest Ron',
          title: 'Why you should buy stuff from www.dodgy-site.com',
          body: 'Buy stuff at https://dodgy-site.com',
          topic: 'paper',
        })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("No such user");
        });
    });

    test('POST 404: Responds with 404 if referenced topic does not exist in topics.', () => {
      return request(app)
        .post('/api/articles')
        .send({
          author: 'lurker',
          title: 'Why you should buy stuff from www.dodgy-site.com',
          body: 'Buy stuff at https://dodgy-site.com',
          topic: 'dodgy-site',
        })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("No such topic");
        });
    });

    test('POST 400: Responds with 400 when posted article is invalid.', () => {
      return request(app)
        .post('/api/articles')
        .send({
          author: 'lurker',
          title: 'Why you should buy stuff from www.dodgy-site.com',
          body: 'Buy stuff at https://dodgy-site.com',
          colour: 'institution green'
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });

    test('DELETE 204: Successfully deletes an article.', () => {
      return request(app)
        .delete('/api/articles/1')
        .expect(204)
        .then(() => {
          return request(app)
            .get('/api/articles/1')
            .expect(404)
            .then(({ body: { msg } }) => {
              expect(msg).toBe("No such article");
            });
        })
    });

    test('DELETE 204: Successfully removes associated comments when an article is deleted.', () => {
      return request(app)
        .delete('/api/articles/1')
        .expect(204)
        .then(() => {
          return request(app)
            .delete('/api/comments/2')
            .expect(404)
            .then(({ body: { msg } }) => {
              expect(msg).toBe("No such comment");
            });
        })
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

    test('POST 201: Responds with status 201 and new comment when comment successfully added.', () => {
      return request(app)
        .post('/api/articles/2/comments')
        .send({
          username: 'lurker',
          body: 'Buy stuff at https://dodgy-site.com'
        })
        .expect(201)
        .then(({ body: { comment } }) => {
          expect(comment).toMatchObject({
            comment_id: 19,
            author: 'lurker',
            body: 'Buy stuff at https://dodgy-site.com',
            article_id: 2,
            votes: 0
          });
        });
    });

    test('POST 404: Responds with status 404 when referenced article does not exist.', () => {
      return request(app)
        .post('/api/articles/999/comments')
        .send({
          username: 'lurker',
          body: 'Buy stuff at https://dodgy-site.com'
        })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("No such article");
        });
    });

    test('POST 400: Responds with status 400 when article_id is invalid.', () => {
      return request(app)
        .post('/api/articles/not-a-number/comments')
        .send({
          username: 'lurker',
          body: 'Buy stuff at https://dodgy-site.com'
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });

    test('POST 404: Responds with status 404 when username does not exist in users table.', () => {
      return request(app)
        .post('/api/articles/2/comments')
        .send({
          username: 'Honest Ron',
          body: 'Buy stuff at https://dodgy-site.com'
        })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("No such user");
        });
    });

    test('POST 400: Responds with status 400 when body is missing.', () => {
      return request(app)
        .post('/api/articles/2/comments')
        .send({
          username: 'lurker',
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });

    test('POST 400: Responds with status 400 when comment contains unexpected properties.', () => {
      return request(app)
        .post('/api/articles/2/comments')
        .send({
          username: 'lurker',
          colour: 'purple'
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });

    test('GET 200: When given a page specifier, paginate the page accordingly.', () => {
      return request(app)
        .get('/api/articles/1/comments?p=1')
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toHaveLength(10);
        });
    });

    test('GET 200: When given a page specifier and an article with no comments, return an empty list.', () => {
      return request(app)
        .get('/api/articles/2/comments?p=1')
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toHaveLength(0);
        });
    });

    test('GET 200: When paginating, reduce the number of comments returned to a maximum of the limit value.', () => {
      return request(app)
        .get('/api/articles/1/comments?p=1&limit=4')
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toHaveLength(4);
        });
    });

    test('GET 200: When paginating, return results from the correct page.', () => {
      return request(app)
        .get('/api/articles/1/comments?p=2&limit=4')
        .expect(200)
        .then(({ body: { comments, total_count } }) => {
          expect(comments).toHaveLength(4);
          expect(comments[0].comment_id).toBe(7);
          expect(comments[3].comment_id).toBe(12);
        });
    });

    test('GET 200: When paginating, the final page may not be full.', () => {
      return request(app)
        .get('/api/articles/1/comments?p=3&limit=4')
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toHaveLength(3);
        });
    });

    test('GET 200: When paginating, pages beyond the last page should be empty.', () => {
      return request(app)
        .get('/api/articles/1/comments?p=999')
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toHaveLength(0);
        });
    });

    test('GET 404: Responds with status 404 when paginating but the article does not exist.', () => {
      return request(app)
        .get('/api/articles/999/comments?p1')
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("No such article");
        });
    });
  });

  describe('/api/comments/:comment_id', () => {
    test('DELETE 204: Successfully deletes a comment.', () => {
      return request(app)
        // Comment 2 is a comment on article 1.
        .get('/api/articles/1/comments')
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toHaveLength(11);  // Should always be the case, but belt and braces...
        })
        .then(() => {
          return request(app)
            .delete('/api/comments/2')
            .expect(204)
        })
        .then(() => {
          return request(app)
            .get('/api/articles/1/comments')
            .expect(200)
        })
        .then(({ body: { comments } }) => {
          expect(comments).toHaveLength(10);
        })
    });

    test('DELETE 404: Responds with status 404 when referenced comment does not exist.', () => {
      return request(app)
        .delete('/api/comments/999')
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("No such comment");
        });
    });

    test('DELETE 400: Responds with status 400 when comment_id is invalid.', () => {
      return request(app)
        .delete('/api/comments/not-a-number')
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });

    test('PATCH 200: Updates the votes associated with a specified comment and returns the comment.', () => {
      return request(app)
        .patch('/api/comments/1')
        .send({
          inc_votes: 1
        })
        .expect(200)
        .then(({ body: { comment } }) => {
          expect(comment.votes).toBe(17);
        });
    });

    test('PATCH 404: Responds with 404 when there is no comment with the specified id.', () => {
      return request(app)
        .patch('/api/comments/999')
        .send({
          inc_votes: 42
        })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("No such comment");
        });
    });

    test('PATCH 400: Responds with 400 when the comment_id is invalid.', () => {
      return request(app)
        .patch('/api/comments/not-a-number')
        .send({
          inc_votes: 42
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });

    test('PATCH 400: Responds with 400 when the inc_votes key is missing.', () => {
      return request(app)
        .patch('/api/comments/1')
        .send({})
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });

    test('PATCH 400: Responds with 400 when the inc_votes value is invalid.', () => {
      return request(app)
        .patch('/api/comments/1')
        .send({
          incVotes: "not-a-number"
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });

    test('PATCH 400: Responds with 400 when the patch data has extra keys.', () => {
      return request(app)
        .patch('/api/comments/1')
        .send({
          inc_votes: 42,
          colour: "institution green"
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });

  describe('/api/users', () => {
    test('GET 200: Responds with an object containing a list of users.', () => {
      return request(app)
        .get('/api/users')
        .expect(200)
        .then(({ body: { users } }) => {
          expect(users).toHaveLength(4);

          users.forEach(user => {
            expect(user).toContainAllKeys(['username', 'name', 'avatar_url']);

            expect(typeof user.username).toBe('string');
            expect(typeof user.name).toBe('string');
            expect(typeof user.avatar_url).toBe('string');
          });
        });
    });

    test('GET 200: Responds with a user.', () => {
      return request(app)
        .get('/api/users/rogersop')
        .expect(200)
        .then(({ body: { user } }) => {
          expect(user.username).toBe('rogersop');
          expect(user.name).toBe('paul');
          expect(typeof user.avatar_url).toBe('string');
        });
    });

    test('GET 404: Responds with status 404 when referenced username does not exist.', () => {
      return request(app)
        .get('/api/users/honest-ron')
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("No such username");
        });
    });
  });
});