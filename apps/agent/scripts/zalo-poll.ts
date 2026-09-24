import "@crm/env/load";
import { db } from "@crm/db";
import { zaloToken } from "../agent/lib/zalo-api";
import { vongTay } from "../agent/lib/zalo-poll";

if (!(await zaloToken())) {
	console.error("Thiếu ZALO_BOT_TOKEN.");
	process.exitCode = 1;
	await db.$disconnect();
} else {
	await vongTay({
		conTiep: () => true,
		baoLuot: (ket) => console.log(JSON.stringify(ket)),
	});
}
