const { Router } = require('express');
const Membership = require('../models/Membership');
const ensureAuth = require('../middleware/ensureAuth');

module.exports = Router()
  .post('/', ensureAuth, (req, res, next) => {
    Membership
      .create(req.body)
      .then(membership => res.send(membership))
      .catch(next);
  })

  .get('/', ensureAuth, (req, res, next) => {
    Membership
      .find(req.query)
      .populate('organization', { title: true, imageUrl: true })
      .populate('user', { name: true, imageUrl: true })
      .then(memberships => res.send(memberships))
      .catch(next);
  })

  .delete('/:id', ensureAuth, (req, res, next) => {
    Membership
      .deleteAndAllVotes(req.params.id)
      .then(membership => res.send(membership))
      .catch(next);
  });
