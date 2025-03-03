import express from 'express';
import { signup , login , logout  ,checkAuth} from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
const Router = express.Router();
Router.post('/signup', signup)
Router.post('/login',login)
Router.post('/logout', logout)
Router.get('/check',protectRoute, checkAuth)
export default Router;