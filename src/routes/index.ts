
import { Router } from 'express';
import pdfRouter from './pdf';
import { generateAdminUser } from './admin/controller';

const router = Router();

router.post('/generateAdminUser', generateAdminUser);


export const routers = {
  pdf: pdfRouter,
  admin: router
};