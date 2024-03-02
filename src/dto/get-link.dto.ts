import { ApiProperty } from '@nestjs/swagger';

export default class GetLinkDto {
  @ApiProperty({
    example: 'http://localhost/12345',
    required: true
  })
  readonly shortUrl: string;

}