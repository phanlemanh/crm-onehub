import { Module } from "@nestjs/common";
import { AgentModule } from "../agent/agent.module";
import { TrpcModule } from "../trpc/trpc.module";
import { FieldFilesRouter } from "./field-files.router";
import { FieldFilesService } from "./field-files.service";
import { FieldsRouter } from "./fields.router";
import { FieldsService } from "./fields.service";
import { KHO_TEP, khoTepProvider } from "./kho-tep";
import { LUAT_TEP, luatTepProvider } from "./luat-tep";

@Module({
	imports: [TrpcModule, AgentModule],
	providers: [
		FieldsService,
		FieldsRouter,
		khoTepProvider,
		luatTepProvider,
		FieldFilesService,
		FieldFilesRouter,
	],
	exports: [FieldsService, FieldFilesService, KHO_TEP, LUAT_TEP],
})
export class FieldsModule {}
