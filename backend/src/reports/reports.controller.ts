import { Controller, Get, Query, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('monthly-trend')
  getMonthlyTrend(@Req() req: any, @Query('year') year: string) {
    return this.service.getMonthlyTrend(req.user.id, +year || new Date().getFullYear());
  }

  @Get('category-breakdown')
  getCategoryBreakdown(
    @Req() req: any,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const now = new Date();
    return this.service.getCategoryBreakdown(req.user.id, +month || now.getMonth() + 1, +year || now.getFullYear());
  }

  @Get('daily')
  getDailySpending(
    @Req() req: any,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const now = new Date();
    return this.service.getDailySpending(req.user.id, +month || now.getMonth() + 1, +year || now.getFullYear());
  }

  @Get('export/csv')
  exportCsv(
    @Req() req: any,
    @Res() res: Response,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const now = new Date();
    return this.service.exportCsv(req.user.id, +month || now.getMonth() + 1, +year || now.getFullYear(), res);
  }
}
