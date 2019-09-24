const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

//create a new instance of seqeulize
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'library.db'
});
const Book = require('./books')(sequelize, Sequelize);

// create book listing
router.get('/', (req, res) => {
    res.redirect('/books/page=1');
});

router.get('/new', (req, res) => {
    res.render('new-book')
});
router.get('/page=:pageId', (req, res) => {
    const pageNumber = req.params.pageId;
    const booksPerPage = 10;
    let booksLength = 0;
    //pagination to limit the amount of books per page
    const paginate = (pageNumber, booksPerPage) => {
        const offset = (pageNumber * booksPerPage) - booksPerPage;
        const limit = booksPerPage;

        return {
            offset,
            limit
        };
    }

    Book.count()
        .then(j => {
            booksLength = j;
        })
        .then(() => {
            Book.findAll(paginate(pageNumber, booksPerPage))
                .then(books => {
                    const totalPages = Math.ceil(booksLength / booksPerPage);
                    res.render('index', { books, totalPages, pageNumber });
                });
        });
});

//create new book form
router.post('/', (req, res) => {
    res.redirect('/books/page=1');
});

/*
*use post method to create book. 
* require catch for validation error
*/  
router.post('/new', (req, res) => {
    let { title, author, genre, year } = req.body;

    Book.create({ title, author, genre, year })
        .then(() => res.redirect("/books"))
        
        .catch((err) => {
            if (err.name === "SequelizeValidationError") {
                res.render('new-book', { errors: err.errors });
            }
        });
});


router.get('/search', (req, res) => {
    
    const query = req.query.q.toLowerCase();
        //use start with operator to find data
    Book.findAll({
        where: {
            [Op.or]: [
                sequelize.where(
                    sequelize.fn('lower', sequelize.col('title')),
                    { [Op.startsWith]: query + '%' },
                ),
                sequelize.where(
                    sequelize.fn('lower', sequelize.col('author')),
                    { [Op.startsWith]: query + '%' },
                ),
                sequelize.where(
                    sequelize.fn('lower', sequelize.col('genre')),
                    { [Op.startsWith]: query + '%' },
                ),
                sequelize.where(
                    sequelize.fn('lower', sequelize.col('year')),
                    { [Op.startsWith]: query + '%' },
                )
            ]
        }
    }).then(books => res.render('index', { books }));
});

//When get request is made find book by primary key and manipulate the update-book.pug file
router.get('/:id', (req, res) => {
    Book.findByPk(req.params.id)
        .then(book => {
            console.log(book);
            res.render('update-book', { book });
        });
});

// update book
router.post('/:id', (req, res) => {
    Book.findByPk(req.params.id)
        .then((book) => book.update(req.body))
        .then(book => res.redirect("/books"))
        // require catch for validation error
        .catch((err) => {
            if (err.name === "SequelizeValidationError") {
                Book.findByPk(req.params.id)
                    .then(book => res.render('update-book', { errors: err.errors, book }));
            }
        });
});

//find by id and delete book
router.post('/:id/delete', (req, res) => {
    Book.findByPk(req.params.id)
        .then((book) => book.destroy())
        .then(() => res.redirect("/books"));
});

module.exports = router;