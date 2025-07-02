import type {
  DeleteHalLink,
  GetHalLink,
  PatchHalLink,
  PostHalLink,
  PutHalLink,
} from '@code-net/hal';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PutHalLinkDto implements PutHalLink {
  @ApiProperty({ example: '/api/resource/1', description: 'URL of the link' })
  href!: string;

  @ApiProperty({ example: 'PUT', description: 'HTTP method for the link' })
  method!: 'PUT';

  @ApiPropertyOptional({ example: 'Update', description: 'Title of the link' })
  title?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indicates if the link is templated',
  })
  templated?: boolean;

  [key: string]: unknown;
}

export class PatchHalLinkDto implements PatchHalLink {
  @ApiProperty({ example: '/api/resource/1', description: 'URL of the link' })
  href!: string;

  @ApiProperty({ example: 'PATCH', description: 'HTTP method for the link' })
  method!: 'PATCH';

  @ApiPropertyOptional({ example: 'Update', description: 'Title of the link' })
  title?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indicates if the link is templated',
  })
  templated?: boolean;

  [key: string]: unknown;
}

export class GetHalLinkDto implements GetHalLink {
  @ApiProperty({ example: '/api/resource/1', description: 'URL of the link' })
  href!: string;

  @ApiProperty({ example: 'GET', description: 'HTTP method for the link' })
  method!: 'GET';

  @ApiPropertyOptional({
    example: 'Get Resource',
    description: 'Title of the link',
  })
  title?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indicates if the link is templated',
  })
  templated?: boolean | undefined;

  [key: string]: unknown;
}

export class PostHalLinkDto implements PostHalLink {
  @ApiProperty({ example: '/api/resource/1', description: 'URL of the link' })
  href!: string;

  @ApiProperty({ example: 'POST', description: 'HTTP method for the link' })
  method!: 'POST';

  @ApiPropertyOptional({ example: 'Create', description: 'Title of the link' })
  title?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indicates if the link is templated',
  })
  templated?: boolean;

  [key: string]: unknown;
}

export class DeleteHalLinkDto implements DeleteHalLink {
  @ApiProperty({ example: '/api/resource/1', description: 'URL of the link' })
  href!: string;

  @ApiProperty({ example: 'DELETE', description: 'HTTP method for the link' })
  method!: 'DELETE';

  @ApiPropertyOptional({ example: 'Delete', description: 'Title of the link' })
  title?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indicates if the link is templated',
  })
  templated?: boolean;

  [key: string]: unknown;
}
