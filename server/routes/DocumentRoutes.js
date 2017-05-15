import DocumentController from '../controllers/DocumentController';
import Authenticator from '../middlewares/Authenticator';
import DocumentMiddleware from '../middlewares/DocumentMiddleware';

/**
 * Class for creating Document routes
 */
class DocumentRoutes {
  /**
   * Method to set the various document routes
   * @param{Object} router - Express router
   * @return{Void} - returns Void
   */
  static setDocumentRoutes(router) {
    DocumentRoutes.getDocuments(router);
    DocumentRoutes.getDocument(router);
    DocumentRoutes.createDocument(router);
    DocumentRoutes.updateDocument(router);
    DocumentRoutes.deleteDocument(router);
  }

  /**
   * Method to set controller for fetch documents route
   * @param{Object} router - Express router
   * @return{Void} - Returns void
   */
  static getDocuments(router) {
    router.get(
      '/documents',
      Authenticator.authenticateUser,
      DocumentMiddleware.validateGetRequest,
      DocumentController.fetchDocuments
    );
  }

  /**
   * Method to set controller for fetch document route
   * @param{Object} router - Express router
   * @return{Void} - Returns void
   */
  static getDocument(router) {
    router.get(
      '/documents/:id',
      Authenticator.authenticateUser,
      DocumentMiddleware.validateGetRequest,
      DocumentController.fetchDocument
    );
  }

  /**
   * Method to set controller for create a document route
   * @param{Object} router - Express router
   * @return{Void}  - Returns void
   */
  static createDocument(router) {
    router.post(
      '/documents',
      Authenticator.authenticateUser,
      DocumentMiddleware.validateCreateRequest,
      DocumentController.createDocument
    );
  }

  /**
   * Method to set controller for update documents route
   * @param{Object} router - Express router
   * @return{Void} - Returns void
   */
  static updateDocument(router) {
    router.put(
      '/documents/:id',
      Authenticator.authenticateUser,
      DocumentController.updateDocument
    );
  }

  /**
   * Method to set controller for delete document route
   * @param{Object} router - Express router
   * @return{Void} - Returns void
   */
  static deleteDocument(router) {
    router.delete(
      '/documents/:id',
      Authenticator.authenticateUser,
      DocumentController.deleteDocument
    );
  }
}

export default DocumentRoutes;
