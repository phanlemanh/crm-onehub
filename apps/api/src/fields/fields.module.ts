import { Module } from "@nestjs/common";
import { AgentModule } from "../agent/agent.module";
import { TrpcModule } from "../trpc/trpc.module";
import { khoTepProvider, KHO_TEP } from "./kho-tep";
import { FieldFilesRouter } from "./field-files.router";
import { FieldFilesService } from "./field-files.service";
import { FieldsRouter } from "./fields.router";
import { FieldsService } from "./fields.service";

@Module({
	imports: [TrpcModule, AgentModule],
	providers: [
		FieldsService,
		FieldsRouter,
		khoTepProvider,
		FieldFilesService,
		FieldFilesRouter,
	],
	exports: [FieldsService, FieldFilesService, KHO_TEP],
})
export class FieldsModule {}
