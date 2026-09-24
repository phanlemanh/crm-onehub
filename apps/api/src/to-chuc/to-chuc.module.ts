import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc.module";
import { ToChucRouter } from "./to-chuc.router";
import { ToChucService } from "./to-chuc.service";

@Module({
	imports: [TrpcModule],
	providers: [ToChucService, ToChucRouter],
	exports: [ToChucService],
})
export class ToChucModule {}
