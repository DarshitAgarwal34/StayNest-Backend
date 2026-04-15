import express from 'express';
import { forgotPassword, login, signup } from '../controllers/auth.controller.js';

import { validate } from '../validators/validate.middleware.js';
import { forgotPasswordSchema, loginSchema, signupSchema } from '../validators/auth.validator.js';

const router = express.Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);

export default router;
