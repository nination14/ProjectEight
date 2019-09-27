const express = require('express');
const router = express.Router();
const Book = require("../models").Book;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'library.db'

})

/* All book listing with library name  */
router.get("/", async (req, res, next) => {
  try {
    const booksPerPage = 5;
    const books = await Book.findAll(
    );
    res.locals.books = books;
    res.locals.title = "Ahirina's Library";
    res.render("index");
  } catch (err) {
    return next(err);
  }
});


/* Return any book looked up thats in the db */
router.get('/search', (req, res) => {
  const query = req.query.search.toLowerCase();

  Book.findAll({
      where: {
          [Op.or]: [
              sequelize.where(
                  sequelize.fn('lower', sequelize.col('title')),
                  { [Op.like]: '%' + query + '%' },
              ),
              sequelize.where(
                  sequelize.fn('lower', sequelize.col('author')),
                  { [Op.like]: '%' + query + '%' },
              ),
              sequelize.where(
                  sequelize.fn('lower', sequelize.col('genre')),
                  { [Op.like]: '%' + query + '%' },
              ),
              sequelize.where(
                  sequelize.fn('lower', sequelize.col('year')),
                  { [Op.like]: '%' + query + '%' },
              )
          ]
      }
  }).then(books => res.render('index', { books }));
});


/* Create New Book. */
router.post('/new', function(req, res, next) {
  Book.create(req.body).then(function(book){
    res.redirect("/books/" + book.id);
  }).catch(function(err){
    if(err.name === 'SequelizeValidationError') {
      res.render("new-book", {
        book: Book.build(req.body), 
        title: "New Book",
        errors: err.errors
      });
    } else {
      throw err;
    }
  }).catch(function(err){
    res.render('error', {message: err.message, error: err});
  });
});

router.get('/new', function(req, res) {
  res.render("new-book", {book: Book.build(), title: "New Book"});
});

/* Edit book */
router.get('/:id/edit', function (req, res, next) {
  Book.findByPk(req.params.id)
  .then((book) => {
    if (book) {
      res.render('edit', { book: book, title: 'Edit Book' });
    } else {
      res.send(404);
    }
  }).catch(function(err){
    res.send(500);
  });
});

/* Delete book*/
router.get('/:id/delete', function (req, res, next) {
  Book.findByPk(req.params.id).then((book) => {
    if (book) {
      res.render('delete', { book: book, title: 'Delete Book' });
    } else {
      res.send(404);
    }
  }).catch(function(err){
    res.send(500);
  });
});

/* GET a book. */
router.get('/:id', function(req, res, next) {
  Book.findByPk(req.params.id)
  .then((book) => {
    if (book) {
      res.render('show', { book, title: book.title });
    } else {
      res.render('page-not-found')
      console.log('This id does not exist. Please try again.');
    }
  }).catch(function(err){
    res.send(500,err);
    res.render('error');
  });
});

/* POST update book thats selected and applying the change */
router.post('/:id/edit', function (req, res, next) {
  Book.findByPk(req.params.id)
  .then((book) => {
    if (book) {
      return book.update(req.body)
    } else {
      res.send(404);
    }
  }).then((book) => {
    res.redirect('/books/' + book.id);
  }).catch(function(err){
    if(err.name === 'SequelizeValidationError') {
      const book = Book.build(req.body);
      book.id = req.params.id;
      res.render("edit", {
        book: req.body, 
        title: "Edit Book",
        errors: err.errors
      });
    } else {
      throw err;
    }
  }).catch(function(err){
    res.render('error', {err});
  });
});

/* DELETE individual book. */
//destroy method returns a promise. once the promise is fulfilled, then we redirect to the books path.
router.post('/:id/delete', function (req, res, next) {
  Book.findByPk(req.params.id).then((book) => {
    if (book) {
      return book.destroy();
    } else {
      res.render('page-not-found');
    }
  }).then(() => {
    res.redirect('/books');
  }).catch(function(err){
    res.send(500);
  });
});

module.exports = router;