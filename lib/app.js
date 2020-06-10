const express = require('express');
const app = express();

app.use(express.json());

app.use('/api/v1/organizations', require('./routes/organizations'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/polls', require('./routes/polls'));
app.use('/api/v1/memberships', require('./routes/memberships'));

app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = app;
