const { test, describe } = require('node:test');
const assert = require('node:assert');

const { blogs } = require('./list_helper_data');
const listHelper = require('../utils/list_helper');

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

describe('total likes', () => {
  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(blogs.slice(0, 1));
    assert.strictEqual(result, blogs[0].likes);
  });

  test('count total likes of the list of blogs', () => {
    const result = listHelper.totalLikes(blogs);
    assert.strictEqual(result, 36);
  });
})