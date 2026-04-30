import { Module } from '@nestjs/common';
import { PurchasesModule } from './purchases/purchases.module';

@Module({ imports: [PurchasesModule] })
export class AppModule {}
