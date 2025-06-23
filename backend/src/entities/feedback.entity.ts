import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from './company.entity';
import { Vote } from './vote.entity';

export enum FeedbackCategory {
  FEATURE = 'feature',
  BUG = 'bug',
  IMPROVEMENT = 'improvement',
  OTHER = 'other',
}

export enum FeedbackStatus {
  NEW = 'new',
  UNDER_REVIEW = 'under_review',
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: FeedbackCategory,
  })
  category: FeedbackCategory;

  @Column({
    type: 'enum',
    enum: FeedbackStatus,
    default: FeedbackStatus.NEW,
  })
  status: FeedbackStatus;

  @Column({ name: 'submitter_email', nullable: true })
  submitterEmail: string;

  @Column({ name: 'vote_count', default: 0 })
  voteCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Company, (company) => company.feedbacks)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany(() => Vote, (vote) => vote.feedback)
  votes: Vote[];
}
