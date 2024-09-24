import { Test, TestingModule } from '@nestjs/testing';
import { ShoppingCartLinesService } from './shopping-cart-lines.service';

describe('ShoppingCartLinesService', () => {
  let service: ShoppingCartLinesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShoppingCartLinesService],
    }).compile();

    service = module.get<ShoppingCartLinesService>(ShoppingCartLinesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
