const { test, describe } = require('node:test');
const assert = require('node:assert');

const { blogs } = require('./list_helper_data');
const listHelper = require('../utils/list_helper');

describe('most entity', () => {
  test('dummy returns one', () => {
    const blogs = []
  
    const result = listHelper.dummy(blogs)
    assert.strictEqual(result, 1)
  });
  
  test('counts total likes', () => {
    const result = listHelper.totalLikes(blogs);
    assert.strictEqual(result, 36);
  })

  test('find author by amount of likes', () => {
    const result = listHelper.getMostFavorite(blogs);
    assert.strictEqual(result.title, blogs[2].title);
  });

  test('find author who has most blogs', () => {
    const result = listHelper.getAuthorMostBlogs(blogs);
    assert.deepEqual(result, {author: 'Robert C. Martin', blogs: 3});
  });

  test('find author who has most blogs', () => {
    const result = listHelper.getAuthorMostLiked(blogs);
    assert.deepEqual(result, {author: 'Edsger W. Dijkstra', likes: 17});
  });
});
