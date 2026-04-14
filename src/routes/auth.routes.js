import express from 'express';
import { login, signup } from '../controllers/auth.controller.js';

import { validate } from '../validators/validate.middleware.js';
import { signupSchema, loginSchema } from '../validators/auth.validator.js';

const router = express.Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);

export default router;