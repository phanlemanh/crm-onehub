import { spawnSync } from "node:child_process";
import {
	lstatSync,
	mkdirSync,
	readdirSync,
	rmSync,
	symlinkSync,
} from "node:fs";
import { join } from "node:path";
import {
	dungBanSao,
	GOC,
	goBanSao,
	KhongDo,
	thayMotLan,
} from "../../ca-chap-chon-cach-ly/rang/ban-sao.mjs";

const SO_CAP_KHAI = 21;
const TRAN_MS = 900_000;
const API = (tep, t) =>
	`bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/${tep}${t ? ` -t ${t}` : ""}"`;
const DOM = (tep, t) =>
	`cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/${tep} -t ${t}`;
const DG = {
	tao: API("du-an.spec.ts", "dg-tao"),
	gom: API("du-an.spec.ts", "dg-gom"),
	moc: API("du-an.spec.ts", "dg-moc"),
	vongDoi: API("du-an.spec.ts", "dg-vong-doi"),
	batDau: API("du-an-lich.spec.ts", "dg-bat-dau"),
	keoThanh: API("du-an-lich.spec.ts", "dg-keo-thanh"),
	phuThuoc: API("du-an-lich.spec.ts", "dg-phu-thuoc"),
	tuDoi: API("du-an-lich.spec.ts", "dg-tu-doi"),
	lich: API("lich-lam-viec.spec.ts"),
	quyen: API("du-an-quyen.spec.ts"),
	thuoc:
		'bun run test -- "cd apps/api && bun test test/du-an-do-nguong.spec.ts"',
	ngayLam:
		"cd packages/db && TZ=Asia/Ho_Chi_Minh bun test test/lich-lam-viec.spec.ts test/lich-viec.spec.ts",
	ganttUi:
		"cd packages/ui && TZ=Asia/Ho_Chi_Minh bun test --preload ./test/setup-dom.ts ./test/gantt-du-an.dom.tsx -t gantt-du-an",
	san: "node _acceptance/du-an-gantt/rang/san-thiet-ke.mjs",
	manNgay:
		"cd apps/app && for tz in Asia/Ho_Chi_Minh UTC; do TZ=$tz bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-viec-lich.dom.tsx -t dg-man-ngay || exit 1; done",
	manGantt: DOM("du-an-gantt.dom.tsx", "dg-man-gantt"),
};
const GHI = "packages/db/src/viec-ghi.ts";
const DU_AN_GHI = "packages/db/src/du-an-ghi.ts";
const LUAT = "packages/db/src/viec.ts";
const LICH = "packages/db/src/lich-lam-viec.ts";
const LICH_VIEC = "packages/db/src/lich-viec.ts";
const HOP_DONG = "apps/api/src/du-an/du-an.contracts.ts";
const DU_AN_SV = "apps/api/src/du-an/du-an.service.ts";
const VIEC_SV = "apps/api/src/viec/viec.service.ts";
const LICH_SV = "apps/api/src/lich-lam-viec/lich-lam-viec.service.ts";
const GANTT = "packages/ui/src/components/gantt-du-an.tsx";
const THUOC = "_acceptance/du-an-gantt/rang/do-nguong.mjs";
const DAI = "apps/app/components/du-an/dai-du-an.tsx";
const KHUNG = "apps/app/components/viec/khung-viec.tsx";
const PHAM_VI = "apps/app/components/du-an/pham-vi.ts";

const CAP = [
	[
		"a duAn.tao bo kiem ten rong",
		[
			[
				HOP_DONG,
				"const ten = z.string().trim().min(1).max(DU_AN.tenToiDa);",
				"const ten = z.string().trim().max(DU_AN.tenToiDa);",
			],
			[DU_AN_GHI, "\tif (t.length === 0)\n", "\tif (t.length < 0)\n"],
		],
		[[DG.tao, "dg: ten sai van tao"]],
	],
	[
		"b dieuKienXemViec bo ve duAnId",
		[[LUAT, "\t\t\t{ duAnId: { not: null } },\n", ""]],
		[[DG.gom, "dg: viec trong du an khong thay"]],
	],
	[
		"c bo luat bat dau truoc han",
		[[GHI, "if (batMoi && hanMoi && batMoi > hanMoi) {", "if (false) {"]],
		[[DG.batDau, "dg: bat dau sau han"]],
	],
	[
		"d GanttDuAn bo ngay le cua offDays",
		[[GANTT, "dates: lich.ngayLe.map(dauNgay),", "dates: [],"]],
		[[DG.ganttUi, "gantt: ngay nghi sai"]],
	],
	[
		"e doiLich ghi nguon web",
		[[VIEC_SV, 'nguon: "gantt",', 'nguon: "web",']],
		[[DG.keoThanh, "dg: vet keo thanh sai"]],
	],
	[
		"f bo do vong",
		[
			[
				LICH_VIEC,
				'throw new LoiLich("vong", [...ngan.slice(tu), x]);',
				"return;",
			],
			[
				LICH_VIEC,
				"const d = duong(keTiep(canh), moi.sauId, moi.truocId);",
				"const d = null;",
			],
		],
		[[DG.phuThuoc, "dg: tu choi lech"]],
	],
	[
		"g ngayLamKe bo ngay le",
		[
			[
				LICH,
				"!lich.ngayNghiTuan.includes(thuIso(ngay)) && !lich.ngayLe.includes(ngay)",
				"!lich.ngayNghiTuan.includes(thuIso(ngay))",
			],
		],
		[[DG.ngayLam, "llv:"]],
	],
	[
		"h tinhDoi cho keo lui",
		[
			[
				LICH_VIEC,
				"v.batDau >= canTu) continue;",
				"v.batDau === canTu) continue;",
			],
		],
		[[DG.tuDoi, "dg: keo lui that"]],
	],
	[
		"i moc tre doc ngay bat dau",
		[
			[
				DU_AN_SV,
				"viec: { select: { tieuDe: true, hanNgay: true } },",
				"viec: { select: { tieuDe: true, hanNgay: true, batDauNgay: true } },",
			],
			[
				DU_AN_SV,
				"\t\t\t\t\t\ttieuDe: c.viec.tieuDe,\n\t\t\t\t\t\than: ngay(c.viec.hanNgay),",
				"\t\t\t\t\t\ttieuDe: c.viec.tieuDe,\n\t\t\t\t\t\than: ngay(c.viec.batDauNgay),",
			],
		],
		[[DG.moc, "dg: moc khong tre"]],
	],
	[
		"j themNgayLe bo canManageSettings",
		[
			[
				LICH_SV,
				"\t\tawait this.kiem(userId);\n\t\tawait this.db\n\t\t\t.$transaction((tx) =>\n\t\t\t\tthemNgayLe(",
				"\t\tawait this.db\n\t\t\t.$transaction((tx) =>\n\t\t\t\tthemNgayLe(",
			],
		],
		[[DG.lich, "llv: member ghi duoc"]],
	],
	[
		"k duAn.dong bo kiem nguoi tao",
		[
			[
				DU_AN_GHI,
				"\tkiemNguoiDong(da, input);\n\tif (da.dongLuc) return;",
				"\tif (da.dongLuc) return;",
			],
		],
		[[DG.quyen, "dgq: o"]],
	],
	[
		"l dongDuAn doi viec sang Xong",
		[
			[
				DU_AN_GHI,
				'\tawait ghiVetDuAn(tx, da.id, input.nguoiId, input.now, { loai: "dong" });',
				'\tawait tx.viec.updateMany({ where: { duAnId: da.id }, data: { trangThai: "XONG" } });\n\tawait ghiVetDuAn(tx, da.id, input.nguoiId, input.now, { loai: "dong" });',
			],
		],
		[[DG.vongDoi, "dg: dong doi viec"]],
	],
	[
		"m thuoc dem ca viec thieu han",
		[
			[
				THUOC,
				'AND v."batDauNgay" IS NOT NULL AND v."hanNgay" IS NOT NULL)::int AS du_ngay',
				'AND v."batDauNgay" IS NOT NULL)::int AS du_ngay',
			],
		],
		[[DG.thuoc, "dgt: dem viec thieu ngay"]],
	],
	[
		"n className mau tho vao dai du an",
		[
			[
				DAI,
				'<Item data-dai-du-an={duAn.id} variant="outline">',
				'<Item className="bg-amber-100" data-dai-du-an={duAn.id} variant="outline">',
			],
		],
		[[DG.san, "dg san:"]],
	],
	[
		"o nguoiTaoDat dem du an",
		[
			[
				THUOC,
				'count(DISTINCT "taoBoiId") FILTER (WHERE du_ngay >= $5)::int AS "nguoiTaoDat"',
				'count(*) FILTER (WHERE du_ngay >= $5)::int AS "nguoiTaoDat"',
			],
		],
		[[DG.thuoc, "dgt: nguoiTaoDat"]],
	],
	[
		"p duAnDatDu bo dieu kien moc",
		[
			[
				THUOC,
				"du_ngay >= $5 AND co_phu_thuoc AND co_moc)::int",
				"du_ngay >= $5 AND co_phu_thuoc)::int",
			],
		],
		[[DG.thuoc, "dgt: duAnDatDu"]],
	],
	[
		"q duAnCoPhuThuoc tra duAnDat",
		[
			[
				THUOC,
				'count(*) FILTER (WHERE co_phu_thuoc)::int AS "duAnCoPhuThuoc"',
				'count(*) FILTER (WHERE du_ngay >= $5)::int AS "duAnCoPhuThuoc"',
			],
		],
		[[DG.thuoc, "dgt: duAnCoPhuThuoc"]],
	],
	[
		"r duAn.xoa bo kiem nguoi tao",
		[
			[
				DU_AN_GHI,
				"\tkiemNguoiDong(da, input);\n\tif (await coLichSuDuAn(tx, da.id)) {",
				"\tif (await coLichSuDuAn(tx, da.id)) {",
			],
		],
		[[DG.quyen, "dgq: o"]],
	],
	[
		"s tu doi doi quyen o viec sau",
		[
			[
				GHI,
				"\t\tif (!v) continue;\n\t\tconst boi =",
				'\t\tif (!v) continue;\n\t\tconst g = await docViecGhi(tx, d.id, dau.nguoiId);\n\t\tif (!vaiCua(g, dau.nguoiId).giao && !vaiCua(g, dau.nguoiId).thucHien) throw new LoiViec("khong-quyen", "x");\n\t\tconst boi =',
			],
		],
		[[DG.tuDoi, "dg: tu doi doi quyen o sau"]],
	],
	[
		"t o Bat dau gui toISOString",
		[
			[
				KHUNG,
				"sua.mutate({ id: v.id, batDauNgay: batDau })",
				"sua.mutate({ id: v.id, batDauNgay: batDau ? new Date(`${batDau}T00:00:00`).toISOString().slice(0, 10) : null })",
			],
		],
		[[DG.manNgay, "dg: ngay gui lech"]],
	],
	[
		"u ViewSwitch de Gantt o Cua toi",
		[
			[
				PHAM_VI,
				'\treturn phamVi.loai === "du-an"\n\t\t? KIEU_XEM_VIEC\n\t\t: KIEU_XEM_VIEC.filter((k) => k !== "gantt");',
				"\treturn KIEU_XEM_VIEC;",
			],
			[
				PHAM_VI,
				"\tif (tho && co.includes(tho)) return tho;",
				"\tif (tho) return tho;",
			],
		],
		[[DG.manGantt, "dg: gantt lot ra cua toi"]],
	],
];

function goiCuaBanSao(banSao, nhom, ten) {
	const nm = join(banSao, nhom, ten, "node_modules");
	if (!lstatSync(nm).isSymbolicLink()) return;
	rmSync(nm);
	mkdirSync(join(nm, "@crm"), { recursive: true });
	const goc = join(GOC, nhom, ten, "node_modules");
	for (const muc of readdirSync(goc)) {
		if (muc !== "@crm") symlinkSync(join(goc, muc), join(nm, muc));
	}
	for (const goi of readdirSync(join(goc, "@crm"))) {
		symlinkSync(join(banSao, "packages", goi), join(nm, "@crm", goi));
	}
}

function lenh(cwd, cmd) {
	const r = spawnSync("sh", ["-c", cmd], {
		cwd,
		encoding: "utf8",
		timeout: TRAN_MS,
		maxBuffer: 64 * 1024 * 1024,
	});
	return { ma: r.status, ra: `${r.stdout}\n${r.stderr}` };
}

const coGhim = (ra, ghim) =>
	ra
		.split("\n")
		.some(
			(d) =>
				(d.startsWith("error:") || d.startsWith("dg san:")) && d.includes(ghim),
		);

const chiCap = new Set(
	(process.env.CHI_CAP ?? "").split(",").filter((x) => x !== ""),
);
const capChay = CAP.filter(([ten]) => chiCap.size === 0 || chiCap.has(ten[0]));

let banSao = null;
const xanh = new Map();
let daChay = 0;
const song = [];
let banSaoDo = false;
try {
	banSao = dungBanSao("dg");
	for (const [nhom, ten] of [
		["apps", "api"],
		["apps", "app"],
		["packages", "validation"],
		["packages", "ui"],
	]) {
		goiCuaBanSao(banSao, nhom, ten);
	}
	for (const [ten, sua, kiem] of capChay) {
		daChay += 1;
		for (const [cmd] of kiem) {
			if (!xanh.has(cmd)) xanh.set(cmd, lenh(banSao, cmd));
		}
		const traLai = [];
		const sau = [];
		try {
			for (const [tep, cu, moi] of sua)
				traLai.push(thayMotLan(banSao, tep, cu, moi));
			for (const [cmd, ghim] of kiem)
				sau.push({ cmd, ghim, ...lenh(banSao, cmd) });
		} finally {
			for (const tra of traLai.reverse()) tra();
		}
		for (const s of sau) {
			const truoc = xanh.get(s.cmd);
			if (truoc.ma !== 0) {
				console.log(`dot-bien: ban sao do san (${ten})`);
				console.error(truoc.ra.slice(-1500));
				banSaoDo = true;
				continue;
			}
			const chet = s.ma !== 0 && coGhim(s.ra, s.ghim);
			console.log(
				`${ten} xanh=${truoc.ma} do=${s.ma} ghim=${coGhim(s.ra, s.ghim) ? "ok" : "thieu"} «${s.ghim}»`,
			);
			if (!chet) {
				console.log(`dot-bien: ${ten[0]} song`);
				console.error(s.ra.slice(-1500));
				song.push(ten);
			}
		}
	}
} catch (loi) {
	if (banSao !== null) goBanSao(banSao);
	console.log(`KHONG DO DUOC: ${loi.message}`);
	process.exit(loi instanceof KhongDo ? 2 : 1);
}
if (banSao !== null) goBanSao(banSao);
if (banSaoDo) process.exit(2);
if (chiCap.size === 0 && daChay !== SO_CAP_KHAI) {
	console.log(`dot-bien: thieu ${daChay}`);
	process.exit(1);
}
console.log(`dot-bien: ${daChay - new Set(song).size}/${daChay} dot bien chet`);
process.exit(song.length === 0 ? 0 : 1);
