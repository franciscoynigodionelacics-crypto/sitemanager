"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const http_proxy_middleware_1 = require("http-proxy-middleware");
const auth_middleware_1 = require("./middleware/auth.middleware");
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://localhost:3100';
const CAMPAIGN_SERVICE = process.env.CAMPAIGN_SERVICE_URL || 'http://localhost:3200';
const CART_SERVICE = process.env.CART_SERVICE_URL || 'http://localhost:3300';
const PAYMENT_SERVICE = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3400';
const PROFILE_SERVICE = process.env.PROFILE_SERVICE_URL || 'http://localhost:3500';
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply((0, http_proxy_middleware_1.createProxyMiddleware)({ target: AUTH_SERVICE, changeOrigin: true }))
            .forRoutes({ path: 'auth/*', method: common_1.RequestMethod.ALL });
        consumer
            .apply(auth_middleware_1.AuthMiddleware, (0, http_proxy_middleware_1.createProxyMiddleware)({ target: CAMPAIGN_SERVICE, changeOrigin: true }))
            .forRoutes({ path: 'campaigns*', method: common_1.RequestMethod.ALL });
        consumer
            .apply(auth_middleware_1.AuthMiddleware, (0, http_proxy_middleware_1.createProxyMiddleware)({ target: CART_SERVICE, changeOrigin: true }))
            .forRoutes({ path: 'cart*', method: common_1.RequestMethod.ALL });
        consumer
            .apply(auth_middleware_1.AuthMiddleware, (0, http_proxy_middleware_1.createProxyMiddleware)({ target: PAYMENT_SERVICE, changeOrigin: true }))
            .forRoutes({ path: 'purchases*', method: common_1.RequestMethod.ALL });
        consumer
            .apply(auth_middleware_1.AuthMiddleware, (0, http_proxy_middleware_1.createProxyMiddleware)({ target: PROFILE_SERVICE, changeOrigin: true }))
            .forRoutes({ path: 'profile*', method: common_1.RequestMethod.ALL }, { path: 'impact*', method: common_1.RequestMethod.ALL });
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({})
], AppModule);
//# sourceMappingURL=app.module.js.map