import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateContactUsDto } from 'api/base/create-contactus.dto'
import { Contactus } from 'entities'
import { getEmailHtml } from 'lib'
import { EmailFrom, EmailService } from 'shared/services'
import { Repository } from 'typeorm'

@Injectable()
export class ContactusService {
  constructor(
    @InjectRepository(Contactus)
    private contactusRepository: Repository<Contactus>,
    private readonly emailService: EmailService,
  ) {}

  async create(data: CreateContactUsDto) {
    const newItem = await this.contactusRepository.create(data)
    await this.contactusRepository.save(newItem)

    const message = getEmailHtml([
      { type: 'element1', data: ['Contact Us'] },
      {
        type: 'element2',
        data: [`Full Name: ${data.name}`],
      },
      {
        type: 'element2',
        data: [`Email: ${data.email}`],
      },
      {
        type: 'element2',
        data: [`Phone Number: ${data.phone}`],
      },
      {
        type: 'element2',
        data: [data.message],
      },
    ])
    await this.emailService.send({
      from: EmailFrom.HOME_EMAIL,
      to: EmailFrom.INFO_EMAIL,
      subject: 'Contact Us',
      html: message,
      text: 'Contact Us',
    })
  }
}
