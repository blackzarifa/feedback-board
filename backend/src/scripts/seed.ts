import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    const companyRepo = dataSource.getRepository('Company');
    const userRepo = dataSource.getRepository('User');

    const existingCompany = await companyRepo.findOne({
      where: { slug: 'test-company' },
    });

    let company = existingCompany;
    if (!company) {
      company = await companyRepo.save({
        name: 'Test Company',
        slug: 'test-company',
        domain: 'testcompany.com',
        logoUrl: null,
      });
      console.log('✅ Created test company');
    }

    const existingUser = await userRepo.findOne({
      where: { email: 'admin@testcompany.com' },
    });
    if (!existingUser) {
      const passwordHash = await bcrypt.hash('password123', 10);
      await userRepo.save({
        email: 'admin@testcompany.com',
        passwordHash,
        companyId: company.id,
      });
      console.log('✅ Created admin user:');
      console.log('   Email: admin@testcompany.com');
      console.log('   Password: password123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await app.close();
  }
}

seed();
