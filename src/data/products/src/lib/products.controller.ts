import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import type { ProductInterface } from '@bank/models';
import { ProductDto } from './product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  getAll() {
    return { data: this.productsService.findAll() };
  }

  @Get('verification/:id')
  verifyIdentifier(@Param('id') id: string): boolean {
    return this.productsService.exists(id);
  }

  @Get(':id')
  getOne(@Param('id') id: string): ProductInterface {
    return this.productsService.findOne(id);
  }

  @Post()
  create(@Body() product: ProductDto) {
    return {
      message: 'Product added successfully',
      data: this.productsService.create(product),
    };
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() changes: Partial<ProductDto>) {
    return {
      message: 'Product updated successfully',
      data: this.productsService.update(id, changes),
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.productsService.remove(id);
    return { message: 'Product removed successfully' };
  }
}
