import { execFileSync } from "node:child_process";
import {
	appendFileSync,
	cpSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
} from "node:fs";
import os from "node:os";
import { basename, join, relative, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const TEN_LAN = /^repin-lane/;
const NHAP_MODEL = [
	/from\s+["']ai["']/,
	/from\s+["']@ai-sdk\//,
	/from\s+["']@crm\/ai-okr/,
	/AI_GATEWAY/,
];
const CACHE_TUYET_DOI = /\.claude\/plugins\/cache/;

function tepMa(thuMuc) {
	return readdirSync(thuMuc, { recursive: true })
		.map(String)
		.filter((t) => t.endsWith(".mjs") && !t.includes("test/"))
		.map((t) => join(thuMuc, t));
}

export function kiemTenLan(danhSach) {
	return danhSach
		.filter((t) => TEN_LAN.test(basename(t)))
		.map((t) => `(a) co ban chep lan cua kit trong kho: ${t}`);
}

export function kiemGoiQuaGiai(thuMuc) {
	const loi = [];
	const ma = Object.fromEntries(
		tepMa(thuMuc).map((t) => [relative(thuMuc, t), readFileSync(t, "utf8")]),
	);
	if (!/giaiBang/.test(ma["doc-lan.mjs"] ?? "")) {
		loi.push("(b) doc-lan.mjs khong giai lan qua KIEM_CHEO.lan.giaiBang");
	}
	if (!/scripts\/resolve-plugin\.mjs/.test(ma["cau-hinh.mjs"] ?? "")) {
		loi.push("(b) cau-hinh.mjs khong tro scripts/resolve-plugin.mjs");
	}
	for (const [t, noiDung] of Object.entries(ma)) {
		if (CACHE_TUYET_DOI.test(noiDung)) {
			loi.push(`(b) duong dan tuyet doi toi bo nho dem plugin: ${t}`);
		}
	}
	return loi;
}

export function kiemKhongModel(thuMuc) {
	const loi = [];
	for (const t of tepMa(thuMuc)) {
		const noiDung = readFileSync(t, "utf8");
		if (NHAP_MODEL.some((re) => re.test(noiDung))) {
			loi.push(`(c) goi model truc tiep: ${basename(t)}`);
		}
	}
	return loi;
}

function kiemTatCa(thuMuc, danhSach) {
	return [
		...kiemTenLan(danhSach),
		...kiemGoiQuaGiai(thuMuc),
		...kiemKhongModel(thuMuc),
	];
}

const danhSachThat = execFileSync("git", ["-C", GOC, "ls-files"], {
	encoding: "utf8",
})
	.split("\n")
	.filter(Boolean);
const thuMucThat = join(GOC, "scripts", "kiem-cheo");
const loiThat = kiemTatCa(thuMucThat, danhSachThat);

const tam = mkdtempSync(join(os.tmpdir(), "kcs-ranh-"));
const banSao = join(tam, "kiem-cheo");
cpSync(thuMucThat, banSao, { recursive: true });
appendFileSync(
	join(banSao, "bao.mjs"),
	'\nimport { generateText } from "ai";\n',
);
const doModel = kiemKhongModel(banSao);
const doTen = kiemTenLan([...danhSachThat, "scripts/kiem-cheo/repin-lane.mjs"]);
const docLan = join(banSao, "doc-lan.mjs");
appendFileSync(
	docLan,
	'\nexport const LAN_CUNG = "/Users/x/.claude/plugins/cache/kit/feature-loop/2.24.0";\n',
);
const doGiai = kiemGoiQuaGiai(banSao);
rmSync(tam, { recursive: true, force: true });

const hong = [];
if (loiThat.length > 0) hong.push(...loiThat);
if (!doModel.some((l) => l.includes("bao.mjs"))) {
	hong.push("chieu do (c) khong goi ten bao.mjs khi them import ai");
}
if (!doTen.some((l) => l.includes("scripts/kiem-cheo/repin-lane.mjs"))) {
	hong.push("chieu do (a) khong goi ten tep lan chep");
}

if (!doGiai.some((l) => l.includes("doc-lan.mjs"))) {
	hong.push("chieu do (b) khong goi ten doc-lan.mjs khi tro cung bo nho dem");
}

for (const l of [...doModel, ...doTen, ...doGiai])
	console.log(`chieu do: ${l}`);
if (hong.length > 0) {
	console.error(hong.join("\n"));
	process.exit(1);
}
console.log("ranh-gioi: ban that sach, ba chieu do do dung cho");
