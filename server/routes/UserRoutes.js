import UserController from '../controllers/UserController';
import Authenticator from '../middlewares/Authenticator';
import UserMiddleware from '../middlewares/UserMiddleware';

/**
 * Class to create an instance of a UserRoutes Object
 * and set up all routes associated with a user object
 * for an express router
 */
class UserRoutes {
  /**
   * Method to set all User routes
   * @param{Object} router - Express router
   * @returns{Void} - Returns Void
   */
  static setUserRoutes(router) {
    UserRoutes.createUser(router);
    UserRoutes.loginUser(router);
    UserRoutes.logoutUser(router);
    UserRoutes.fetchUser(router);
    UserRoutes.fetchUsers(router);
    UserRoutes.updateUser(router);
    UserRoutes.deleteUser(router);
    UserRoutes.fetchUserDocuments(router);
  }

  /**
   * Method to set up route for requests to create a new user
   * @param{Object} router - Express router
   * @return{Void} - Returns Void
   */
  static createUser(router) {
    router.post(
      '/users/',
      UserMiddleware.validateCreateRequest,
      UserController.createUser
    );
  }

  /**
   * Method to set up route for user login requests
   * @param{Object} router - Express router
   * @return{Void} - Returns Void
   */
  static loginUser(router) {
    router.post(
      '/users/login',
      UserController.loginUser
    );
  }

  /**
   * Method to set up route for user logout requests
   * @param{Object} router - Express router
   * @return{Void} - Returns Void
   */
  static logoutUser(router) {
    router.post(
      '/users/logout',
      Authenticator.authenticateUser,
      UserController.logoutUser
    );
  }

  /**
   * Method to set up route for fetching users
   * @param{Object} router - Express router
   * @return{Void} - Returns Void
   */
  static fetchUsers(router) {
    router.get(
      '/users/',
      Authenticator.authenticateUser,
      UserMiddleware.validateGetRequest,
      UserController.fetchUsers
    );
  }


  /**
   * Method to set up route for fetching a specific user
   * @param{Object} router - Express router
   * @return{Void} - Returns Void
   */
  static fetchUser(router) {
    router.get(
      '/users/:id',
      Authenticator.authenticateUser,
      UserMiddleware.validateGetRequest,
      UserController.fetchUser
    );
  }

  /**
   * Method to set up route for updating user fields
   * @param{Object} router - Express router
   * @return{Void} - Returns Void
   */
  static updateUser(router) {
    router.put(
      '/users/:id',
      Authenticator.authenticateUser,
      UserMiddleware.validateUpdateRequest,
      UserController.updateUser
    );
  }

  /**
   * Method to set up route for delete user requests
   * @param{Object} router - Express router
   * @return{Void} - Returns Void
   */
  static deleteUser(router) {
    router.delete(
      '/users/:id',
      Authenticator.authenticateUser,
      UserMiddleware.validateDeleteRequest,
      UserController.deleteUser
    );
  }

  /**
   * Method to set up route for fetching all specified user documents
   * @param{Object} router - Express router
   * @return{Void} - Returns Void
   */
  static fetchUserDocuments(router) {
    router.get(
      '/users/:id/documents',
      Authenticator.authenticateUser,
      UserController.fetchUserDocuments
    );
  }
}

export default UserRoutes;
