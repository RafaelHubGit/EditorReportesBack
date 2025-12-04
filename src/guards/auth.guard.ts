

export const requireAuth = (resolverFunction: Function) => {
  return async (parent: any, args: any, context: any, info: any) => {
    if (!context.user) {
      const error = new Error('Authentication required');
      
      // Add error code based on authScope
      if (context.authScope?.error === 'expired') {
        (error as any).extensions = { code: 'TOKEN_EXPIRED' };
        error.message = 'Token expired';
      } else if (context.authScope?.error === 'invalid') {
        (error as any).extensions = { code: 'INVALID_TOKEN' };
      }
      
      throw error;
    }
    return resolverFunction(parent, args, context, info);
  };
};