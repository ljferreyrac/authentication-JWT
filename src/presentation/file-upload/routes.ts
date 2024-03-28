import { Router } from 'express';
import { FileUploadService } from '../services';
import { FileUploadController } from './controller';
import { FileUploadMiddleware } from '../middlewares/file-upload.middleware';
import { TypeMiddleware } from '../middlewares/type.middleware';

export class FileUploadRoutes {

  static get routes(): Router {

    const router = Router();
    const controller = new FileUploadController(new FileUploadService());

    router.use(FileUploadMiddleware.contianFile);
    // Definir las rutas
    router.post('/single/:type', 
      TypeMiddleware.validTypes(['users', 'products', 'categories']), 
      controller.uploadFile);
    router.post('/multiple/:type', 
      TypeMiddleware.validTypes(['users', 'products', 'categories']),
      controller.uploadMultipleFile);

    return router;
  }


}

