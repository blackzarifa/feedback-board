import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Feedback } from './feedback.entity';

@Entity('votes')
@Unique(['feedbackId', 'voterIdentifier'])
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'feedback_id' })
  feedbackId: string;

  @Column({ name: 'voter_identifier' })
  voterIdentifier: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Feedback, (feedback) => feedback.votes)
  @JoinColumn({ name: 'feedback_id' })
  feedback: Feedback;
}
