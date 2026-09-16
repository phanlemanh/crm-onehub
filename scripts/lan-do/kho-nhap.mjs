#!/usr/bin/env bun
/**
 * Kho nháp của làn đo — MỘT nguồn cho chốt an toàn và cho việc dựng lại.
 *
 * Vì sao tồn tại: hai đường của làn đo đều XOÁ SẠCH database —
 * `trang-thai-rong.mjs` (dựng trạng thái rỗng cho một eval) và `quet.mjs` (dọn
 * cặn giữa các hồ sơ). Chốt an toàn viết hai lần là hai lần có thể trôi khỏi
 * nhau; lần trôi đầu tiên sẽ xoá kho làm việc của một người.
 */
import { spawnSync } from "node:child_process";

export const HAU_TO = "_gieo";

export function tenDb(url) {
	try {
		return new URL(url).pathname.replace(/^\//, "");
	} catch {
		return null;
	}
}

/**
 * Chốt: chỉ cho đi tiếp khi database mang hậu tố kho nháp.
 * Trả về tên database; KHÔNG trả về thì đã process.exit(2) kèm lý do.
 */
export function batBuocKhoNhap(ai) {
	const url = process.env.DATABASE_URL;
	if (!url) {
		console.error(`${ai}: DATABASE_URL chưa đặt — không biết sẽ xoá cái gì`);
		process.exit(2);
	}
	const ten = tenDb(url);
	if (ten === null) {
		console.error(`${ai}: DATABASE_URL không đọc được thành URL`);
		process.exit(2);
	}
	if (!ten.endsWith(HAU_TO)) {
		console.error(
			`${ai}: database "${ten}" không kết thúc bằng "${HAU_TO}" — đường này XOÁ SẠCH ` +
				`database nên chỉ chạy trên kho nháp. Dựng một kho tên "<gì đó>${HAU_TO}", ` +
				"trỏ DATABASE_URL vào đó rồi chạy lại.",
		);
		process.exit(2);
	}
	return ten;
}

/** Dựng lại kho nháp: xoá sạch, đẩy schema, seed. `toiThieu` bỏ tỷ giá/deal/công ty. */
export function dungLaiKhoNhap({ toiThieu = false } = {}) {
	const buoc = [
		[
			"xoá + đẩy schema",
			"cd packages/db && bunx prisma db push --force-reset --accept-data-loss",
			{
				PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: "lan do tu dung kho nhap",
			},
		],
		[
			toiThieu ? "seed tối thiểu" : "seed đầy",
			"cd packages/db && bun run db:seed",
			toiThieu ? { SEED_TOI_THIEU: "1" } : {},
		],
	];
	for (const [ten, lenh, moi] of buoc) {
		const ra = spawnSync("bash", ["-lc", lenh], {
			stdio: ["ignore", "ignore", "inherit"],
			env: { ...process.env, ...moi },
		});
		if (ra.status !== 0) {
			console.error(`dựng kho nháp: ${ten} thoát ${ra.status}`);
			return false;
		}
	}
	return true;
}
