import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from '../../entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
  ) {}

  async create(createFeedbackDto: CreateFeedbackDto): Promise<Feedback> {
    const feedback = this.feedbackRepository.create(createFeedbackDto);
    return await this.feedbackRepository.save(feedback);
  }

  async findAll(filters: {
    companyId?: string;
    status?: string;
    category?: string;
    search?: string;
  }): Promise<Feedback[]> {
    const query = this.feedbackRepository.createQueryBuilder('feedback');

    if (filters.companyId) {
      query.andWhere('feedback.companyId = :companyId', {
        companyId: filters.companyId,
      });
    }

    if (filters.status) {
      query.andWhere('feedback.status = :status', { status: filters.status });
    }

    if (filters.category) {
      query.andWhere('feedback.category = :category', {
        category: filters.category,
      });
    }

    if (filters.search) {
      query.andWhere(
        '(feedback.title ILIKE :search OR feedback.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    query
      .orderBy('feedback.voteCount', 'DESC')
      .addOrderBy('feedback.createdAt', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({ where: { id } });
    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }
    return feedback;
  }

  async update(
    id: string,
    updateFeedbackDto: UpdateFeedbackDto,
    userCompanyId: string,
  ): Promise<Feedback> {
    const feedback = await this.findOne(id);
    
    // Check if the user's company matches the feedback's company
    if (feedback.companyId !== userCompanyId) {
      throw new ForbiddenException('You can only update feedback from your own company');
    }
    
    Object.assign(feedback, updateFeedbackDto);
    return await this.feedbackRepository.save(feedback);
  }

  async remove(id: string, userCompanyId: string): Promise<{ message: string }> {
    // First find the feedback to check company ownership
    const feedback = await this.findOne(id);
    
    // Check if the user's company matches the feedback's company
    if (feedback.companyId !== userCompanyId) {
      throw new ForbiddenException('You can only delete feedback from your own company');
    }
    
    // Delete the feedback
    await this.feedbackRepository.delete(id);
    
    return { message: 'Feedback deleted successfully' };
  }
}
