import { ConflictException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Newsletter } from 'entities'
import { Repository } from 'typeorm'

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(Newsletter)
    private newsletterRepository: Repository<Newsletter>,
  ) {}

  async create(email: string) {
    const item = await this.newsletterRepository.findOneBy({ email })
    if (item) throw new ConflictException('Same email is already exists')

    const newItem = await this.newsletterRepository.create({ email })
    await this.newsletterRepository.save(newItem)
  }
}
