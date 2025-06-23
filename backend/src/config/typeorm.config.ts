import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: configService.get('DATABASE_URL'),
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  extra: {
    // For Supabase pooler compatibility
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
