import "@crm/env/load";
import { zaloToken } from "../agent/lib/zalo-api";
import { vongTay } from "../agent/lib/zalo-poll";

if (!zaloToken()) {
	console.error("Thiếu ZALO_BOT_TOKEN.");
	process.exitCode = 1;
} else {
	await vongTay({
		conTiep: () => true,
		baoLuot: (ket) => console.log(JSON.stringify(ket)),
	});
}
