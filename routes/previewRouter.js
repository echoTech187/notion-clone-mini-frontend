const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

router.get('/:id', noteController.getNoteForPreview);
module.exports = router;