import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc.module";
import { ThongBaoRouter } from "./thong-bao.router";
import { ThongBaoService } from "./thong-bao.service";

@Module({
	imports: [TrpcModule],
	providers: [ThongBaoService, ThongBaoRouter],
})
export class ThongBaoModule {}
