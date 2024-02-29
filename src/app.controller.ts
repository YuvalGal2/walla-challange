// app.controller.ts
import { Controller, Post, Body, Redirect } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UrlService } from './services/url.service';
import CreateLinkDto from "./dto/create-link.dto";

@ApiTags('URL Shortener')
@Controller()
export class AppController {
  constructor(private readonly urlService: UrlService) {}
  @Post('shorten')
  @ApiResponse({ status: 200, description: 'Shorten URL' })
  shortenUrl(@Body() body: CreateLinkDto): Promise<string> {
    return this.urlService.shortenUrl(body.url);
  }

  @Post('expand')
  @ApiResponse({ status: 200, description: 'Expand URL' })
  expandUrl(@Body() body: { shortUrl: string }) {
    // return this.urlService.expandUrl(body.shortUrl);
  }


}
