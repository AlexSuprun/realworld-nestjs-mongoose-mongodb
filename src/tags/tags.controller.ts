import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TagsService } from './tags.service';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private tagsService: TagsService) {}
  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  async getTags() {
    return { tags: await this.tagsService.getTags() };
  }
}
