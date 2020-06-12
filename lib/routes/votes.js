const { Router } = require('express');
const Vote = require('../models/Vote');

module.exports = Router()
  .post('/', (req, res, next) => {
    Vote
      // changing from .create(req.body) so it can check if the vote already exists
      .findOneAndUpdate({ poll: req.body.poll, user: req.body.user }, req.body, { new: true, upsert: true })
      .then(vote => res.send(vote))
      .catch(next);
  })

  .get('/', (req, res, next) => {
    Vote
      .find(req.params.id)
      .then(votes => res.send(votes))
      .catch(next);
  })

  .patch('/:id', (req, res, next) => {
    Vote
      .findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(vote => res.send(vote))
      .catch(next);
  });
