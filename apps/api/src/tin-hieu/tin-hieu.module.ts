import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc.module";
import { TinHieuRouter } from "./tin-hieu.router";
import { TinHieuService } from "./tin-hieu.service";
import { TinHieuLichRouter } from "./tin-hieu-lich.router";

@Module({
	imports: [TrpcModule],
	providers: [TinHieuService, TinHieuRouter, TinHieuLichRouter],
})
export class TinHieuModule {}
