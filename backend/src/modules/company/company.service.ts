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

  async findAll(filters: { name?: string; slug?: string }): Promise<Company[]> {
    const query = this.companyRepository.createQueryBuilder('company');

    if (filters.name) {
      query.andWhere('company.name = :name', { name: filters.name });
    }

    if (filters.slug) {
      query.andWhere('company.slug = :slug', { slug: filters.slug });
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }
}
