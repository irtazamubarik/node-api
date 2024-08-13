import express from 'express';

import * as userController from '../../controllers/user.controller';
import auth from '../../middlewares/auth.middleware';
import validate from '../../middlewares/validate.middleware';
import * as userValidation from '../../validations/user';

const router = express.Router();

router
  .route('/')
  .post(auth('manageUsers'), validate(userValidation.createUser), userController.createUser)
  .get(auth(), validate(userValidation.getUsers), userController.getUsers);

router
  .route('/:userId')
  .get(auth(), validate(userValidation.getUser), userController.getUser)
  .patch(auth(), validate(userValidation.updateUser), userController.updateUser)
  .delete(auth(), validate(userValidation.deleteUser), userController.deleteUser);
router.patch(
  '/:userId/user-information',
  auth(),
  validate(userValidation.updateUserInformation),
  userController.updateUserInformation,
);
router.patch(
  '/:userId/user-personal-information',
  auth(),
  validate(userValidation.updateUserPersonalInformation),
  userController.updateUserInformation,
);

export default router;
