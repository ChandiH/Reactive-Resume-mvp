import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { CreateResumeDto, ImportResumeDto, ResumeDto, UpdateResumeDto } from "@reactive-resume/dto";
import { defaultResumeData, ResumeData } from "@reactive-resume/schema";
import type { DeepPartial } from "@reactive-resume/utils";
import { ErrorMessage, generateRandomName, kebabCase } from "@reactive-resume/utils";
import deepmerge from "deepmerge";
import { PrismaService } from "nestjs-prisma";

import { PrinterService } from "@/server/printer/printer.service";

import { StorageService } from "../storage/storage.service";

@Injectable()
export class ResumeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly printerService: PrinterService,
    private readonly storageService: StorageService,
  ) {}

  async create(userId: string, createResumeDto: CreateResumeDto) {
    const {email, name} = {
      email: "somesh@gmail.com",
      name: "Somesh",
    }

    const data = deepmerge(defaultResumeData, {
      basics: { name, email, picture: { url: "" } },
    } satisfies DeepPartial<ResumeData>);

    return this.prisma.resume.create({
      data: {
        data,
        userId,
        title: createResumeDto.title,
        visibility: createResumeDto.visibility,
        slug: createResumeDto.slug ?? kebabCase(createResumeDto.title),
      },
    });
  }

  import(importResumeDto: ImportResumeDto) {
    const randomTitle = generateRandomName();

    return this.prisma.resume.create({
      data: {
        userId: "123",
        visibility: "private",
        data: importResumeDto.data,
        title: importResumeDto.title ?? randomTitle,
        slug: importResumeDto.slug ?? kebabCase(randomTitle),
      },
    });
  }

  findAll() {
    return this.prisma.resume.findMany();
  }

  findOne(id: string) {
    return this.prisma.resume.findUniqueOrThrow({ where: { id } });
  }

  async findOneStatistics(id: string) {
    const result = await this.prisma.statistics.findFirst({
      select: { views: true, downloads: true },
      where: { resumeId: id },
    });

    return {
      views: result?.views ?? 0,
      downloads: result?.downloads ?? 0,
    };
  }

  async update(id: string, updateResumeDto: UpdateResumeDto) {
    try {
      const { locked } = await this.prisma.resume.findUniqueOrThrow({
        where: { id },
        select: { locked: true },
      });

      if (locked) throw new BadRequestException(ErrorMessage.ResumeLocked);

      return await this.prisma.resume.update({
        data: {
          title: updateResumeDto.title,
          slug: updateResumeDto.slug,
          visibility: updateResumeDto.visibility,
          data: updateResumeDto.data as unknown as Prisma.JsonObject,
        },
        where: { id },
      });
    } catch (error) {
      if (error.code === "P2025") {
        Logger.error(error);
        throw new InternalServerErrorException(error);
      }
    }
  }

  lock(id: string, set: boolean) {
    return this.prisma.resume.update({
      data: { locked: set },
      where: { id },
    });
  }

  async remove(id: string) {
    await Promise.all([
      // Remove files in storage, and their cached keys
      this.storageService.deleteObject("resumes", id),
      this.storageService.deleteObject("previews", id),
    ]);

    return this.prisma.resume.delete({ where: { id } });
  }

  async printResume(resume: ResumeDto) {
    const url = await this.printerService.printResume(resume);
    return url;
  }

  printPreview(resume: ResumeDto) {
    return this.printerService.printPreview(resume);
  }
}
