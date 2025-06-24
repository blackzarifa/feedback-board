import { Controller, Get, Param, Query } from '@nestjs/common';
import { CompanyService } from './company.service';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  findAll(@Query('name') name?: string) {
    return this.companyService.findAll({ name });
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.companyService.findOne(slug);
  }
}
