const { Router } = require('express');
const Poll = require('../models/Poll');
const ensureAuth = require('../middleware/ensureAuth');

module.exports = Router()
  .post('/', ensureAuth, (req, res, next) => {
    Poll
      .create(req.body)
      .then(poll => res.send(poll))
      .catch(next);
  })

  .get('/', ensureAuth, (req, res, next) => {
    Poll
      .find()
      .select({ title: true })
      .then(polls => res.send(polls))
      .catch(next);
  })

  .get('/:id', ensureAuth, (req, res, next) => {
    Poll
      .findById(req.params.id)
      .populate('organization')
      .then(poll => res.send(poll))
      .catch(next);
  })

  .patch('/:id', ensureAuth, (req, res, next) => {
    Poll
      .findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(poll => res.send(poll))
      .catch(next);
  })

  .delete('/:id', ensureAuth, (req, res, next) => {
    Poll
      .findByIdAndDelete(req.params.id, req.body)
      .then(poll => res.send(poll))
      .catch(next);
  });
