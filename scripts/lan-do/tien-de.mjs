#!/usr/bin/env bun
/**
 * Tiền đề của LÀN ĐO — đặt trước, dọn sau, luôn luôn.
 *
 * Vì sao tồn tại: middleware của app có HAI cổng onboarding. Cổng 1
 * (`readWorkspaceGate`) đã settled nhờ mốc `onboardedAt` mà seed đặt. Cổng 2
 * (`readResearchGate`) đòi `settings.researchKey` trả `configured: true`, tức
 * `AppSetting.contextDevApiKey` khác null. Thiếu nó thì MỌI route `/settings/**`
 * trả 307 về `/onboarding/research`, nên không răng nào chạm tới được màn nó đo
 * — cả ba eval chết ở đó trước khi kịp đo thứ chúng được viết ra để đo.
 *
 * Vì sao KHÔNG nằm trong `seed.ts`: giá trị dưới đây không phải khoá dùng được.
 * Ghi nó vào seed thì mọi kho dev sẽ khai `configured: true` trong khi tính năng
 * research fail lúc gọi — đổi một lỗi nói thật («chưa cấu hình») lấy một lỗi nói
 * dối. Tiền đề này chỉ sống trong đúng lượt chấm rồi biến mất.
 *
 *   bun scripts/lan-do/tien-de.mjs --chay "<lệnh răng>"
 *
 * Mã thoát: trả NGUYÊN mã của lệnh răng. Đặt/dọn hỏng → mã 2 gọi tên, KHÔNG
 * chạy răng — hỏng tiền đề mà vẫn chấm là màu không tin được.
 */
import { spawnSync } from "node:child_process";
import { db } from "../../packages/db/src/client.ts";
import {
	readContextDevKey,
	writeContextDevKey,
} from "../../packages/db/src/settings.ts";

const KHOA_LAN_DO = "lan-do-khong-phai-khoa-that";

function thoat(ma, cau) {
	console.error(`tien-de: ${cau}`);
	process.exit(ma);
}

const i = process.argv.indexOf("--chay");
if (i === -1 || !process.argv[i + 1])
	thoat(2, 'thiếu --chay "<lệnh răng>" — không có gì để chạy');
const lenh = process.argv[i + 1];

const truoc = await readContextDevKey(db);
let daDat = false;

try {
	if (truoc === null) {
		await writeContextDevKey(db, KHOA_LAN_DO);
		daDat = true;
		const lai = await readContextDevKey(db);
		if (lai !== KHOA_LAN_DO)
			thoat(2, "đặt tiền đề xong nhưng đọc lại không khớp — không chấm");
		console.log(
			"-- tiền đề làn đo: đã đặt contextDevApiKey (khoá giả, sẽ dọn)",
		);
	} else {
		console.log("-- tiền đề làn đo: contextDevApiKey đã có sẵn, không đụng");
	}

	const ra = spawnSync("bash", ["-lc", lenh], { stdio: "inherit" });
	process.exitCode = ra.status === null ? 2 : ra.status;
} finally {
	if (daDat) {
		await writeContextDevKey(db, "");
		const con = await readContextDevKey(db);
		if (con !== null) {
			console.error("tien-de: DỌN HỎNG — contextDevApiKey vẫn còn giá trị");
			process.exitCode = 2;
		} else {
			console.log("-- tiền đề làn đo: đã dọn contextDevApiKey");
		}
	}
	await db.$disconnect();
}
