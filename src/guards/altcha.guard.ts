
import { verifySolution } from 'altcha-lib';
import { AppError, ErrorCodes } from '../types/errors';

export const requireAltcha = (resolver: any) => {
  return async (parent: any, args: any, context: any, info: any) => {
    // 1. Extraer el payload del header que configuramos en tu GraphQLService
    const altchaPayload = context.req.headers['x-altcha-payload'];

    if (!altchaPayload) {
      throw new AppError(ErrorCodes.ALTCHA_VALIDATION_FAILED, {
        message: 'Se requiere validación Altcha'
      });
    }

    try {
      // 2. Verificar la solución
      const isValid = await verifySolution(
        altchaPayload as string, 
        process.env.ALTCHA_HMAC_KEY as string
      );

      if (!isValid) {
        throw new AppError(ErrorCodes.ALTCHA_VALIDATION_FAILED, {
          message: 'Validación de seguridad fallida. Inténtalo de nuevo.'
        });
      }

      // 3. Si es válido, ejecutar el resolver original
      return resolver(parent, args, context, info);
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(ErrorCodes.ALTCHA_VALIDATION_FAILED, {
            message: 'Error al procesar la validación de seguridad'
        });
    }
  };
};