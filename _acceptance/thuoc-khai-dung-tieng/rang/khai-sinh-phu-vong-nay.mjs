import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
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
		nhom: "nhanh",
		eval: "E1",
		tep: `${H}/bang-dot-bien.mjs`,
		cu: 'ghim: "lech-boc:gioi-thieu"',
		moi: 'ghim: "gioi-thieu"',
		do: chanMoi("ghim-phan-biet"),
		ghim: "KHONG PHAN BIET",
	},
	{
		chan: "E2",
		nhom: "cham",
		eval: "E2",
		commit: true,
		tep: `${H}/pha-thu.mjs`,
		cu: "const dat = ket.ma !== 0 && ket.ghim && ket.vang;",
		moi: "const dat = ket.ma !== 0 && ket.ghim;",
		do: chanMoi("khai-sinh-dung-ghim"),
		ghim: "[bo-khai-sinh-dem-roi-vut]",
	},
	{
		chan: "E3",
		nhom: "dat",
		eval: "E3",
		commit: true,
		tep: "packages/ui/test/rang-chat.spec.ts",
		cu: "for (const k of khoi.checks) {",
		moi: "for (const k of []) {",
		do: chanMoi("cong-chan-duoc"),
		ghim: "cong-khong-chan-duoc",
	},
	{
		chan: "E4a",
		nhom: "nhanh",
		eval: "E4",
		tep: GS,
		cu: '"id": "so-do-cuon"',
		moi: '"id": "so-do-cuon-KHONG-CO"',
		do: chanMoi("hai-ho-so"),
		ghim: "chua-dinh-doat:",
	},
	{
		chan: "E4b",
		nhom: "nhanh",
		eval: "E4",
		tep: `${R}/hai-ho-so.mjs`,
		cu: '"nen-chat-ai-elements": 6,',
		moi: '"nen-chat-ai-elements": 5,',
		do: chanMoi("hai-ho-so"),
		ghim: "HANG GHIM LECH",
	},
	{
		chan: "E4c",
		eval: "E4",
		nhom: "nhanh",
		tao: `${H}/mot-rang-moi-chua-khai.mjs`,
		noi_dung: "process.exit(0);\n",
		do: chanMoi("hai-ho-so"),
		ghim: "chua-dinh-doat:ho-so-khai-dung-tieng/mot-rang-moi-chua-khai.mjs",
	},
	{
		chan: "E5",
		nhom: "vua",
		eval: "E5",
		tep: `${H}/hoi-quy-nam-cho.mjs`,
		cu: "\tif (daDon) return;",
		moi: '\tconsole.log("(tra() bi vo hieu hoa)");\n\treturn;',
		do: chanMoi("khong-de-lai-vet"),
		ghim: "ban-ghi-that-con-lech:",
	},
	{
		chan: "E6",
		nhom: "nhanh",
		eval: "E6",
		tep: `${H}/cay-sao.mjs`,
		cu: "\t\tif (!la.includes(duong)) {",
		moi: "\t\tif (false) {",
		do: chanMoi("xoa-co-kiem"),
		ghim: "xoa-nham:",
	},
	{
		chan: "E7",
		nhom: "vua",
		eval: "E7",
		tep: `${H}/khai-tieng-ho-so.mjs`,
		cu: "\t\t\t\tduong_the: vung",
		moi: "\t\t\t\tduong_the_DA_DOI_TEN: vung",
		do: chanMoi("ban-khai-khop"),
		ghim: "khoa-hoi-dong-khong-co-chan-do-ghi:",
	},
	{
		chan: "E8",
		nhom: "nhanh",
		eval: "E8",
		tep: "packages/ui/src/components/foreign-text.tsx",
		cu: 'import type { Locale } from "../lib/locale";',
		moi: 'import type { Locale } from "../lib/locale";\nexport { MetaLine as X } from "../../../apps/app/components/crm/record-sheet/record-parts";',
		do: chanMoi("bai-kiem-dung-nha"),
		ghim: "nhap-nguoc-chieu",
	},
	{
		chan: "E10a",
		nhom: "vua",
		eval: "E10",
		tep: `${H}/mot-duong.mjs`,
		cu: "const CHIN = 9;",
		moi: "const CHIN = 8;",
		do: chanMoi("ho-so-cu-van-xanh"),
		ghim: "ho-so-cu-do:mot-duong",
	},
	{
		chan: "E9a",
		nhom: "vua",
		eval: "E9",
		tep: "apps/app/components/crm/record-sheet/record-parts.tsx",
		cu: "export type MetaPart = { text: string | null | undefined; lang?: Locale };",
		moi: "export type MetaPart = { noi_dung: string | null | undefined; lang?: Locale };",
		do: { lenh: "bun", doi_so: ["run", "check-types"] },
		ghim: "khai-tieng-metaline.spec.tsx",
	},
	{
		chan: "E10b",
		eval: "E10",
		nhom: "vua",
		tep: "packages/ui/src/components/foreign-text.tsx",
		cu: "			{children}",
		moi: "			{children}{null}",
		do: chanMoi("ho-so-cu-van-xanh"),
		ghim: "cham-san-pham:packages/ui/src/components/foreign-text.tsx",
	},
	{
		chan: "E12",
		nhom: "nhanh",
		eval: ["E12a", "E12b", "E12c", "E12d"],
		tep: `${R}/khai-sinh-phu-vong-nay.mjs`,
		cu: [
			"\t{",
			'\t\tchan: "E13",',
			'\t\tnhom: "nhanh",',
			'\t\teval: "E13",',
			"\t\tcommit: true,",
			"\t\ttep: GS,",
			'\t\tcu: \'"runsIn": "@crm/ui#test"\',',
			'\t\tmoi: \'"runsIn": "@crm/ui#test "\',',
			'\t\tdo: chanMoi("ghim-lai-da-xong"),',
			'\t\tghim: "bang-chung-hoa-cu:.githooks/gate-shape.json",',
			"\t},",
			"",
		].join("\n"),
		moi: "",
		do: {
			lenh: "bun",
			doi_so: [`${R}/khai-sinh-phu-vong-nay.mjs`],
			tu_quy: true,
		},
		ghim: "chan-moi-khong-do-duoc:E13",
	},
	{
		chan: "E13",
		nhom: "nhanh",
		eval: "E13",
		commit: true,
		tep: GS,
		cu: '"runsIn": "@crm/ui#test"',
		moi: '"runsIn": "@crm/ui#test "',
		do: chanMoi("ghim-lai-da-xong"),
		ghim: "bang-chung-hoa-cu:.githooks/gate-shape.json",
	},
	{
		chan: "E14",
		nhom: "nhanh",
		eval: "E14",
		tep: `${R}/bay-benh-cu.mjs`,
		cu: "const BAY = 7;",
		moi: "const BAY = 6;",
		do: chanMoi("bay-benh-cu"),
		ghim: "HANG GHIM LECH",
	},
	{
		chan: "E14-A",
		tat_ca: true,
		nhom: "nhanh",
		eval: "E14",
		tep: "_acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs",
		cu: "sao = dungCaySao();",
		moi: "sao = dungCaySaoX();",
		do: chanMoi("bay-benh-cu"),
		ghim: "benh-cu-quay-lai:A",
	},
	{
		chan: "E14-C",
		tat_ca: true,
		nhom: "nhanh",
		eval: "E14",
		tep: "_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs",
		cu: "await goiMayChu(",
		moi: "await goiMayChuX(",
		do: chanMoi("bay-benh-cu"),
		ghim: "benh-cu-quay-lai:C",
	},
	{
		chan: "E14-D",
		tat_ca: true,
		nhom: "nhanh",
		eval: "E14",
		tep: "_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs",
		cu: "doi_chung_duong",
		moi: "doiXchungXduong",
		do: chanMoi("bay-benh-cu"),
		ghim: "benh-cu-quay-lai:D",
	},
	{
		chan: "E14-E",
		tat_ca: true,
		nhom: "nhanh",
		eval: "E14",
		tep: "_acceptance/ho-so-khai-dung-tieng/rang/mot-duong.mjs",
		cu: "NHAP_UI.test(noi_dung)",
		moi: "NHAP_UIX.test(noi_dung)",
		do: chanMoi("bay-benh-cu"),
		ghim: "benh-cu-quay-lai:E",
	},
	{
		chan: "E14-F",
		tat_ca: true,
		nhom: "nhanh",
		eval: "E14",
		tep: "_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs",
		cu: 'data-slot="sheet-content"',
		moi: 'data-slot="sheet-contentX"',
		do: chanMoi("bay-benh-cu"),
		ghim: "benh-cu-quay-lai:F",
	},
	{
		chan: "E14-G",
		tat_ca: true,
		nhom: "nhanh",
		eval: "E14",
		tep: "_acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs",
		cu: "CHO_PHEP_CAY_BAN",
		moi: "CHO_PHEP_XXX",
		do: chanMoi("bay-benh-cu"),
		ghim: "benh-cu-quay-lai:G",
	},
	{
		chan: "E14-chot-ghim-cu",
		tat_ca: true,
		nhom: "nhanh",
		eval: "E14",
		tep: "_acceptance/ho-so-khai-dung-tieng/rang/bang-dot-bien.mjs",
		cu: 'ghim: "lech-boc:gioi-thieu"',
		moi: 'ghim: "LECH_BOC_X:gioi-thieu"',
		do: chanMoi("bay-benh-cu"),
		ghim: "benh-cu-quay-lai:chot-ghim-cu",
	},
];

const banKhai = readFileSync(
	join(GOC, "_acceptance/thuoc-khai-dung-tieng/evals.yaml"),
	"utf8",
);

const EVAL_MAY = [
	...banKhai.matchAll(
		/^ {2}- id: (\S+)\n {4}criterion: \S+\n {4}executor: (\S+)/gm,
	),
]
	.filter((m) => m[2] !== "judgment")
	.map((m) => m[1]);

console.log(
	"-- Thuoc cua thuoc khong duoc mien luat cua thuoc (AC-11).\n" +
		"-- Phu do bang ANH XA TUNG EVAL, khong bang so tong. So tong 13=13 van dat\n" +
		"   khi mot eval co HAI dot bien va mot eval khac KHONG co cai nao — do 19/09,\n" +
		"   hoi dong S4 vong 1: eval E9 (`bun run check-types`) khong dot bien nao chay qua.",
);
ghim("so eval may trong evals.yaml", EVAL_MAY.length, 16);

const phuTheoEval = new Map(EVAL_MAY.map((e) => [e, []]));
const laMat = [];
for (const d of DOT_BIEN_VONG_NAY) {
	const cac = Array.isArray(d.eval) ? d.eval : [d.eval];
	for (const e of cac) {
		if (!phuTheoEval.has(e)) {
			laMat.push(`${d.chan} -> ${JSON.stringify(e)}`);
			continue;
		}
		phuTheoEval.get(e).push(d.chan);
	}
}
const thieuEval = [...phuTheoEval]
	.filter(([, v]) => v.length === 0)
	.map(([k]) => k);

if (laMat.length > 0 || thieuEval.length > 0) {
	for (const e of thieuEval) {
		console.log(
			`   [chan-moi-khong-do-duoc:${e}] eval nay KHONG co dot bien nao chay qua`,
		);
	}
	for (const x of laMat) {
		console.log(
			`   [chan-moi-khong-do-duoc:la-mat] dot bien ${x} khong tro toi eval may nao`,
		);
	}
	process.exit(1);
}
console.log(
	`-- ${EVAL_MAY.length} eval may, moi eval co it nhat mot dot bien:\n` +
		[...phuTheoEval]
			.map(([k, v]) => `     ${k.padEnd(4)} <- ${v.join(", ")}`)
			.join("\n"),
);

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

const NHOM_CHAY = process.env.KS_NHOM ?? "tat-ca";
const DOT_BIEN_CHAY =
	NHOM_CHAY === "tat-ca"
		? DOT_BIEN_VONG_NAY
		: DOT_BIEN_VONG_NAY.filter((d) => d.nhom === NHOM_CHAY);
if (DOT_BIEN_CHAY.length === 0) {
	console.log(
		`KHONG DO DUOC: nhom ${JSON.stringify(NHOM_CHAY)} khong co dot bien nao.\n` +
			"   Mot nhom rong chay het trong mot giay va bao xanh — trong y het da do xong.",
	);
	process.exit(2);
}
console.log(
	`-- NHOM CHAY: ${NHOM_CHAY} — ${DOT_BIEN_CHAY.length}/${DOT_BIEN_VONG_NAY.length} dot bien.\n` +
		"   Tach nhom vi cong cu cham cat lenh o 600 giay, ma tron bo mat ~30 phut.\n" +
		"   Phep kiem ANH XA o tren van doc bang DAY DU, khong doc bang da loc —\n" +
		"   neu khong, moi nhom se tu bao la da phu du phan cua minh.",
);

const hang = [];
let hong = 0;
let sao = null;
let mayChu = null;

const { kiemCsdlThu } = await import(
	"../../ho-so-khai-dung-tieng/rang/du-lieu-thu.mjs"
);
kiemCsdlThu();
const { db } = await import("../../../packages/db/src/index.ts");
const TIEN_TO_VAT = "Vat Thu";
const truocDB = new Map(
	(await db.deal.findMany({ select: { id: true, stage: true, name: true } }))
		.filter((d) => !d.name.startsWith(TIEN_TO_VAT))
		.map((d) => [d.id, d.stage]),
);
console.log(
	`-- CHUP CSDL TRUOC: ${truocDB.size} thoa thuan. Mot phep pha o day co CHU DICH\n` +
		"   vo hieu hoa phep tra lai (E5), nen chinh bo khai sinh phai tra CSDL ve\n" +
		"   nguyen trang — khong thi luot chay ke tiep do mot tien de da hong.",
);

try {
	sao = dungCaySao();
	console.log(`-- BAN SAO: ${sao}`);
	mayChu = await dungMayChu(sao);
	console.log(`-- MAY CHU CUA BAN SAO: ${APP_SAO} · ${API_SAO}`);

	const moi_truong = {
		APP_URL: APP_SAO,
		API_URL: API_SAO,
		CHO_PHEP_CAY_BAN: "1",
		KHOA_DA_GIU: "1",
	};

	const mtCua = (d) => ({
		...moi_truong,
		CHAN_TU_QUY: d.do.tu_quy ? "1" : "",
	});

	const khoaLenh = (x) =>
		JSON.stringify([x.do.lenh, x.do.doi_so, x.do.duoi ?? ""]);
	const raLanh = new Map();
	for (const d of DOT_BIEN_CHAY) {
		if (raLanh.has(khoaLenh(d))) continue;
		raLanh.set(khoaLenh(d), chay(d.do, sao, mtCua(d)));
	}
	console.log(
		`-- LUOT LANH: ${raLanh.size} lenh rieng biet, chay MOT LAN moi lenh, TRUOC khi\n` +
			"   pha bat cu gi. Chay lai luot lanh cho tung phep pha la tra cung mot gia\n" +
			"   nhieu lan cho cung mot cau tra loi — va dat den muc vuot tran 600 giay.",
	);

	for (const d of DOT_BIEN_CHAY) {
		if (d.tao) {
			const duongMoi = join(sao, d.tao);
			const lanh = raLanh.get(khoaLenh(d)) ?? { ma: null, ra: "" };
			try {
				writeFileSync(duongMoi, d.noi_dung);
				const r = chay(d.do, sao, mtCua(d));
				const coGhim = r.ra.includes(d.ghim);
				const vang = lanh.ma === 0 && !lanh.ra.includes(d.ghim);
				const dat = r.ma !== 0 && coGhim && vang;
				if (!dat) hong += 1;
				hang.push(
					`${dat ? "dat " : "KHONG DAT"} ${d.chan.padEnd(4)} (TAO tep moi) ma ${r.ma} · ghim ${coGhim ? "CO" : "KHONG"} · vang o luot lanh ${vang ? "co" : "KHONG"}` +
						(dat
							? ""
							: `\n        [chan-moi-khong-do-duoc:${d.chan}] ghim ${JSON.stringify(d.ghim)}`),
				);
			} finally {
				if (existsSync(duongMoi)) rmSync(duongMoi);
			}
			continue;
		}
		const duong = join(sao, d.tep);
		if (!existsSync(duong)) {
			hang.push(
				`${d.chan.padEnd(4)} [chan-moi-khong-do-duoc:${d.chan}] TEP KHONG CO trong ban sao: ${d.tep}\n` +
					"        Mot ENOENT tran o day giet ca nhom va khong noi phep pha nao hong.",
			);
			hong += 1;
			continue;
		}
		const goc = readFileSync(duong, "utf8");
		try {
			const mt = mtCua(d);
			const lanh = raLanh.get(khoaLenh(d)) ?? { ma: null, ra: "" };
			if (lanh.ma !== 0) {
				hang.push(
					`${d.chan.padEnd(4)} [chan-moi-khong-do-duoc:${d.chan}] LUOT LANH da DO san (ma ${lanh.ma}).\n` +
						'        Vut ma thoat cua luot lanh roi ket luan "ghim vang" la dat TRONG:\n' +
						"        mot lenh do san vi ly do KHAC, ma thong diep loi khong chua chuoi ghim,\n" +
						"        van cho vang=true — roi luot pha cung do, va phep pha tinh DAT ma chua\n" +
						"        he chung chan do bat duoc gi. pha-thu.mjs lam dung cho nay tu dau.",
				);
				hong += 1;
				continue;
			}
			const vang = !lanh.ra.includes(d.ghim);
			if (!vang) {
				hang.push(
					`${d.chan.padEnd(4)} [chan-moi-khong-do-duoc:${d.chan}] chuoi ghim ${JSON.stringify(d.ghim)} CO MAT o luot LANH:\n` +
						lanh.ra
							.split("\n")
							.filter((x) => x.includes(d.ghim))
							.slice(0, 4)
							.map((x) => `          lanh| ${x}`)
							.join("\n"),
				);
			}

			if (!goc.includes(d.cu)) {
				hang.push(
					`${d.chan.padEnd(4)} [chan-moi-khong-do-duoc:${d.chan}] PHEP PHA KHONG AP DUNG DUOC trong ${d.tep}`,
				);
				hong += 1;
				continue;
			}
			writeFileSync(
				duong,
				d.tat_ca ? goc.replaceAll(d.cu, d.moi) : goc.replace(d.cu, d.moi),
			);
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
	const sauDB = new Map(
		(await db.deal.findMany({ select: { id: true, stage: true, name: true } }))
			.filter((d) => !d.name.startsWith(TIEN_TO_VAT))
			.map((d) => [d.id, d.stage]),
	);
	let daTra = 0;
	let daBienMat = 0;
	for (const [id, cu] of truocDB) {
		if (!sauDB.has(id)) {
			daBienMat += 1;
			continue;
		}
		if (sauDB.get(id) !== cu) {
			await db.deal
				.update({ where: { id }, data: { stage: cu } })
				.then(() => {
					console.log(`-- TRA CSDL: ${id} ${sauDB.get(id)} -> ${cu}`);
					daTra += 1;
				})
				.catch((loi) => {
					console.log(
						`-- TRA CSDL HONG [ban-ghi-that-con-lech:${id}] ${loi?.code ?? loi?.message}\n` +
							"   Chi log roi di tiep nghia la: mot ban ghi THAT van mang stage sai ma\n" +
							"   luong thoat 0. AC-5 hua dung dieu nguoc lai.",
					);
					hong += 1;
				});
		}
	}
	if (daBienMat > 0) {
		console.log(
			`-- ${daBienMat} ban ghi trong anh chup da BIEN MAT truoc khi tra. Khong nem:\n` +
				"   chung la vat thu bi mot chan do khac don hop le. Anh chup da BO tep mang\n" +
				"   tien to vat-thu, va phep tra bo qua ban ghi khong con — chup TOAN BO roi\n" +
				"   nem P2025 la bien mot cuoc don hop le thanh mot loi giet ca nhom.",
		);
	}
	console.log(`-- DA TRA ${daTra} thoa thuan ve nguyen trang.`);
	await db.$disconnect();
	if (mayChu) {
		mayChu.api.kill();
		mayChu.app.kill();
		console.log("-- DA TAT may chu cua ban sao");
	}
	if (sao) donCaySao(sao);
}

bang(`-- nhom ${NHOM_CHAY}: ${DOT_BIEN_CHAY.length} phep pha:`, hang);
console.log(
	`ket qua: ${hong} phep pha KHONG do duoc tren ${DOT_BIEN_CHAY.length} (nhom ${NHOM_CHAY}; ca bang ${DOT_BIEN_VONG_NAY.length})`,
);
process.exit(hong > 0 ? 1 : 0);
