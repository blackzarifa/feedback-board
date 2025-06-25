import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async findAll(filters: { name?: string }): Promise<Company[]> {
    const query = this.companyRepository.createQueryBuilder('company');

    if (filters.name) {
      query.andWhere('company.name ILIKE :name', { name: `%${filters.name}%` });
    }

    return await query.getMany();
  }

  async findOne(slug: string): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { slug } });
    if (!company) {
      throw new NotFoundException(`Company with slug ${slug} not found`);
    }
    return company;
  }
}
