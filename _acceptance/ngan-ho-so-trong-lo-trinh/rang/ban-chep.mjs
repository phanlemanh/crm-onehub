import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { bam, catHam, khoiCua } from "./sinh-mau-x2.mjs";

const GOC = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../..",
);
const BAN_CHEP = path.join(GOC, "apps/app/lib/lo-trinh/doc-du-lieu.js");
const NGUON = path.join(GOC, "apps/app/test/fixtures/lo-trinh/x2/nguon.json");
const HAM_KHO = path.join(GOC, "scripts/lo-trinh.mjs");
const TRANG_GOC = path.join(GOC, "LO-TRINH.html");
const DUONG_TRANG = [
	"apps/app/components/lo-trinh",
	"apps/app/app/(app)/[slug]/lo-trinh",
	"apps/app/lib/lo-trinh",
	"packages/validation/src/lo-trinh-du-lieu.ts",
];
const CAP_MOI = ["tom_tat", "moi_nguoi", "chu_kho"];

export function bangKhuon(than) {
	const khuon = /const KHUON = (\{[\s\S]*?\n\s*\});/.exec(than ?? "")?.[1];
	if (!khuon) return null;
	return JSON.parse(
		khuon
			.replace(/'/g, '"')
			.replace(/(\w+):/g, '"$1":')
			.replace(/,(\s*[}\]])/g, "$1"),
	);
}

function bangZod() {
	return JSON.parse(
		execFileSync(
			"bun",
			[
				"-e",
				'import {KHOA_LO_TRINH_DU_LIEU as K} from "./src/lo-trinh-du-lieu.ts"; console.log(JSON.stringify(K))',
			],
			{ cwd: path.join(GOC, "packages/validation"), encoding: "utf8" },
		),
	);
}

function docTepGocQuaBoDoc() {
	const ma = `import { readFileSync } from "node:fs";
import { docTrangLoTrinh } from "./lib/lo-trinh/doc-trang.ts";
const dv = docTrangLoTrinh(readFileSync(process.env.LHS_TEP, "utf8"));
console.log(JSON.stringify(dv.kieu === "co-du-lieu" ? { kieu: dv.kieu, duLieu: dv.duLieu } : { kieu: dv.kieu, cauMay: dv.cauMay ?? null }));`;
	return JSON.parse(
		execFileSync("bun", ["-e", ma], {
			cwd: path.join(GOC, "apps/app"),
			encoding: "utf8",
			env: { ...process.env, LHS_TEP: TRANG_GOC },
			maxBuffer: 1 << 28,
		}),
	);
}

export function kiem({ banChep, nguon, zod, hamKho, trangGoc, docGoc }) {
	const dong = [];
	const them = (dung, nhan, chiTiet = "") => dong.push({ dung, nhan, chiTiet });
	const than = catHam(banChep);
	const khopBam = than !== null && bam(than) === nguon.ham_doc_du_lieu_sha256;
	them(
		khopBam,
		khopBam ? "ban chep khop bam ham goc" : "ban chep lech bam ham goc",
	);
	const bang = bangKhuon(than);
	const khopBang =
		bang !== null &&
		isDeepStrictEqual(bang, zod) &&
		CAP_MOI.every((c) => Array.isArray(bang[c]));
	them(
		khopBang,
		khopBang
			? "khuon Zod khop bang khoa cua bo doc"
			: "khuon Zod lech bang khoa cua bo doc",
		khopBang ? "" : JSON.stringify({ bang, zod }),
	);
	const tep = execFileSync("git", ["ls-files", "--", ...DUONG_TRANG], {
		cwd: GOC,
		encoding: "utf8",
	})
		.split("\n")
		.filter(Boolean);
	const doc = tep.filter((t) =>
		/_acceptance|docs\/plan/.test(readFileSync(path.join(GOC, t), "utf8")),
	);
	them(
		doc.length === 0,
		doc.length === 0
			? `trang khong doc ho so hay tep ke hoach (${tep.length} tep)`
			: "trang doc thang ho so hay tep ke hoach",
		doc.join(" · "),
	);
	let ban1 = false;
	const pb = Number(
		/export const PHIEN_BAN_DU_LIEU = (\d+)/.exec(hamKho ?? "")?.[1] ?? 1,
	);
	if (pb >= 2) {
		const khop = than !== null && than === catHam(hamKho);
		them(
			khop,
			khop
				? "ban chep khop tung ky tu scripts/lo-trinh.mjs"
				: "ban chep lech scripts/lo-trinh.mjs",
		);
	} else ban1 = true;
	const khoiGoc = trangGoc === null ? null : khoiCua(trangGoc);
	if (khoiGoc !== null && Number(khoiGoc.phien_ban) >= 2) {
		const kq = docGoc();
		const lech = [];
		if (kq.kieu !== "co-du-lieu")
			lech.push(`tep goc doc ra ${kq.kieu}: ${kq.cauMay}`);
		else {
			const sau = new Map(
				kq.duLieu.lo_trinh.flatMap((lo) =>
					lo.hang.map((h) => [`${lo.tep}#${h.ma}`, h.tom_tat]),
				),
			);
			const tho = khoiGoc.lo_trinh.flatMap((lo) =>
				lo.hang
					.filter((h) => h.tom_tat != null)
					.map((h) => [`${lo.tep}#${h.ma}`, h.tom_tat]),
			);
			const soSau = [...sau.values()].filter((v) => v !== null).length;
			if (soSau !== tho.length)
				lech.push(`tep goc co ${tho.length} viec co dai, doc duoc ${soSau}`);
			for (const [k, v] of tho)
				if (!isDeepStrictEqual(sau.get(k), v))
					lech.push(`tep goc lech dai ${k}`);
		}
		them(
			lech.length === 0,
			lech.length === 0
				? "bo doc giu nguyen dai cua LO-TRINH.html o goc"
				: "bo doc lech dai cua LO-TRINH.html o goc",
			lech.slice(0, 3).join(" · "),
		);
	} else ban1 = true;
	const sai = dong.some((d) => !d.dung);
	return { ma: sai ? 1 : ban1 ? 2 : 0, dong, ban1 };
}

const thamSo = process.argv.slice(2);
const goc = {
	banChep: existsSync(BAN_CHEP) ? readFileSync(BAN_CHEP, "utf8") : "",
	nguon: JSON.parse(readFileSync(NGUON, "utf8")),
	zod: bangZod(),
	hamKho: existsSync(HAM_KHO) ? readFileSync(HAM_KHO, "utf8") : "",
	trangGoc: existsSync(TRANG_GOC) ? readFileSync(TRANG_GOC, "utf8") : null,
	docGoc: docTepGocQuaBoDoc,
};
const kq = kiem(goc);
for (const d of kq.dong)
	console.log(
		`${d.dung ? "DUNG" : "SAI"} ${d.nhan}${d.chiTiet ? ` — ${d.chiTiet}` : ""}`,
	);
let ma = kq.ma;
if (thamSo.includes("--pha-thu") && ma !== 1) {
	const viTri = goc.banChep.indexOf("const ID = ");
	const hong = `${goc.banChep.slice(0, viTri)}const ID =  ${goc.banChep.slice(viTri + "const ID = ".length)}`;
	const a = kiem({ ...goc, banChep: hong }).dong.find((d) => !d.dung)?.nhan;
	const zodThieu = { ...goc.zod };
	delete zodThieu.chu_kho;
	const b = kiem({ ...goc, zod: zodThieu }).dong.find((d) => !d.dung)?.nhan;
	const dungA = a === "ban chep lech bam ham goc";
	const dungB = b === "khuon Zod lech bang khoa cua bo doc";
	console.log(
		`${dungA ? "DUNG" : "SAI"} pha-thu: sua mot ky tu ban chep -> ${a ?? "khong dong nao do"}`,
	);
	console.log(
		`${dungB ? "DUNG" : "SAI"} pha-thu: bang khoa bo cap chu_kho -> ${b ?? "khong dong nao do"}`,
	);
	if (!dungA || !dungB) ma = 1;
}
console.log(
	`KET LUAN ma ${ma}${ma === 2 ? " — crm chua nhan kit co X2 — so tung ky tu va doc tep goc cho toi khi kit 2.27 vao kho" : ""}`,
);
process.exit(ma);
