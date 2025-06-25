import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Vote } from '../../entities/vote.entity';
import { Feedback } from '../../entities/feedback.entity';
import { CreateVoteDto } from './dto/create-vote.dto';
import * as crypto from 'crypto';
import { Request } from 'express';

@Injectable()
export class VoteService {
  constructor(
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
    private dataSource: DataSource,
  ) {}

  private extractVoterIdentifier(req: Request): string {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const data = `${ip}-${userAgent}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  async create(createVoteDto: CreateVoteDto, req: Request): Promise<Vote> {
    const voterIdentifier = this.extractVoterIdentifier(req);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if feedback exists
      const feedback = await queryRunner.manager.findOne(Feedback, {
        where: { id: createVoteDto.feedbackId },
      });
      if (!feedback) {
        throw new NotFoundException(
          `Feedback with ID ${createVoteDto.feedbackId} not found`,
        );
      }

      // Check if vote already exists
      const existingVote = await queryRunner.manager.findOne(Vote, {
        where: {
          feedbackId: createVoteDto.feedbackId,
          voterIdentifier,
        },
      });
      if (existingVote) {
        throw new ConflictException('You have already voted for this feedback');
      }

      // Create vote
      const vote = queryRunner.manager.create(Vote, {
        feedbackId: createVoteDto.feedbackId,
        voterIdentifier,
      });
      const savedVote = await queryRunner.manager.save(vote);

      // Update vote count
      await queryRunner.manager.increment(
        Feedback,
        { id: createVoteDto.feedbackId },
        'voteCount',
        1,
      );

      await queryRunner.commitTransaction();
      return savedVote;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(feedbackId: string, req: Request): Promise<void> {
    const voterIdentifier = this.extractVoterIdentifier(req);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the vote
      const vote = await queryRunner.manager.findOne(Vote, {
        where: {
          feedbackId,
          voterIdentifier,
        },
      });
      if (!vote) {
        throw new NotFoundException('Vote not found');
      }

      // Delete vote
      await queryRunner.manager.remove(vote);

      // Decrement vote count
      await queryRunner.manager.decrement(
        Feedback,
        { id: feedbackId },
        'voteCount',
        1,
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findUserVotes(feedbackIds: string[], req: Request): Promise<Vote[]> {
    if (feedbackIds.length === 0) return [];

    const voterIdentifier = this.extractVoterIdentifier(req);
    return await this.voteRepository.find({
      where: feedbackIds.map((feedbackId) => ({ feedbackId, voterIdentifier })),
    });
  }
}
