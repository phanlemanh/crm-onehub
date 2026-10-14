#!/usr/bin/env node
// Hồ sơ _acceptance/ke-hoach-sinh-viec — E7b: AC-4, AC-5, AC-6 của dieu-phoi-va (E6, thêm bước) vẫn xanh
// nguyên tên bài sau DA3. Lệnh rút thẳng từ _acceptance/config.yaml (khoá của dieu-phoi-va), không chép
// tay; mỗi tên ca phải chạy ≥1 lần và qua — đổi tên ca làm bộ lọc -t im lặng thì thoát 1.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const CAU_HINH = readFileSync(join(GOC, "_acceptance", "config.yaml"), "utf8");
const KHOA = {
	dpv_them_buoc_dom: ["ke-hoach-rong", "bo-phan-khac", "loi-bo-phan"],
	dpv_bo_phan_hong: ["bo-phan-hong"],
};

function lenhCua(khoa) {
	const dong = CAU_HINH.split("\n").find((d) =>
		d.trimStart().startsWith(`${khoa}:`),
	);
	if (!dong) {
		console.error(`e6-xanh: config.yaml thieu khoa ${khoa}`);
		process.exit(2);
	}
	let gt = dong.slice(dong.indexOf(":") + 1).trim();
	if (gt.startsWith("'") && gt.endsWith("'"))
		gt = gt.slice(1, -1).replaceAll("''", "'");
	else if (gt.startsWith('"') && gt.endsWith('"')) gt = JSON.parse(gt);
	return gt;
}

let hong = 0;
for (const [khoa, ten] of Object.entries(KHOA)) {
	const cmd = lenhCua(khoa);
	const r = spawnSync("sh", ["-c", cmd], {
		cwd: GOC,
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
		timeout: 900_000,
	});
	const ra = `${r.stdout}\n${r.stderr}`;
	if (r.status !== 0) {
		console.error(`e6-xanh: lenh ${khoa} thoat ${r.status}`);
		hong += 1;
	}
	for (const t of ten) {
		const qua = ra
			.split("\n")
			.filter((d) => d.includes("(pass)") && d.includes(t));
		if (qua.length === 0) {
			console.error(`kh: ca e6 bi doi ten ${t}`);
			hong += 1;
		} else console.log(`${khoa} · ${t}: ${qua.length} ca qua`);
	}
}
process.exit(hong === 0 ? 0 : 1);
