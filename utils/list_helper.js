const dummy = () => {
  return 1;
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0);
}

const getMostFavorite = (blogs) => {
  return blogs.reduce((prev, current) => {
    return ((prev ? prev.likes : 0) > current.likes) ? prev : current;
  }, undefined);
}

const getAuthorMostBlogs = (blogs) => {
  const authors = blogs.reduce((acc, blog) => {
    const author = acc.find((a) => a.author === blog.author);
    author ? author.blogs += 1 : acc.push({ author: blog.author, blogs: 1 });

    return acc;
  }, []);

  return authors.find((a) => a.blogs === Math.max(...authors.map((a) => a.blogs)));
}

const getAuthorMostLiked = (blogs) => {
  const authors = blogs.reduce((acc, blog) => {
    const author = acc.find((a) => a.author === blog.author);
    author ? author.likes += blog.likes : acc.push({ author: blog.author, likes: blog.likes });

    return acc;
  }, []);

  return authors.find((a) => a.likes === Math.max(...authors.map((a) => a.likes)));
}

module.exports = {
  dummy,
  totalLikes,
  getMostFavorite,
  getAuthorMostBlogs,
  getAuthorMostLiked,
};