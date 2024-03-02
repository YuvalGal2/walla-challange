// app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UrlService } from './services/url.service';
import { DnsLookupService } from './services/dns-lookup-service';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as process from 'process';
import { UrlEntity } from './entities/url.entity'; // Import the schema

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: 3306,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [UrlEntity],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [UrlService, DnsLookupService],
})
export class AppModule {}
