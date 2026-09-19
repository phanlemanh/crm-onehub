import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	API_SAO,
	APP_SAO,
	chay,
	donCaySao,
	dungCaySao,
	dungMayChu,
} from "../../ho-so-khai-dung-tieng/rang/cay-sao.mjs";
import { bang, GOC, ghim } from "./chung.mjs";

const R = "_acceptance/thuoc-khai-dung-tieng/rang";
const H = "_acceptance/ho-so-khai-dung-tieng/rang";
const GS = ".githooks/gate-shape.json";

const chanMoi = (t) => ({ lenh: "bun", doi_so: [`${R}/${t}.mjs`] });

export const DOT_BIEN_VONG_NAY = [
	{
		chan: "E1",
		tep: `${H}/bang-dot-bien.mjs`,
		cu: 'ghim: "lech-boc:gioi-thieu"',
		moi: 'ghim: "gioi-thieu"',
		do: chanMoi("ghim-phan-biet"),
		ghim: "KHONG PHAN BIET",
	},
	{
		chan: "E2",
		commit: true,
		tep: `${H}/pha-thu.mjs`,
		cu: "const dat = ket.ma !== 0 && ket.ghim && ket.vang;",
		moi: "const dat = ket.ma !== 0 && ket.ghim;",
		do: chanMoi("khai-sinh-dung-ghim"),
		ghim: "[dem-roi-vut]: KHONG",
	},
	{
		chan: "E3",
		commit: true,
		tep: "packages/ui/test/rang-chat.spec.ts",
		cu: "for (const k of khoi.checks) {",
		moi: "for (const k of []) {",
		do: chanMoi("cong-chan-duoc"),
		ghim: "cong-khong-chan-duoc",
	},
	{
		chan: "E4a",
		tep: GS,
		cu: '"id": "so-do-cuon"',
		moi: '"id": "so-do-cuon-KHONG-CO"',
		do: chanMoi("hai-ho-so"),
		ghim: "chua-dinh-doat:",
	},
	{
		chan: "E4b",
		tep: `${R}/hai-ho-so.mjs`,
		cu: '"nen-chat-ai-elements": 6,',
		moi: '"nen-chat-ai-elements": 5,',
		do: chanMoi("hai-ho-so"),
		ghim: "HANG GHIM LECH",
	},
	{
		chan: "E5",
		tep: `${H}/hoi-quy-nam-cho.mjs`,
		cu: "} finally {\n\tawait tra();\n}",
		moi: '} finally {\n\tconsole.log("(khong tra gi)");\n}',
		do: chanMoi("khong-de-lai-vet"),
		ghim: "ban-ghi-that-con-lech:",
	},
	{
		chan: "E6",
		tep: `${H}/cay-sao.mjs`,
		cu: "\tkiemDuongSao(sao);\n",
		moi: "",
		do: chanMoi("xoa-co-kiem"),
		ghim: "xoa-nham:",
	},
	{
		chan: "E7",
		tep: `${R}/ban-khai-khop.mjs`,
		cu: 'const KHOA_MOI_MUC = ["tieng_viet_lot"];',
		moi: 'const KHOA_MOI_MUC = ["tieng_viet_lot", "mau_sac_khong_ai_ghi"];',
		do: chanMoi("ban-khai-khop"),
		ghim: "khoa-hoi-dong-khong-co-chan-do-ghi:",
	},
	{
		chan: "E8",
		tep: "packages/ui/src/components/foreign-text.tsx",
		cu: 'import type { Locale } from "../lib/locale";',
		moi: 'import type { Locale } from "../lib/locale";\nexport { MetaLine as X } from "../../../apps/app/components/crm/record-sheet/record-parts";',
		do: chanMoi("bai-kiem-dung-nha"),
		ghim: "nhap-nguoc-chieu",
	},
	{
		chan: "E9",
		tep: `${H}/mot-duong.mjs`,
		cu: "const CHIN = 9;",
		moi: "const CHIN = 8;",
		do: chanMoi("ho-so-cu-van-xanh"),
		ghim: "ho-so-cu-do:mot-duong",
	},
	{
		chan: "E12",
		tep: `${R}/khai-sinh-phu-vong-nay.mjs`,
		cu: [
			"\t{",
			'\t\tchan: "E14",',
			"\t\ttep: `${R}/bay-benh-cu.mjs`,",
			'\t\tcu: "const BAY = 7;",',
			'\t\tmoi: "const BAY = 6;",',
			'\t\tdo: chanMoi("bay-benh-cu"),',
			'\t\tghim: "HANG GHIM LECH",',
			"\t},",
			"",
		].join("\n"),
		moi: "",
		do: {
			lenh: "bun",
			doi_so: [`${R}/khai-sinh-phu-vong-nay.mjs`],
			tu_quy: true,
		},
		ghim: "HANG GHIM LECH",
	},
	{
		chan: "E13",
		commit: true,
		tep: GS,
		cu: '"runsIn": "@crm/ui#test"',
		moi: '"runsIn": "@crm/ui#test "',
		do: chanMoi("ghim-lai-da-xong"),
		ghim: "bang-chung-hoa-cu:.githooks/gate-shape.json",
	},
	{
		chan: "E14",
		tep: `${R}/bay-benh-cu.mjs`,
		cu: "const BAY = 7;",
		moi: "const BAY = 6;",
		do: chanMoi("bay-benh-cu"),
		ghim: "HANG GHIM LECH",
	},
];

const banKhai = readFileSync(
	join(GOC, "_acceptance/thuoc-khai-dung-tieng/evals.yaml"),
	"utf8",
);
const soMenhDe = (banKhai.match(/^\s*Cap hai chieu/gm) ?? []).length;

console.log(
	"-- Thuoc cua thuoc khong duoc mien luat cua thuoc (AC-11).\n" +
		'-- Dem menh de "Cap hai chieu" NEO DAU DONG. Dem tho ra nhieu hon, vi chinh\n' +
		"   phan mo ta cua E12 nhac cum do hai lan, giua dong, trong ngoac kep.",
);
ghim("so menh de Cap hai chieu", soMenhDe, 13);
ghim("so dot bien", DOT_BIEN_VONG_NAY.length, soMenhDe);

const CHAN_MOI = readdirSync(join(GOC, R))
	.filter(
		(t) => t.endsWith(".mjs") && t !== "chung.mjs" && !t.endsWith(".spec.mjs"),
	)
	.sort();
const duocPhu = new Set(
	DOT_BIEN_VONG_NAY.map((d) => d.do.doi_so[0].split("/").pop()),
);
const soHo = CHAN_MOI.filter((t) => !duocPhu.has(t));
if (soHo.length > 0) {
	console.log(
		`-- ${soHo.length} chan moi KHONG co phep pha nao chay qua:\n` +
			soHo.map((t) => `     [chan-moi-khong-do-duoc:${t}]`).join("\n"),
	);
	process.exit(1);
}
console.log(
	`-- ${CHAN_MOI.length} chan moi, moi chan co it nhat mot phep pha chay qua.`,
);

if (process.env.CHAN_TU_QUY === "1") {
	console.log(
		"[tu-quy] da qua moi hang ghim va phep kiem phu du; dung truoc khi dung ban\n" +
			"   sao thu hai. Phep pha E12 chay den day la du — no do chinh hai hang ghim\n" +
			"   va phep kiem phu du o tren.",
	);
	process.exit(0);
}

const hang = [];
let hong = 0;
let sao = null;
let mayChu = null;

try {
	sao = dungCaySao();
	console.log(`-- BAN SAO: ${sao}`);
	mayChu = await dungMayChu(sao);
	console.log(`-- MAY CHU CUA BAN SAO: ${APP_SAO} · ${API_SAO}`);

	const moi_truong = {
		APP_URL: APP_SAO,
		API_URL: API_SAO,
		CHO_PHEP_CAY_BAN: "1",
	};

	for (const d of DOT_BIEN_VONG_NAY) {
		const duong = join(sao, d.tep);
		const goc = readFileSync(duong, "utf8");
		try {
			const mt = {
				...moi_truong,
				CHAN_TU_QUY: d.do.tu_quy ? "1" : "",
			};
			const lanh = chay(d.do, sao, mt);
			const vang = !lanh.ra.includes(d.ghim);

			if (!goc.includes(d.cu)) {
				hang.push(
					`${d.chan.padEnd(4)} [chan-moi-khong-do-duoc:${d.chan}] PHEP PHA KHONG AP DUNG DUOC trong ${d.tep}`,
				);
				hong += 1;
				continue;
			}
			writeFileSync(duong, goc.replace(d.cu, d.moi));
			if (d.commit) {
				execFileSync("git", ["-C", sao, "add", "-A"], { encoding: "utf8" });
				execFileSync(
					"git",
					[
						"-C",
						sao,
						"-c",
						"user.email=r@r",
						"-c",
						"user.name=rang",
						"commit",
						"-q",
						"-m",
						"dot bien",
					],
					{ encoding: "utf8" },
				);
			}

			const r = chay(d.do, sao, mt);
			const coGhim = r.ra.includes(d.ghim);
			const dat = r.ma !== 0 && coGhim && vang;
			if (!dat) hong += 1;
			hang.push(
				`${dat ? "dat " : "KHONG DAT"} ${d.chan.padEnd(4)} ma ${r.ma} · ghim ${coGhim ? "CO" : "KHONG"} · vang o luot lanh ${vang ? "co" : "KHONG"}` +
					(dat
						? ""
						: `\n        [chan-moi-khong-do-duoc:${d.chan}] ghim ${JSON.stringify(d.ghim)}\n` +
							r.ra
								.split("\n")
								.slice(-14)
								.map((x) => `          | ${x}`)
								.join("\n")),
			);
		} finally {
			writeFileSync(duong, goc);
			if (d.commit) {
				execFileSync("git", ["-C", sao, "add", "-A"], { encoding: "utf8" });
				execFileSync(
					"git",
					[
						"-C",
						sao,
						"-c",
						"user.email=r@r",
						"-c",
						"user.name=rang",
						"commit",
						"-q",
						"-m",
						"tra ban goc",
					],
					{ encoding: "utf8" },
				);
			}
		}
	}
} finally {
	if (mayChu) {
		mayChu.api.kill();
		mayChu.app.kill();
		console.log("-- DA TAT may chu cua ban sao");
	}
	if (sao) donCaySao(sao);
}

bang(`-- ${DOT_BIEN_VONG_NAY.length} chan moi, moi chan mot phep pha:`, hang);
console.log(
	`ket qua: ${hong} chan moi KHONG do duoc tren ${DOT_BIEN_VONG_NAY.length}`,
);
process.exit(hong > 0 ? 1 : 0);
