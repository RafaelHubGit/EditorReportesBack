
import { Router } from 'express';
import pdfRouter from './pdf';
import sseRouter from './sse/sse.routes';
import { generateAdminUser } from './admin/controller';
import { generateAltchaChallenge } from './altcha/controller';

const mainRouter = Router();

const adminRouter = Router();
adminRouter.post('/generateAdminUser', generateAdminUser);

const altchaRouter = Router();
altchaRouter.get('/generateAltchaChallenge', generateAltchaChallenge);


mainRouter.use('/pdf', pdfRouter);
mainRouter.use('/admin', adminRouter);
mainRouter.use('/altcha', altchaRouter);

mainRouter.use('/sse', sseRouter);


export default mainRouter;