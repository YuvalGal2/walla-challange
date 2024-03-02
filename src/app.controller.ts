import { Controller, Post, Body, Res, Get, Param } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UrlService } from './services/url.service';
import CreateLinkDto from './dto/create-link.dto';
import { UrlEntity } from './entities/url.entity';
import GetLinkDto from './dto/get-link.dto';

@ApiTags('URL Shortener')
@Controller()
export class AppController {
  constructor(private readonly urlService: UrlService) {}

  @Post('shorten')
  @ApiTags('shorten')
  @ApiBody({
    type: CreateLinkDto,
    description: 'Json structure for creation of a short link',
  })
  @ApiOkResponse({
    status: 200,
    description: 'The original link, for example www.google.com',
    type: UrlEntity,
  })
  @ApiParam({
    name: 'url',
    required: true,
    description:
      'Full URL to be shortened, must be a valid URL with either www or http/https',
    example: 'www.google.com',
  })
  async shortenUrl(@Body() body: CreateLinkDto) {
    return await this.urlService.shortenUrl(body.url);
  }

  @Post('expand')
  @ApiBody({
    type: GetLinkDto,
    description:
      'Json structure for getting the original Link assigned to short url',
  })
  @ApiResponse({ status: 200, description: 'Expand URL' })
  async expandUrl(@Body() body: GetLinkDto) {
    return await this.urlService.expandUrl(body.shortUrl);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Redirect to Original URL / Error if not assigned ',
  })
  @ApiParam({ name: 'id', example: 'ltaabvtu2' })
  async redirect(@Param('id') id: string, @Res() res) {
    const link = await this.urlService.expandUrl(id);
    return res.redirect(link.originalUrl);
  }
}
