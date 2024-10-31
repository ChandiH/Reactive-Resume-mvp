import { CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { ErrorMessage } from "@reactive-resume/utils";
import { Request } from "express";

import { ResumeService } from "../resume.service";

@Injectable()
export class ResumeGuard implements CanActivate {
  constructor(private readonly resumeService: ResumeService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    try {
      const resume = await this.resumeService.findOne(request.params.id);
      request.payload = { resume };

      return true;
    } catch {
      throw new NotFoundException(ErrorMessage.ResumeNotFound);
    }
  }
}
