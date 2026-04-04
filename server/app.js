import express from 'express';
import path from 'path';
import escrowRouter from './escrow/router';

var app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/api', escrowRouter);

export default app;
