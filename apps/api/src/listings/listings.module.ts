import { Module } from "@nestjs/common";
import { FieldsModule } from "../fields/fields.module";
import { ListingFieldsService } from "./listing-fields.service";
import { ListingIngestService } from "./listing-ingest.service";
import { ListingsController } from "./listings.controller";

@Module({
	imports: [FieldsModule],
	controllers: [ListingsController],
	providers: [ListingFieldsService, ListingIngestService],
	exports: [ListingIngestService],
})
export class ListingsModule {}
