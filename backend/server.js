const express = require('express');

const app = express();

app.get('/'), (req, res) => {
    res.send('Test');
});

app.listen('0.0.0.0', 3000);
