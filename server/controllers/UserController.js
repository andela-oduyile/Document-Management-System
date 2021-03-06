import database from '../models';
import ResponseHandler from '../helpers/ResponseHandler';
import Authenticator from '../middlewares/Authenticator';
import ErrorHandler from '../helpers/ErrorHandler';
import PaginationHelper from '../helpers/PaginationHelper';

const userDB = database.User;

/**
 * Class for the UsersController
 * to handle connections to our database
 */
class UserController {

  /**
   * Method to fetch save fields from a user object
   * @param {Object} user - User object
   * @param {String} token - token to be added to the User
   * Object sent (Optional)
   * @return {Object} - new User object containing fields
   * consider safe for public view
   */
  static getUserFields(user, token) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
      createdAt: user.createdAt,
      token
    };
  }

  /**
   * Method to create a new User (POST)
   * @param{Object} request - Request object
   * @param{Object} response - Response object
   * @return{undefined} - returns undefined
   */
  static createUser(request, response) {
    const newUser = request.body;
    newUser.roleId = newUser.roleId || 2;
    userDB.create(newUser)
    .then((user) => {
      const token = Authenticator.generateToken(user);
      Authenticator.setUserActiveToken(user, token)
      .then(() => {
        response.status(200).json({
          message: 'You have successfully signed up',
          token
        }
        );
      });
    })
    .catch((error) => {
      ErrorHandler.handleRequestError(response, error);
    });
  }

  /**
   * Method to delete a specific user (DELETE)
   * @param{Object} request - Request object
   * @param{Object} response - Response object
   * @return{undefined} - returns undefined
   */
  static deleteUser(request, response) {
    const deleteId = Number(request.params.id);
    userDB.destroy({
      where: {
        id: deleteId
      }
    }).then((rowDeleted) => {
      if (rowDeleted === 1) {
        ResponseHandler.sendResponse(
          response,
          200,
          { message: 'User Deleted' }
        );
      } else {
        ResponseHandler.send404(response);
      }
    });
  }

  /**
   * Method to update a specific user (PUT)
   * @param{Object} request - Request object
   * @param{Object} response - Response object
   * @return{undefined} - returns undefined
   */
  static updateUser(request, response) {
    userDB.findById(request.params.id)
    .then((user) => {
      if (user) {
        user.update(request.body)
        .then((updatedUser) => {
          ResponseHandler.sendResponse(
            response,
            200,
            UserController.getUserFields(updatedUser)
          );
        })
        .catch((error) => {
          ErrorHandler.handleRequestError(response, error);
        });
      } else {
        ResponseHandler.send404(response);
      }
    });
  }

  /**
   * Search user Controller
   * @static
   * @param {Object} request - request object
   * @param {Object} response - response object
   * @return{Void} - returns void
   * @memberOf DocumentController
   */
  static searchUser(request, response) {
    if (request.query.q) {
      userDB.User.find({ where: { email: { $like: request.query.q } } })
       .then((foundUser) => {
         if (foundUser) {
           return ResponseHandler.sendResponse(
             response,
             302,
             UserController.formatUserDetails(foundUser)
            );
         }
       }).catch(err => ResponseHandler.sendResponse(
           response,
           404,
           { status: false, message: err }
         ));
    }
  }

  /**
   * Method to fetch a specific user (GET)
   * @param{Object} request - Request object
   * @param{Object} response - Response object
   * @return{undefined} - returns undefined
   */
  static fetchUser(request, response) {
    const searchId = Number(request.params.id);
    userDB.findById(searchId)
    .then((user) => {
      if (user) {
        ResponseHandler.sendResponse(
          response,
          200,
          UserController.getUserFields(user)
        );
      } else {
        ResponseHandler.send404(response);
      }
    })
    .catch((error) => {
      ErrorHandler.handleRequestError(
        response,
        error
      );
    });
  }

  /**
   * Method to fetch all users (GET)
   * @param{Object} request - Request object
   * @param{Object} response - Response object
   * @return{undefined} - returns undefined
   */
  static fetchUsers(request, response) {
    const search = request.query.search;
    const limit = request.query.limit || '10';
    const offset = request.query.offset || '0';
    const page = request.query.page;
    const queryBuilder = {
      limit,
      offset,
      order: '"createdAt" DESC'
    };
    if (offset) {
      queryBuilder.offset = offset;
    }
    if (page) {
      // override offset if a page is specified, and default limit is 10
      const pageLimit = limit;
      queryBuilder.offset = (page * pageLimit) - pageLimit;
      queryBuilder.limit = pageLimit;
    }
    if (search) {
      const searchList = search.split(/\s+/);
      queryBuilder.where = {
        $or: [{ firstName: { $iLike: { $any: searchList } } },
        { lastName: { $iLike: { $any: searchList } } },
        { email: { $iLike: { $any: searchList } } }]
      };
    }
    userDB.findAndCountAll(queryBuilder)
    .then((users) => {
      if (users.rows.length > 0) {
        const pagination = PaginationHelper
      .paginateResult(users, queryBuilder.offset, queryBuilder.limit);
        ResponseHandler.sendResponse(
          response,
          200,
          {
            users: users.rows
              .map(user => UserController.getUserFields(user)),
            pagination,
          }
        );
      } else {
        ResponseHandler.send404(response);
      }
    });
  }

  /**
   * Method to login a specific user (POST)
   * @param{Object} request - Request object
   * @param{Object} response - Response object
   * @return{undefined} - returns undefined
   */
  static loginUser(request, response) {
    if (request.body.email && request.body.password) {
      userDB.findOne({
        where: {
          email: request.body.email
        }
      })
      .then((user) => {
        if (user) {
          if (user.verifyPassword(request.body.password)) {
            const token = Authenticator.generateToken(user);
            // update user activeToken
            user.update({ activeToken: token })
            .then(() => {
              // send the token here
              response.status(200).json({
                message: 'You have successfully logged in',
                token
              });
            });
          } else {
            ResponseHandler.send401(
              response,
              { message: 'Wrong Password' }
            );
          }
        } else {
          ResponseHandler.send404(response);
        }
      });
    } else {
      ResponseHandler.send400(
        response,
        { message: 'Missing Login Credentials' }
      );
    }
  }

  /**
   * Method to logout a specific user (POST)
   * @param{Object} request - Request object
   * @param{Object} response - Response object
   * @return{undefined} - returns undefined
   */
  static logoutUser(request, response) {
    const id = request.decoded.userId;
    userDB.findById(id)
    .then((user) => {
      user.update({ activeToken: null })
      .then(() => {
        ResponseHandler.sendResponse(
          response,
          200,
          { message: 'Logout Successful' }
        );
      });
    });
  }

  /**
   * Method to fetch all documents of a specific user
   * @param{Object} request - Request object
   * @param{Object} response - Response object
   * @return{Void} - returns void
   */
  static fetchUserDocuments(request, response) {
    const id = Number(request.params.id);
    const requesterRoleId = request.decoded.roleId;
    const requesterId = request.decoded.userId;
    userDB.findById(id, {
      attributes: ['id', 'firstName', 'lastName', 'email', 'roleId'],
      include: {
        model: database.Document,
        attributes: ['id', 'access', 'title', 'content', 'ownerId', 'createdAt']
      }
    })
    .then((user) => {
      if (user) {
        const documents = user.Documents.filter((document) => {
          if (Authenticator.verifyAdmin(requesterRoleId)) {
            return true;
          // for other users, ensure they have appropriate access rights
          } else if (
            (document.access === 'public' ||
            requesterRoleId === user.roleId)
            && document.access !== 'private') {
            return true;
          } else if (document.access === 'private'
            && document.ownerId === requesterId) {
            return true;
          }
          return false;
        });
        const safeUser = Object.assign(
          {},
          UserController.getUserFields(user),
          { documents });
        ResponseHandler.sendResponse(
          response,
          200,
          safeUser
        );
      } else {
        ResponseHandler.send404(response);
      }
    });
  }
}

export default UserController;
