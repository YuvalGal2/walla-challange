import { ApiProperty } from '@nestjs/swagger';

export default class CreateLinkDto {
  @ApiProperty({
    example: 'www.google.com',
    required: true
  })
  readonly url: string;
}