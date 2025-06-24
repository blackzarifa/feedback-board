import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Company } from '../entities/company.entity';
import { User } from '../entities/user.entity';
import {
  Feedback,
  FeedbackCategory,
  FeedbackStatus,
} from '../entities/feedback.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    const companyRepo = dataSource.getRepository(Company);
    const userRepo = dataSource.getRepository(User);
    const feedbackRepo = dataSource.getRepository(Feedback);

    // Create companies
    const companies = [
      { name: 'TechCorp Solutions', slug: 'techcorp' },
      { name: 'StartupHub', slug: 'startuphub' },
      { name: 'DevTools Inc', slug: 'devtools' },
    ];

    const createdCompanies: Company[] = [];

    for (const companyData of companies) {
      let company = await companyRepo.findOne({
        where: { slug: companyData.slug },
      });

      if (!company) {
        company = await companyRepo.save(companyData);
        console.log(`✅ Created company: ${company.name}`);
      }
      createdCompanies.push(company);

      // Create admin user for each company
      const existingUser = await userRepo.findOne({
        where: { email: `admin@${companyData.slug}.com` },
      });

      if (!existingUser) {
        const passwordHash = await bcrypt.hash('password123', 10);
        await userRepo.save({
          email: `admin@${companyData.slug}.com`,
          passwordHash,
          companyId: company.id,
        });
        console.log(`✅ Created admin user: admin@${companyData.slug}.com`);
      }
    }

    // Create sample feedback for each company
    const sampleFeedback = [
      {
        title: 'Add dark mode support',
        description:
          'It would be great to have a dark mode option for better viewing at night.',
        category: FeedbackCategory.FEATURE,
        status: FeedbackStatus.PLANNED,
        voteCount: 45,
        submitterEmail: 'user1@example.com',
      },
      {
        title: 'Export data to CSV',
        description:
          'Need ability to export all data to CSV format for reporting purposes.',
        category: FeedbackCategory.FEATURE,
        status: FeedbackStatus.UNDER_REVIEW,
        voteCount: 32,
        submitterEmail: 'user2@example.com',
      },
      {
        title: 'Mobile app crashes on startup',
        description: 'The app crashes immediately when opened on iPhone 12.',
        category: FeedbackCategory.BUG,
        status: FeedbackStatus.IN_PROGRESS,
        voteCount: 28,
      },
      {
        title: 'Improve search functionality',
        description:
          'Search should include filters and support for advanced queries.',
        category: FeedbackCategory.IMPROVEMENT,
        status: FeedbackStatus.NEW,
        voteCount: 15,
        submitterEmail: 'user3@example.com',
      },
      {
        title: 'Add two-factor authentication',
        description: 'For better security, please add 2FA support.',
        category: FeedbackCategory.FEATURE,
        status: FeedbackStatus.COMPLETED,
        voteCount: 67,
        submitterEmail: 'security@example.com',
      },
      {
        title: 'Performance issues with large datasets',
        description:
          'The application becomes very slow when working with datasets over 10,000 records.',
        category: FeedbackCategory.BUG,
        status: FeedbackStatus.UNDER_REVIEW,
        voteCount: 23,
      },
      {
        title: 'Add API documentation',
        description:
          'Please provide comprehensive API documentation with examples.',
        category: FeedbackCategory.OTHER,
        status: FeedbackStatus.NEW,
        voteCount: 8,
        submitterEmail: 'developer@example.com',
      },
    ];

    // Create feedback for each company
    for (const company of createdCompanies) {
      const existingFeedback = await feedbackRepo.count({
        where: { companyId: company.id },
      });

      if (existingFeedback === 0) {
        // Shuffle and take a random subset of feedback for each company
        const shuffled = [...sampleFeedback].sort(() => 0.5 - Math.random());
        const feedbackCount = Math.floor(Math.random() * 3) + 4; // 4-6 feedback items per company

        for (let i = 0; i < feedbackCount; i++) {
          const feedback = shuffled[i];
          await feedbackRepo.save({
            ...feedback,
            companyId: company.id,
            voteCount: Math.floor(Math.random() * 100), // Random vote count
          });
        }
        console.log(
          `✅ Created ${feedbackCount} feedback items for ${company.name}`,
        );
      }
    }

    console.log('\n📋 Test Accounts:');
    console.log('─────────────────');
    for (const company of companies) {
      console.log(`Company: ${company.name}`);
      console.log(`  Admin: admin@${company.slug}.com`);
      console.log(`  Password: password123`);
      console.log(`  Public board: /${company.slug}`);
      console.log('');
    }
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await app.close();
  }
}

seed();
