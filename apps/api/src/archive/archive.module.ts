import { Module } from "@nestjs/common";
import { CompaniesModule } from "../companies/companies.module";
import { ContactsModule } from "../contacts/contacts.module";
import { DealsModule } from "../deals/deals.module";
import { FieldsModule } from "../fields/fields.module";
import { ArchiveRetentionController } from "./archive-retention.controller";

@Module({
	imports: [CompaniesModule, ContactsModule, DealsModule, FieldsModule],
	controllers: [ArchiveRetentionController],
})
export class ArchiveModule {}
