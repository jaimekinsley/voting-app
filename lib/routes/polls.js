const { Router } = require('express');
const Poll = require('../models/Poll');

module.exports = Router()
  .post('/', (req, res, next) => {
    Poll
      .create(req.body)
      .then(poll => res.send(poll))
      .catch(next);
  })

  .get('/', (req, res, next) => {
    Poll
      .find()
      .select({ title: true })
      .then(polls => res.send(polls))
      .catch(next);
  })

  .get('/:id', (req, res, next) => {
    Poll
      .findById(req.params.id)
      .populate('organization')
      // will need to populate votes after it is created
      .then(poll => res.send(poll))
      .catch(next);
  })

  .patch('/:id', (req, res, next) => {
    Poll
      .findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(poll => res.send(poll))
      .catch(next);
  })

  .delete('/:id', (req, res, next) => {
    Poll
      .findByIdAndDelete(req.params.id, req.body)
      .then(poll => res.send(poll))
      .catch(next);
  });
