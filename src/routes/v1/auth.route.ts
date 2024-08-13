import express from 'express';

import * as authController from '../../controllers/auth.controller';
import auth from '../../middlewares/auth.middleware';
import validate from '../../middlewares/validate.middleware';
import * as authValidation from '../../validations/auth';

const router = express.Router();

router.post('/register', validate(authValidation.register), authController.register);
router.post('/username', validate(authValidation.username), authController.checkUsername);
router.post('/login', validate(authValidation.login), authController.login);
router.get('/who-am-i', auth(), authController.whoAmI);
router.post('/logout', validate(authValidation.logout), authController.logout);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);

export default router;
