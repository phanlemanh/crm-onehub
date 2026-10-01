import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import {
	CHOT_DAT,
	chay,
	dongCo,
	dongCua,
	GOC,
	ketThuc,
	lenhE8,
	TEP_NAP,
} from "./chung.mjs";

const TEP_LOI_VAO = "apps/api/scripts/okr-mau.ts";
const TEP_LENH = "apps/api/scripts/okr-mau/lenh.ts";
const TEP_CANH = "apps/api/scripts/okr-mau/nap-canh-kr.ts";
const TEP_SO = "apps/api/src/okr/okr-so.service.ts";
const KHONG_AP = "miễn bộ mẫu không áp:";
const GOI_TAO = "okrSoChup.createMany({ data: chup })";
const GOI_XOA = "okrSoChup.deleteMany({ where: { keyResultId: K } })";
const DAU_XOA =
	"export async function xoaTrong(tx: Tx): Promise<DemBoMau | null> {\n";
const DAU_NAP = "): Promise<Omit<DemBoMau, keyof DemHoiY>> {\n";

const docGoc = (vai) => readFileSync(join(GOC, vai), "utf8");

function thayMot(chu, cu, moi, o) {
	const i = chu.indexOf(cu);
	if (i === -1 || chu.indexOf(cu, i + 1) !== -1)
		throw new Error(
			`BIEN DOI KHONG AP: ${o} — «${cu.trim()}» khong dung mot lan`,
		);
	return chu.slice(0, i) + moi + chu.slice(i + cu.length);
}

const chenSau = (dau, dong) => (chu, o) => thayMot(chu, dau, dau + dong, o);
const noiCuoi = (doan) => (chu) => `${chu}\n${doan}\n`;
const dauTep = (dong) => (chu) => `${dong}\n${chu}`;
const doi = (cu, moi) => (chu, o) => thayMot(chu, cu, moi, o);

function dungBanSao(o, bienDoi) {
	const thu = mkdtempSync(join(tmpdir(), "msb-"));
	const thay = [];
	const chuSao = new Map();
	for (const [vai, f] of bienDoi) {
		const goc = docGoc(vai);
		const chu = f(goc, o);
		if (chu === goc)
			throw new Error(`BIEN DOI KHONG AP: ${o} — ${vai} khong doi`);
		const duong = join(thu, basename(vai));
		writeFileSync(duong, chu);
		thay.push([vai, duong]);
		chuSao.set(vai, { duong, chu });
	}
	return { thu, thay, chuSao };
}

function mienKyVong(chuSao, coTao, coXoa) {
	const sao = chuSao.get(TEP_NAP);
	const ten = sao ? sao.duong : TEP_NAP;
	const chu = sao ? sao.chu : docGoc(TEP_NAP);
	return [
		coTao && `mien ${ten}:${dongCua(chu, GOI_TAO)} createMany trong napTrong`,
		coXoa && `mien ${ten}:${dongCua(chu, GOI_XOA)} deleteMany trong xoaTrong`,
	].filter(Boolean);
}

function viTri(chuSao, vai, moc) {
	const sao = chuSao.get(vai);
	const ten = sao ? sao.duong : vai;
	const chu = sao ? sao.chu : docGoc(vai);
	const d = dongCua(chu, moc);
	if (d === null) throw new Error(`MOC KHONG DUY NHAT: «${moc}» trong ${ten}`);
	return `${ten}:${d}`;
}

const chotVo = (c) => CHOT_DAT.replace(`${c} dat`, `${c} vo`);
const bangNhau = (a, b) =>
	a.length === b.length &&
	[...a].sort().every((x, i) => x === [...b].sort()[i]);

function chamO(o) {
	const { thu, thay, chuSao } = dungBanSao(o.ten, o.bienDoi);
	try {
		const { ma, ra } = chay(thay);
		const sai = [];
		if (ma !== 1) sai.push(`ma ${ma}, can 1`);
		for (const c of o.cau(chuSao))
			if (!ra.split("\n").includes(c)) sai.push(`thieu «${c}»`);
		const chot = dongCo(ra, "chot mien bo mau:").join("|");
		if (chot !== o.chot) sai.push(`dong chot «${chot}», can «${o.chot}»`);
		const mien = dongCo(ra, "mien ");
		const ky = mienKyVong(chuSao, o.mien.tao, o.mien.xoa);
		if (!bangNhau(mien, ky))
			sai.push(`dong mien [${mien.join(" | ")}], can [${ky.join(" | ")}]`);
		return { o: o.ten, ma, sai };
	} finally {
		rmSync(thu, { recursive: true, force: true });
	}
}

const giuMien = { tao: true, xoa: true };
const biSua = (vai, moc, cach) => (cs) => [
	`okrSoChup bị sửa: ${viTri(cs, vai, moc)} (${cach})`,
];
const taoNgoai = (vai, moc, cach, ham) => (cs) => [
	`okrSoChup tạo ngoài chỗ được phép: ${viTri(cs, vai, moc)} (${cach} trong ${ham})`,
];
const napVePhamLuat = (cs) => [
	`okrSoChup bị sửa: ${viTri(cs, TEP_NAP, GOI_XOA)} (deleteMany)`,
	`okrSoChup tạo ngoài chỗ được phép: ${viTri(cs, TEP_NAP, GOI_TAO)} (createMany trong napTrong)`,
];

const NGOAI = [
	{
		ten: "n1 deleteMany trong ham moi cua nap.ts",
		bienDoi: [
			[
				TEP_NAP,
				noiCuoi(
					'export async function xoaSoKhacMsb(tx: Tx) {\n\tawait tx.okrSoChup.deleteMany({ where: { keyResultId: "n1" } });\n}',
				),
			],
		],
		cau: biSua(
			TEP_NAP,
			'okrSoChup.deleteMany({ where: { keyResultId: "n1" } })',
			"deleteMany",
		),
	},
	{
		ten: "n2 deleteMany trong nap-canh-kr.ts",
		bienDoi: [
			[
				TEP_CANH,
				noiCuoi(
					'export async function xoaSoCanhMsb(tx: Tx) {\n\tawait tx.okrSoChup.deleteMany({ where: { keyResultId: "n2" } });\n}',
				),
			],
		],
		cau: biSua(
			TEP_CANH,
			'okrSoChup.deleteMany({ where: { keyResultId: "n2" } })',
			"deleteMany",
		),
	},
	{
		ten: "n3 updateMany trong xoaTrong",
		bienDoi: [
			[
				TEP_NAP,
				chenSau(
					DAU_XOA,
					'\tawait tx.okrSoChup.updateMany({ where: { keyResultId: "n3" }, data: { giaTri: 0 } });\n',
				),
			],
		],
		cau: biSua(
			TEP_NAP,
			'okrSoChup.updateMany({ where: { keyResultId: "n3" }',
			"updateMany",
		),
	},
	{
		ten: "n4 $executeRaw DELETE trong xoaTrong",
		bienDoi: [
			[
				TEP_NAP,
				chenSau(
					DAU_XOA,
					'\tawait tx.$executeRaw`DELETE FROM "okrSoChup" WHERE "keyResultId" = \'n4\'`;\n',
				),
			],
		],
		cau: biSua(TEP_NAP, "tx.$executeRaw`DELETE FROM", "SQL thô $executeRaw"),
	},
	{
		ten: "n5 createMany trong xoaTrong",
		bienDoi: [
			[
				TEP_NAP,
				chenSau(DAU_XOA, "\tawait tx.okrSoChup.createMany({ data: [] });\n"),
			],
		],
		cau: taoNgoai(
			TEP_NAP,
			"okrSoChup.createMany({ data: [] })",
			"createMany",
			"xoaTrong",
		),
	},
	{
		ten: "n6 createMany trong ham moi cua nap.ts",
		bienDoi: [
			[
				TEP_NAP,
				noiCuoi(
					"export async function napSoKhacMsb(tx: Tx) {\n\tawait tx.okrSoChup.createMany({ data: [] });\n}",
				),
			],
		],
		cau: taoNgoai(
			TEP_NAP,
			"okrSoChup.createMany({ data: [] })",
			"createMany",
			"napSoKhacMsb",
		),
	},
	{
		ten: "n7 deleteMany trong napTrong",
		bienDoi: [
			[
				TEP_NAP,
				chenSau(
					DAU_NAP,
					'\tawait tx.okrSoChup.deleteMany({ where: { keyResultId: "n7" } });\n',
				),
			],
		],
		cau: biSua(
			TEP_NAP,
			'okrSoChup.deleteMany({ where: { keyResultId: "n7" } })',
			"deleteMany",
		),
	},
	{
		ten: "n8 delete mot hang trong xoaTrong",
		bienDoi: [
			[
				TEP_NAP,
				chenSau(
					DAU_XOA,
					'\tawait tx.okrSoChup.delete({ where: { id: "n8" } });\n',
				),
			],
		],
		cau: biSua(TEP_NAP, 'okrSoChup.delete({ where: { id: "n8" } })', "delete"),
	},
	{
		ten: "n9 upsert trong napTrong",
		bienDoi: [
			[
				TEP_NAP,
				chenSau(
					DAU_NAP,
					'\tawait tx.okrSoChup.upsert({ where: { id: "n9" }, create: {}, update: {} });\n',
				),
			],
		],
		cau: biSua(TEP_NAP, 'okrSoChup.upsert({ where: { id: "n9" }', "upsert"),
	},
	{
		ten: "n10 soChup.create long trong napTrong",
		bienDoi: [
			[
				TEP_NAP,
				chenSau(
					DAU_NAP,
					'\tawait tx.okrKeyResult.update({ where: { id: "n10" }, data: { soChup: { create: { giaTri: 1 } } } });\n',
				),
			],
		],
		cau: taoNgoai(
			TEP_NAP,
			"create: { giaTri: 1 }",
			"soChup.create",
			"napTrong",
		),
	},
].map((o) => ({ ...o, chot: CHOT_DAT, mien: giuMien }));

const SO_IMPORT = '"../../scripts/okr-mau/nap"';
const cauC4 = (cs) => [
	`${KHONG_AP} ${cs.get(TEP_SO).duong} nhập okr-mau/nap từ ngoài công cụ okr:mau`,
	...napVePhamLuat(cs),
];
const cauC3 = (ham, ten) => (cs) => [
	`${KHONG_AP} ${ham} gọi ${ten} mà không gọi kiemOkrThat trước`,
	...napVePhamLuat(cs),
];
const cauDung = (vai, moc) => (cs) => [
	`${KHONG_AP} ${viTri(cs, vai, moc)} dùng xoaTrong ngoài lời gọi có chốt`,
	...napVePhamLuat(cs),
];
const cauC2 = (cs) => [
	`${KHONG_AP} ${TEP_LOI_VAO} không chặn bằng kiemDuocNap trước khi nạp ./okr-mau/lenh`,
	...napVePhamLuat(cs),
];
const cauC1 = (moc) => (cs) => [
	`${KHONG_AP} deleteMany trong xoaTrong không lọc keyResultId`,
	`okrSoChup bị sửa: ${viTri(cs, TEP_NAP, moc)} (deleteMany)`,
];
const khongMien = { tao: false, xoa: false };

const CHOT = [
	{
		ten: "c1a deleteMany({}) trong xoaTrong",
		chot: chotVo("C1"),
		mien: { tao: true, xoa: false },
		bienDoi: [[TEP_NAP, doi(GOI_XOA, "okrSoChup.deleteMany({})")]],
		cau: cauC1("okrSoChup.deleteMany({})"),
	},
	{
		ten: "c1b deleteMany() trong xoaTrong",
		chot: chotVo("C1"),
		mien: { tao: true, xoa: false },
		bienDoi: [[TEP_NAP, doi(GOI_XOA, "okrSoChup.deleteMany()")]],
		cau: cauC1("okrSoChup.deleteMany()"),
	},
	{
		ten: "c2a bo loi goi kiemDuocNap",
		chot: chotVo("C2"),
		mien: khongMien,
		bienDoi: [
			[
				TEP_LOI_VAO,
				doi("kiemDuocNap(process.env)", '({ cho: true, cau: "" })'),
			],
		],
		cau: cauC2,
	},
	{
		ten: "c2b bo khoi if process.exit",
		chot: chotVo("C2"),
		mien: khongMien,
		bienDoi: [
			[
				TEP_LOI_VAO,
				doi(
					"if (!chan.cho) {\n\tconsole.error(chan.cau);\n\tprocess.exit(OKR_MAU.ma.chan);\n}\n",
					"",
				),
			],
		],
		cau: cauC2,
	},
	{
		ten: "c2c nhap tinh ./okr-mau/lenh",
		chot: chotVo("C2"),
		mien: khongMien,
		bienDoi: [[TEP_LOI_VAO, dauTep('import "./okr-mau/lenh";')]],
		cau: cauC2,
	},
	{
		ten: "c3a bo kiemOkrThat trong xoaBoOkrMau",
		chot: chotVo("C3"),
		mien: khongMien,
		bienDoi: [
			[
				TEP_NAP,
				doi(
					"\t\tawait kiemOkrThat(tx);\n\t\treturn xoaTrong(tx);",
					"\t\treturn xoaTrong(tx);",
				),
			],
		],
		cau: cauC3("xoaBoOkrMau", "xoaTrong"),
	},
	{
		ten: "c3b bo kiemOkrThat trong napBoOkrMau",
		chot: chotVo("C3"),
		mien: khongMien,
		bienDoi: [
			[
				TEP_NAP,
				doi(
					"\t\tawait kiemOkrThat(tx);\n\t\tawait xoaTrong(tx);",
					"\t\tawait xoaTrong(tx);",
				),
			],
		],
		cau: cauC3("napBoOkrMau", "xoaTrong"),
	},
	{
		ten: "c3c gan const f = xoaTrong",
		chot: chotVo("C3"),
		mien: khongMien,
		bienDoi: [[TEP_NAP, noiCuoi("const f = xoaTrong;")]],
		cau: cauDung(TEP_NAP, "const f = xoaTrong;"),
	},
	{
		ten: "c3d lenh.ts goi thang xoaTrong",
		chot: chotVo("C3"),
		mien: khongMien,
		bienDoi: [
			[
				TEP_LENH,
				(c) =>
					noiCuoi(
						"export async function xoaThangMsb(tx: never) {\n\treturn xoaTrong(tx);\n}",
					)(dauTep('import { xoaTrong } from "./nap";')(c)),
			],
		],
		cau: cauDung(TEP_LENH, "return xoaTrong(tx);"),
	},
	{
		ten: "c4a nhap tinh tu apps/api/src",
		chot: chotVo("C4"),
		mien: khongMien,
		bienDoi: [[TEP_SO, dauTep(`import { xoaTrong } from ${SO_IMPORT};`)]],
		cau: cauC4,
	},
	{
		ten: "c4b import() dong tu apps/api/src",
		chot: chotVo("C4"),
		mien: khongMien,
		bienDoi: [
			[
				TEP_SO,
				noiCuoi(
					`export async function napMauMsb() {\n\treturn import(${SO_IMPORT});\n}`,
				),
			],
		],
		cau: cauC4,
	},
	{
		ten: "c4c require tu apps/api/src",
		chot: chotVo("C4"),
		mien: khongMien,
		bienDoi: [
			[TEP_SO, noiCuoi(`export const mauMsb = require(${SO_IMPORT});`)],
		],
		cau: cauC4,
	},
	{
		ten: "c4d export from tu apps/api/src",
		chot: chotVo("C4"),
		mien: khongMien,
		bienDoi: [[TEP_SO, noiCuoi(`export { xoaTrong } from ${SO_IMPORT};`)]],
		cau: cauC4,
	},
];

function doiChung() {
	const { ma, ra } = chay();
	const ky = mienKyVong(new Map(), true, true);
	const ok =
		ma === 0 &&
		dongCo(ra, "chot mien bo mau:").join("|") === CHOT_DAT &&
		bangNhau(dongCo(ra, "mien "), ky);
	console.log(`doi chung: ${ok ? "xanh" : "DOI CHUNG HONG"} (ma ${ma})`);
	if (!ok) {
		console.log(ra);
		process.exit(1);
	}
}

function chamBang(nhan, bang) {
	doiChung();
	let bat = 0;
	for (const o of bang) {
		let kq;
		try {
			kq = chamO(o);
		} catch (loi) {
			kq = { o: o.ten, ma: null, sai: [loi.message] };
		}
		if (kq.sai.length === 0) bat += 1;
		console.log(
			kq.sai.length === 0
				? `bat  ${kq.o} · ma ${kq.ma}`
				: `LOT  ${kq.o}: ${kq.sai.join("; ")}`,
		);
	}
	console.log(`${nhan}: ${bat}/${bang.length} bi bat`);
	ketThuc(bat === bang.length ? 0 : 1, `${nhan} ${bat}/${bang.length} bi bat`);
}

function chamCu() {
	const goc = lenhE8();
	const cac = [
		{
			ten: "--chieu-do",
			lenh: goc.replace("--ca chi-them", "--ca chi-them --chieu-do"),
			ma: 1,
			chu: "chieu do: 2/2 ban sao bi bat",
		},
		{
			ten: "khong --ca",
			lenh: goc.replace(" --ca chi-them", ""),
			ma: 2,
			chu: "KHONG DO DUOC",
		},
		{
			ten: "--ca la",
			lenh: goc.replace("--ca chi-them", "--ca la"),
			ma: 2,
			chu: "KHONG DO DUOC",
		},
	];
	let giu = 0;
	for (const c of cac) {
		const r = spawnSync("bash", ["-c", c.lenh], {
			cwd: GOC,
			encoding: "utf8",
			maxBuffer: 64 * 1024 * 1024,
		});
		const ra = `${r.stdout ?? ""}${r.stderr ?? ""}`;
		const dung = r.status === c.ma && ra.includes(c.chu);
		if (dung) giu += 1;
		console.log(
			dung
				? `giu  ${c.ten} · ma ${r.status}`
				: `LECH ${c.ten}: ma ${r.status}, can ${c.ma} va «${c.chu}»`,
		);
	}
	console.log(`cu: ${giu}/${cac.length} giu hanh vi`);
	ketThuc(giu === cac.length ? 0 : 1, `cu ${giu}/${cac.length} giu hanh vi`);
}

const i = process.argv.indexOf("--ca");
const ca = i === -1 ? null : process.argv[i + 1];
if (ca === "ngoai") chamBang("ngoai", NGOAI);
else if (ca === "chot") chamBang("chot", CHOT);
else if (ca === "cu") chamCu();
else {
	console.log("KHONG DO DUOC: can --ca ngoai | chot | cu");
	process.exit(2);
}
