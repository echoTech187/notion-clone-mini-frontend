const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const middleware = require('../middleware/middleware');

router
    .route('/')
    .get(middleware.protect, noteController.getNotes)
    .post(middleware.protect, noteController.createNote);

router
    .route('/:id')
    .get(middleware.protect, noteController.getNote)
    .put(middleware.protect, noteController.updateNote)
    .delete(middleware.protect, noteController.deleteNote);

router.route('/user/:userId').get(middleware.protect, noteController.getNotesByUser);


module.exports = router;