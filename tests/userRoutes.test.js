const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const userController = require('../controllers/userController');
const authenticate = require('../middleware/auth');

jest.mock('../middleware/auth', () => jest.fn((req, res, next) => {
  req.user = { id: 1, email: 'test@example.com' }; 
  next();
}));

const app = express();
app.use(bodyParser.json());
app.get('/v1/user/self', authenticate, userController.getUser);
app.post('/v1/user', userController.createUser);
app.put('/v1/user/self', authenticate, userController.updateUser);

jest.mock('../controllers/userController', () => ({
  getUser: jest.fn((req, res) => res.status(200).json({ id: req.user.id, email: req.user.email })),
  createUser: jest.fn((req, res) => res.status(201).json({ id: 1, ...req.body })),
  updateUser: jest.fn((req, res) => res.status(200).json({ id: req.user.id, ...req.body }))
}));

describe('User Routes', () => {
  it('should create a new user', async () => {
    const newUser = { email: 'newuser@example.com', password: 'password123' };
    const response = await request(app).post('/v1/user').send(newUser);
    expect(response.statusCode).toBe(201);
    expect(response.body.email).toEqual(newUser.email);
  });

  it('should get the user details', async () => {
    const response = await request(app).get('/v1/user/self');
    expect(response.statusCode).toBe(200);
    expect(response.body.email).toBe('test@example.com');
  });

  it('should update the user details', async () => {
    const updates = { email: 'updated@example.com' };
    const response = await request(app).put('/v1/user/self').send(updates);
    expect(response.statusCode).toBe(200);
    expect(response.body.email).toBe(updates.email);
  });
});
