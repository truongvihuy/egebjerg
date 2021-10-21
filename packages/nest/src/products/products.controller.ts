import { Controller, Get, Post, Put, Delete, Param, UseGuards, Request, HttpException, HttpStatus, Query, ForbiddenException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { checkPermission } from '../helper/general.helper';

const collection = 'product';
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) { }

  @Get()
  getAll(@Request() req, @Query() query) {
    if (checkPermission('get', collection, req.user)) {
      return this.productsService.find(query);
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  @Get('/:id')
  getById(@Request() req, @Param() params) {
    if (checkPermission('get', collection, req.user)) {
      return this.productsService.findById(params.id);
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  @Get('/order')
  searchForOrder(@Request() req, @Query('name') name: string, @Query('category_id') category_id: number) {
    if (checkPermission('get', collection, req.user)) {
      category_id = +category_id;
      return this.productsService.searchForOrder(name, category_id);
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  @Put('/order')
  updateOrder(@Request() req) {
    if (checkPermission('update', collection, req.user)) {
      return this.productsService.updateOrder(req.body._id, req.body.order);
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  @Post()
  insert(@Request() req) {
    if (checkPermission('insert', collection, req.user)) {
      return this.productsService.insert(req.body);
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  @Put('/:_id')
  update(@Request() req, @Param('_id') _id: number) {
    if (checkPermission('update', collection, req.user)) {
      _id = +_id;
      return this.productsService.update(_id, req.body);
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }
  @Put('/tags')
  updateTag(@Request() req) {
    if (checkPermission('update', collection, req.user)) {
      return this.productsService.updateTag(req.body);
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  @Delete('/:_id')
  delete(@Request() req, @Param('_id') _id: number) {
    if (checkPermission('delete', collection, req.user)) {
      _id = +_id;
      return this.productsService.delete(_id);
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }
}

