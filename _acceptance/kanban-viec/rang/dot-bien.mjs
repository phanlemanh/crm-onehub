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

const SO_CAP_KHAI = 13;
const TRAN_MS = 900_000;
const API = (tep, t) =>
	`bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/${tep}${t ? ` -t ${t}` : ""}"`;
const DOM = (tep, t) =>
	`cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/${tep} -t ${t}`;
const KV = {
	bang: API("viec-bang.spec.ts", "kv-bang"),
	keo: API("viec-bang.spec.ts", "kv-keo"),
	maTran: API("viec-bang.spec.ts", "kv-ma-tran"),
	thuTu: API("viec-bang.spec.ts", "kv-thu-tu"),
	con: API("viec-con.spec.ts", "kv-con-tao"),
	conQuyen: API("viec-con.spec.ts", "kv-con-quyen"),
	thuoc:
		'bun run test -- "cd apps/api && bun test test/viec-bang-do-nguong.spec.ts"',
	san: "node _acceptance/kanban-viec/rang/san-thiet-ke.mjs",
	manKeo: DOM("viec-bang.dom.tsx", "kv-man-keo"),
};
const GHI = "packages/db/src/viec-ghi.ts";
const LUAT = "packages/db/src/viec.ts";
const BANG_SV = "apps/api/src/viec/viec-bang.service.ts";
const THUOC = "_acceptance/kanban-viec/rang/do-nguong.mjs";
const HTML = "_acceptance/kanban-viec/evidence/kv-bang-1280.html";
const BANG_APP = "apps/app/components/viec/bang-cot-viec.tsx";

const CAP = [
	[
		"a bo cua so 7 ngay cot Xong",
		BANG_SV,
		"khepLuc: { gte: tuNgay }",
		"khepLuc: { not: null }",
		[[KV.bang, "kv: cot xong sai cua so"]],
	],
	[
		"b keo ghi nguon web",
		GHI,
		"\t\tawait doiTrangThai(tx, input);\n\t}\n\tawait ghiThuTu(",
		'\t\tawait doiTrangThai(tx, { ...input, nguon: "web" });\n\t}\n\tawait ghiThuTu(',
		[[KV.keo, "kv: vet keo sai"]],
	],
	[
		"c keo bo qua do thi trang thai",
		GHI,
		"\t\tawait doiTrangThai(tx, input);\n\t}\n\tawait ghiThuTu(",
		"\t\tawait tx.viec.update({ where: { id: input.viecId }, data: { trangThai: input.den } });\n\t}\n\tawait ghiThuTu(",
		[[KV.maTran, "kv: o "]],
	],
	[
		"d chuyenDuoc bo vai",
		LUAT,
		"return dichDuoc(v.trangThai, vaiCua(v, userId));",
		"return dichDuoc(v.trangThai, { giao: true, thucHien: true, theoDoi: false });",
		[[KV.maTran, "kv: chuyenDuoc lech"]],
	],
	[
		"e sap xep ghi vet",
		GHI,
		"\tawait ghiThuTu(tx, input.nguoiId, input.viecId, input.thuTu);\n}",
		'\tawait ghiThuTu(tx, input.nguoiId, input.viecId, input.thuTu);\n\tawait ghiVet(tx, dauVet(input), { loai: "theo-doi", truoc: null, sau: { id: input.nguoiId, ten: "kv" } });\n}',
		[[KV.thuTu, "kv: sap xep ghi vet"]],
	],
	[
		"f con khong chep gan",
		GHI,
		"gan: cha.gan.map((g) => {",
		"gan: cha.gan.slice(0, 0).map((g) => {",
		[[KV.con, "kv: con khong mang gan cha"]],
	],
	[
		"g bo vet them viec con",
		GHI,
		'loai: "them-viec-con",\n\t\t\ttruoc: null,',
		'loai: "theo-doi",\n\t\t\ttruoc: null,',
		[[KV.con, "kv: thieu vet them con"]],
	],
	[
		"h bo kiem mot tang",
		GHI,
		"if (cha.chaId !== null) {",
		"if (false) {",
		[[KV.conQuyen, "kv: con quyen"]],
	],
	[
		"i bo theo doi nguoi cua cha",
		GHI,
		"nguoiTheoDoiIds: [...new Set(theoDoi)],",
		"nguoiTheoDoiIds: [],",
		[[KV.conQuyen, "kv: nguoi giao cha khong thay con rieng"]],
	],
	[
		"j thuoc dem menu vao keo",
		THUOC,
		"count(*) FILTER (WHERE e.nguon = 'bang-keo')::int AS keo",
		"count(*) FILTER (WHERE e.nguon IN ('bang-keo', 'bang-menu'))::int AS keo",
		[[KV.thuoc, "kv: thuoc lech"]],
	],
	[
		"k mau cung trong html",
		HTML,
		"<body",
		'<body><div style="color:#eee">kv</div><i',
		[[KV.san, "kv san:"]],
	],
	[
		"l thuoc khong cong du lan menu",
		THUOC,
		"tiLeBang: tiLe(keo + menu, tong),",
		"tiLeBang: tiLe(keo + Math.min(menu, 1), tong),",
		[[KV.thuoc, "kv: thuoc lan menu sai"]],
	],
	[
		"m bang bo canDrop",
		BANG_APP,
		"canDrop={(id, c) => {",
		"data-khong-dung={(id, c) => {",
		[[KV.manKeo, "kv: canDrop khong noi"]],
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
				(d.startsWith("error:") || d.startsWith("kv san:")) && d.includes(ghim),
		);

const chiCap = new Set(
	(process.env.CHI_CAP ?? "").split(",").filter((x) => x !== ""),
);
const capChay = CAP.filter(([ten]) => chiCap.size === 0 || chiCap.has(ten[0]));

let banSao = null;
const xanh = new Map();
let daChay = 0;
const hong = [];
try {
	banSao = dungBanSao("kv");
	for (const [nhom, ten] of [
		["apps", "api"],
		["apps", "app"],
		["packages", "validation"],
		["packages", "ui"],
	]) {
		goiCuaBanSao(banSao, nhom, ten);
	}
	for (const [ten, tep, cu, moi, kiem] of capChay) {
		daChay += 1;
		for (const [cmd] of kiem) {
			if (!xanh.has(cmd)) xanh.set(cmd, lenh(banSao, cmd));
		}
		const traLai = thayMotLan(banSao, tep, cu, moi);
		const sau = [];
		try {
			for (const [cmd, ghim] of kiem)
				sau.push({ cmd, ghim, ...lenh(banSao, cmd) });
		} finally {
			traLai();
		}
		for (const s of sau) {
			const truoc = xanh.get(s.cmd);
			if (truoc.ma !== 0) {
				console.log(`kv dot bien: ban sach do ${ten}`);
				hong.push({ ten, truoc: truoc.ra.slice(-1500), sau: "" });
				continue;
			}
			const dung = s.ma !== 0 && coGhim(s.ra, s.ghim);
			console.log(
				`${ten} xanh=${truoc.ma} do=${s.ma} ghim=${coGhim(s.ra, s.ghim) ? "ok" : "thieu"} «${s.ghim}»`,
			);
			if (!dung) {
				console.log(`kv dot bien: cap ${ten} khong do`);
				hong.push({ ten, truoc: "", sau: s.ra.slice(-1500) });
			}
		}
	}
} catch (loi) {
	if (banSao !== null) goBanSao(banSao);
	console.log(`KHONG DO DUOC: ${loi.message}`);
	process.exit(loi instanceof KhongDo ? 2 : 1);
}
if (banSao !== null) goBanSao(banSao);
for (const h of hong)
	console.error(`${h.ten}\n--- truoc\n${h.truoc}\n--- sau\n${h.sau}`);
if (chiCap.size === 0 && daChay !== SO_CAP_KHAI) {
	console.log(`kv dot bien: thieu cap ${daChay}`);
	process.exit(1);
}
const banSachDo = hong.some((h) => h.truoc !== "");
console.log(
	`dot-bien: ${daChay - new Set(hong.map((h) => h.ten)).size}/${daChay} cap dat`,
);
process.exit(hong.length === 0 ? 0 : banSachDo ? 2 : 1);
