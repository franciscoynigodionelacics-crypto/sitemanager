import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { AuthMiddleware } from './middleware/auth.middleware';

const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://localhost:3100';
const CAMPAIGN_SERVICE = process.env.CAMPAIGN_SERVICE_URL || 'http://localhost:3200';
const CART_SERVICE = process.env.CART_SERVICE_URL || 'http://localhost:3300';
const PAYMENT_SERVICE = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3400';
const PROFILE_SERVICE = process.env.PROFILE_SERVICE_URL || 'http://localhost:3500';

@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Auth routes — no JWT required
    consumer
      .apply(createProxyMiddleware({ target: AUTH_SERVICE, changeOrigin: true }) as any)
      .forRoutes({ path: 'auth/*', method: RequestMethod.ALL });

    // Protected routes — JWT required
    consumer
      .apply(AuthMiddleware, createProxyMiddleware({ target: CAMPAIGN_SERVICE, changeOrigin: true }) as any)
      .forRoutes({ path: 'campaigns*', method: RequestMethod.ALL });

    consumer
      .apply(AuthMiddleware, createProxyMiddleware({ target: CART_SERVICE, changeOrigin: true }) as any)
      .forRoutes({ path: 'cart*', method: RequestMethod.ALL });

    consumer
      .apply(AuthMiddleware, createProxyMiddleware({ target: PAYMENT_SERVICE, changeOrigin: true }) as any)
      .forRoutes({ path: 'purchases*', method: RequestMethod.ALL });

    consumer
      .apply(AuthMiddleware, createProxyMiddleware({ target: PROFILE_SERVICE, changeOrigin: true }) as any)
      .forRoutes(
        { path: 'profile*', method: RequestMethod.ALL },
        { path: 'impact*', method: RequestMethod.ALL },
      );
  }
}
