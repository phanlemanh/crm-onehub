import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc.module";
import { TinHieuRouter } from "./tin-hieu.router";
import { TinHieuService } from "./tin-hieu.service";

@Module({
	imports: [TrpcModule],
	providers: [TinHieuService, TinHieuRouter],
})
export class TinHieuModule {}
