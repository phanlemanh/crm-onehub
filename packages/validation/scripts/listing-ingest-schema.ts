import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import { listingBatch } from "../src/listing-ingest";

const target = process.argv[2];

if (!target) {
	console.error("listing-ingest-schema: cần một đường dẫn tệp đích");
	process.exit(2);
}

const schema = z.toJSONSchema(listingBatch, { target: "draft-2020-12" });
writeFileSync(resolve(target), `${JSON.stringify(schema, null, 2)}\n`, "utf8");
console.log(`listing-ingest-schema: đã ghi ${resolve(target)}`);
