import "@crm/env/load";
import { dangKyWebhook, docThamSo } from "../agent/lib/zalo-dang-ky";

try {
	console.log(await dangKyWebhook(docThamSo(process.argv.slice(2))));
} catch (loi) {
	console.error(loi instanceof Error ? loi.message : String(loi));
	process.exitCode = 1;
}
