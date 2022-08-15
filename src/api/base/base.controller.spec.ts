import { Test, TestingModule } from '@nestjs/testing'

import { BaseController } from './base.controller'

describe('BaseController', () => {
  let baseController: BaseController

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BaseController],
      providers: [],
    }).compile()

    baseController = app.get<BaseController>(BaseController)
  })
})
