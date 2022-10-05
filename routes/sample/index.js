'use strict';

var express = require('express');
var router = express.Router();
var service = require('./sample.service');

router.get('/', service.index);

router.get('/page', service.page);
router.get('/:id', service.show);

router.post('/', service.create);
router.put('/:id', service.update);
router.patch('/:id', service.modify);
router.delete('/:id', service.delete);


module.exports = router;
