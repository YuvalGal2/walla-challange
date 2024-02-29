// app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { UrlService } from './services/url.service';
import { DnsLookupService } from './services/dns-lookup-service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlEntity } from './entities/url.entity';
import * as process from "process"; // Import the schema

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/url-shortener'),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: 'localhost',
      port: 27017,
      username: process.env.MONGODB_USER,
      password: process.env.MONGODB_PASS,
      database: 'url-shortener',
      entities: [UrlEntity],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [UrlService, DnsLookupService],
})
export class AppModule {}
