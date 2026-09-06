import { Module } from "@nestjs/common";
import { ContactsModule } from "../contacts/contacts.module";
import { TrpcModule } from "../trpc/trpc.module";
import { CampaignsRouter } from "./campaigns.router";
import { CampaignsService } from "./campaigns.service";

@Module({
	imports: [ContactsModule, TrpcModule],
	providers: [CampaignsService, CampaignsRouter],
	exports: [CampaignsService],
})
export class CampaignsModule {}
