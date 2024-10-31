import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { User as UserEntity } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {
  CreateResumeDto,
  importResumeSchema,
  ResumeDto,
  UpdateResumeDto,
} from "@reactive-resume/dto";
import { resumeDataSchema } from "@reactive-resume/schema";
import { ErrorMessage } from "@reactive-resume/utils";
import { zodToJsonSchema } from "zod-to-json-schema";

// import { OptionalGuard } from "../auth/guards/optional.guard";
import { Resume } from "./decorators/resume.decorator";
import { ResumeGuard } from "./guards/resume.guard";
import { ResumeService } from "./resume.service";

const USER_ID = "124235435w4323432243242gdfgdv";

@ApiTags("Resume")
@Controller("resume")
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Get("schema")
  getSchema() {
    return zodToJsonSchema(resumeDataSchema);
  }

  @Post()
  // @UseGuards(TwoFactorGuard)
  async create(@Body() createResumeDto: CreateResumeDto) {
    try {
      return await this.resumeService.create(USER_ID, createResumeDto);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
        throw new BadRequestException(ErrorMessage.ResumeSlugAlreadyExists);
      }

      Logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  @Post("import")
  // @UseGuards(TwoFactorGuard)
  async import(@Body() importResumeDto: unknown) {
    try {
      const result = importResumeSchema.parse(importResumeDto);
      return await this.resumeService.import(result);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
        throw new BadRequestException(ErrorMessage.ResumeSlugAlreadyExists);
      }

      Logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  @Get()
  // @UseGuards(TwoFactorGuard)
  findAll() {
    return this.resumeService.findAll();
  }

  @Get(":id")
  @UseGuards(ResumeGuard)
  findOne(@Resume() resume: ResumeDto) {
    return resume;
  }

  @Get(":id/statistics")
  // @UseGuards(TwoFactorGuard)
  findOneStatistics(@Param("id") id: string) {
    return this.resumeService.findOneStatistics(id);
  }

  @Patch(":id")
  // @UseGuards(TwoFactorGuard)
  update(
    @Param("id") id: string,
    @Body() updateResumeDto: UpdateResumeDto,
  ) {
    return this.resumeService.update(id, updateResumeDto);
  }

  @Patch(":id/lock")
  // @UseGuards(TwoFactorGuard)
  lock(@Param("id") id: string, @Body("set") set = true) {
    return this.resumeService.lock(id, set);
  }

  @Delete(":id")
  // @UseGuards(TwoFactorGuard)
  remove(@Param("id") id: string) {
    return this.resumeService.remove(id);
  }

  @Get("/print/:id")
  @UseGuards(ResumeGuard)
  async printResume(@Resume() resume: ResumeDto) {
    try {
      const url = await this.resumeService.printResume(resume, );

      return { url };
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  @Get("/print/:id/preview")
  @UseGuards(ResumeGuard)
  async printPreview(@Resume() resume: ResumeDto) {
    try {
      const url = await this.resumeService.printPreview(resume);

      return { url };
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }
}
