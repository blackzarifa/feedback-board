import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  findAll(@Query('name') name?: string, @Query('slug') slug?: string) {
    return this.companyService.findAll({ name, slug });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.companyService.findOne(id);
  }
}
