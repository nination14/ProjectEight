const express = require('express');
const router = express.Router();

/* Home Page route. */
router.get('/', function(req, res, next) {
  res.redirect("/books")
});

module.exports = router;