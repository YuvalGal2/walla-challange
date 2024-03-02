// app.controller.ts
import { Controller, Post, Body, Res, Get, Param } from "@nestjs/common";
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UrlService } from './services/url.service';
import CreateLinkDto from './dto/create-link.dto';
import { query } from "express";
@ApiTags('URL Shortener')
@Controller()
export class AppController {
  constructor(private readonly urlService: UrlService) {}

  @Post('shorten')
  @ApiResponse({ status: 200, description: 'Shorten URL' })
  async shortenUrl(@Body() body: CreateLinkDto) {
    return await this.urlService.shortenUrl(body.url);
  }
  @Post('expand')
  @ApiResponse({ status: 200, description: 'Expand URL' })
  async expandUrl(@Body() body: { shortUrl: string }) {
    return await this.urlService.expandUrl(body.shortUrl);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Expand URL' })
  async redirect(@Param() params: any, @Res() res) {
    const originalLink = await this.urlService.expandUrl(params.id);
    // Add "http://" prefix if not already present
    const prefixedLink =
      originalLink.startsWith('http://') || originalLink.startsWith('https://')
      ? originalLink
      : `http://${originalLink}`;

    return res.redirect(prefixedLink);
  }

}
