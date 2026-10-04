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
import { spawn, spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isMeasureDatabase } from "../../packages/db/src/measure-database.ts";
import { PHIEN_DO } from "./cau-hinh.mjs";
import { HAU_TO, tenDb } from "./kho-nhap.mjs";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const KHOA_LAN_DO = "lan-do-khong-phai-khoa-that";
const NGUOI = process.env.NGUOI ?? PHIEN_DO.nguoi;
const MA_NGAT = { SIGINT: 130, SIGTERM: 143, SIGHUP: 129 };
const MIEN_LAN_DO = "lan-do.onehub.vn";
const ANH_LAN_DO =
	"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

function thoat(ma, cau) {
	console.error(`tien-de: ${cau}`);
	process.exit(ma);
}

const i = process.argv.indexOf("--chay");
if (i === -1 || !process.argv[i + 1])
	thoat(2, 'thiếu --chay "<lệnh răng>" — không có gì để chạy');
const lenh = process.argv[i + 1];

const kho = tenDb(process.env.DATABASE_URL ?? "");
if (kho === null || !(isMeasureDatabase(kho) || kho.endsWith(HAU_TO))) {
	console.log(
		`-- tiền đề làn đo: kho "${kho ?? "?"}" không phải kho dùng-một-lần — chạy trong một phiên đo riêng`,
	);
	const trongPhien = `bun scripts/lan-do/tien-de.mjs --chay '${lenh.replace(/'/g, "'\\''")}'`;
	const con = spawn(
		"bun",
		[join(GOC, "scripts/lan-do/phien-do.mjs"), "--chay", trongPhien],
		{ cwd: GOC, stdio: "inherit" },
	);
	for (const tin of Object.keys(MA_NGAT)) process.on(tin, () => con.kill(tin));
	const ma = await new Promise((xong) => {
		con.on("error", () => xong(2));
		con.on("exit", (m, tin) => xong(m ?? MA_NGAT[tin] ?? 2));
	});
	process.exit(ma);
}

const { db } = await import("../../packages/db/src/client.ts");
const { readContextDevKey, writeContextDevKey } = await import(
	"../../packages/db/src/settings.ts"
);

const truoc = await readContextDevKey(db);
let daDat = false;

const nguoi = await db.user.findUnique({
	where: { email: NGUOI },
	select: { image: true },
});
if (nguoi === null)
	thoat(
		2,
		`chưa có người dùng ${NGUOI} trong kho — chạy một lượt \`cd apps/api && bun run dev:session ${NGUOI}\` rồi đo lại`,
	);
let daDatAnh = false;
let daDatMien = false;

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

	if (nguoi.image === null) {
		await db.user.update({
			where: { email: NGUOI },
			data: { image: ANH_LAN_DO },
		});
		daDatAnh = true;
		const lai = await db.user.findUnique({
			where: { email: NGUOI },
			select: { image: true },
		});
		if (lai?.image !== ANH_LAN_DO)
			thoat(2, "đặt ảnh đại diện xong nhưng đọc lại không khớp — không chấm");
		console.log("-- tiền đề làn đo: đã đặt ảnh đại diện (sẽ dọn)");
	} else {
		console.log("-- tiền đề làn đo: ảnh đại diện đã có sẵn, không đụng");
	}

	if ((await db.trackedDomain.count()) === 0) {
		await db.trackedDomain.create({ data: { host: MIEN_LAN_DO } });
		daDatMien = true;
		const lai = await db.trackedDomain.count({ where: { host: MIEN_LAN_DO } });
		if (lai !== 1)
			thoat(
				2,
				"đặt tên miền được phép xong nhưng đọc lại không thấy — không chấm",
			);
		console.log(
			`-- tiền đề làn đo: đã thêm tên miền được phép ${MIEN_LAN_DO} (sẽ dọn)`,
		);
	} else {
		console.log(
			"-- tiền đề làn đo: workspace đã có tên miền được phép, không đụng",
		);
	}

	const ra = spawnSync(
		"bash",
		["-lc", `PATH=${JSON.stringify(process.env.PATH ?? "")} ${lenh}`],
		{ stdio: "inherit" },
	);
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
	if (daDatAnh) {
		await db.user.update({ where: { email: NGUOI }, data: { image: null } });
		const con = await db.user.findUnique({
			where: { email: NGUOI },
			select: { image: true },
		});
		if (con?.image !== null) {
			console.error("tien-de: DỌN HỎNG — ảnh đại diện vẫn còn giá trị");
			process.exitCode = 2;
		} else {
			console.log("-- tiền đề làn đo: đã dọn ảnh đại diện");
		}
	}
	if (daDatMien) {
		await db.trackedDomain.deleteMany({ where: { host: MIEN_LAN_DO } });
		const con = await db.trackedDomain.count({ where: { host: MIEN_LAN_DO } });
		if (con !== 0) {
			console.error(
				"tien-de: DỌN HỎNG — tên miền được phép của làn đo vẫn còn",
			);
			process.exitCode = 2;
		} else {
			console.log("-- tiền đề làn đo: đã dọn tên miền được phép");
		}
	}
	await db.$disconnect();
}
