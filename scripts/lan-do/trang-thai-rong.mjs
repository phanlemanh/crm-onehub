#!/usr/bin/env bun
/**
 * Trạng thái RỖNG cho làn đo — dựng, đo, trả lại.
 *
 * Vì sao tồn tại: `man-cai-dat` E5 đo hai màn «chưa có tỷ giá nào» và «chưa deal
 * nào có số tiền». Kho chạy MỘT workspace duy nhất và `seed.ts` luôn đổ đầy cả
 * hai, nên trạng thái ấy không tồn tại trên cây thường — không phải vì sản phẩm
 * sai, mà vì vật để đo chưa bao giờ được dựng.
 *
 * CHỐT KHÔNG XOÁ NHẦM: chỉ chạy khi tên database kết thúc bằng `_gieo`. Làn này
 * xoá sạch database, nên nó phải KHÔNG THỂ chạm vào kho làm việc của bất kỳ ai.
 * Chốt đọc từ DATABASE_URL thật, không tin lời dặn. Sai tên → mã 2 gọi tên
 * (không đo được), KHÔNG phải mã 1 — hạ tầng chưa sẵn không phải sản phẩm sai.
 *
 *   bun scripts/lan-do/trang-thai-rong.mjs --chay "<lệnh răng>"
 *
 * Trả NGUYÊN mã của lệnh răng. Dựng hỏng hoặc trả-lại hỏng → mã 2.
 */
import { spawnSync } from "node:child_process";
import { batBuocKhoNhap } from "./kho-nhap.mjs";

function thoat(ma, cau) {
	console.error(`trang-thai-rong: ${cau}`);
	process.exit(ma);
}

const i = process.argv.indexOf("--chay");
if (i === -1 || !process.argv[i + 1])
	thoat(2, 'thiếu --chay "<lệnh răng>" — không có gì để chạy');
const lenh = process.argv[i + 1];

const ten = batBuocKhoNhap("trang-thai-rong");

function chay(cau, lenhCon, moiTruong) {
	const ra = spawnSync("bash", ["-lc", lenhCon], {
		stdio: "inherit",
		env: { ...process.env, ...moiTruong },
	});
	if (ra.status !== 0) thoat(2, `${cau} thoát ${ra.status} — không đo`);
}

console.log(`-- trạng thái rỗng: dựng lại "${ten}" (kho nháp)`);
chay(
	"xoá + đẩy schema",
	"cd packages/db && bunx prisma db push --force-reset --accept-data-loss",
	{ PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: "lan do tu dung kho nhap" },
);
chay("seed tối thiểu", "cd packages/db && bun run db:seed", {
	SEED_TOI_THIEU: "1",
});

// Sau khi dựng lại, cổng research-key cũng trắng theo — nên lệnh răng đi qua
// tien-de.mjs, CÙNG một nơi đặt/dọn tiền đề ấy cho mọi eval, không chép lại.
try {
	const ra = spawnSync(
		"bash",
		["-lc", `bun scripts/lan-do/tien-de.mjs --chay ${JSON.stringify(lenh)}`],
		{ stdio: "inherit" },
	);
	process.exitCode = ra.status === null ? 2 : ra.status;
} finally {
	console.log("-- trạng thái rỗng: trả kho nháp về seed đầy");
	chay("seed đầy trả lại", "cd packages/db && bun run db:seed");
}
