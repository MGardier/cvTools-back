import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { JobService } from './job.service';


@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

}
