#!/usr/bin/env bun
/**
 * E6 (AC-4): không còn LIÊN KẾT nào trỏ đường cũ `/okr/cap-nhat-tuan` trong apps/app và
 * apps/agent (ngoài trang chuyển hướng và bài kiểm chuyển hướng), và tin nhắc cập nhật
 * tuần mang `/okr?tu=nhac`.
 *
 * «Liên kết» = chuỗi `/okr/cap-nhat-tuan` KHÔNG theo sau bởi `/` hay chữ — đường mô-đun
 * `.../okr/cap-nhat-tuan/cap-nhat-tuan` là import của bảng cập nhật dùng lại, không phải
 * liên kết. Chỉ đo mã chạy: bài kiểm (`/test/`), docs/, _acceptance/ không tính.
 *
 * Hai chiều trên BẢN SAO TẠM (cây thật không bị ghi), chạy TRƯỚC cây thật:
 *   đỏ — thêm một dòng `href={url("/okr/cap-nhat-tuan")}` vào viec-cua-toi.tsx → phải SAI;
 *   im — chỉ thêm một dòng nhắc đường cũ trong docs/ và một import từ
 *        `./cap-nhat-tuan/cap-nhat-tuan` → phải DUNG.
 * Mã thoát: 0 đúng · 1 sai · 2 không đo được.
 */
import { execFileSync, spawnSync } from "node:child_process";
import {
	cpSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const VIEC = "apps/app/app/(app)/[slug]/okr/viec-cua-toi.tsx";
const BO_QUA = [
	"apps/app/app/(app)/[slug]/okr/cap-nhat-tuan/page.tsx",
	"apps/app/test/okr-chuyen-huong-cap-nhat.spec.ts",
];

function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

/** Dòng liên kết cũ trong một cây (đọc file thật, không tin git index). */
function lienKetCu(goc) {
	const r = spawnSync(
		"grep",
		["-rn", "--include=*.ts", "--include=*.tsx", "/okr/cap-nhat-tuan", "apps/app", "apps/agent"],
		{ cwd: goc, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
	);
	if (r.status !== 0 && r.status !== 1) khongDo(`grep thoat ${r.status}`);
	return r.stdout
		.split("\n")
		.filter(Boolean)
		.filter((d) => !d.includes("/node_modules/"))
		.filter((d) => !BO_QUA.some((b) => d.startsWith(`${b}:`)))
		.filter((d) => !d.split(":")[0].includes("/test/"))
		// đường mô-đun (`.../okr/cap-nhat-tuan/cap-nhat-tuan`) là import, không phải liên kết
		.filter((d) => /\/okr\/cap-nhat-tuan(?![\/\w-])/.test(d));
}

function banSao() {
	const tam = mkdtempSync(join(tmpdir(), "ctbp-lien-ket-"));
	for (const d of ["apps/app/app", "apps/app/lib", "apps/app/test", "apps/agent/agent", "apps/agent/test"]) {
		mkdirSync(join(tam, dirname(d)), { recursive: true });
		cpSync(join(GOC, d), join(tam, d), { recursive: true });
	}
	mkdirSync(join(tam, "docs"), { recursive: true });
	return tam;
}

// chiều đỏ
const do1 = banSao();
try {
	const tep = join(do1, VIEC);
	writeFileSync(
		tep,
		`${readFileSync(tep, "utf8")}\n// <a href={url("/okr/cap-nhat-tuan")} />\n`,
	);
	const ra = lienKetCu(do1);
	if (!ra.some((d) => d.startsWith(`${VIEC}:`)))
		khongDo("chieu do: ban sao co lien ket cu ma phep do khong thay");
	console.log(`DUNG chieu do: SAI AC-4: ${VIEC}`);
} finally {
	rmSync(do1, { recursive: true, force: true });
}

// chiều im
const im = banSao();
try {
	writeFileSync(join(im, "docs/ghi-chu.md"), "Đường cũ /okr/cap-nhat-tuan?tu=nhac\n");
	const tep = join(im, VIEC);
	writeFileSync(
		tep,
		`import { TUAN as _T } from "./cap-nhat-tuan/cap-nhat-tuan";\n${readFileSync(tep, "utf8")}`,
	);
	const ra = lienKetCu(im);
	if (ra.length > 0) {
		console.log(ra.join("\n"));
		console.log("SAI chieu im: chi them import va docs ma phep do bao lien ket cu");
		process.exit(1);
	}
	console.log("DUNG chieu im: import va docs khong tinh");
} finally {
	rmSync(im, { recursive: true, force: true });
}

// cây thật
const that = lienKetCu(GOC);
for (const d of that) console.log(`SAI AC-4: ${d.split(":").slice(0, 2).join(":")}`);

const tinNhac = spawnSync(
	"bash",
	[
		"-c",
		'bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/okr-nhac.integration.spec.ts -t nhac-cap-nhat"',
	],
	{ cwd: GOC, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
);
const khangDinh = readFileSync(
	join(GOC, "apps/agent/test/okr-nhac.integration.spec.ts"),
	"utf8",
).includes("`${APP_URL}/${s}/okr?tu=nhac`");
if (tinNhac.status !== 0 || !khangDinh) {
	console.log(`${tinNhac.stdout}${tinNhac.stderr}`.split("\n").slice(-20).join("\n"));
	console.log(
		`SAI AC-4: ca nhac-cap-nhat ma ${tinNhac.status}, khang dinh /okr?tu=nhac ${khangDinh ? "co" : "THIEU"}`,
	);
	process.exit(1);
}
if (that.length > 0) process.exit(1);
console.log("DUNG AC-4: 0 lien ket cu + tin nhac /okr?tu=nhac");
process.exit(0);
