import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { TRO_LY_OKR } from "../../../apps/agent/agent/lib/okr/config.ts";
import { nopDeXuatVao } from "../../../apps/agent/agent/lib/okr/nop-de-xuat.ts";
import { noteSession } from "../../../apps/agent/agent/lib/tasks.ts";
import { OKR_MAU } from "../../../apps/api/scripts/okr-mau/cau-hinh.ts";
import { okrSoanBoMessages } from "../../../apps/app/lib/messages/okr-soan-bo.ts";
import { SEARCH_PARAM } from "../../../apps/app/lib/search-param-keys.ts";
import { VIEC_OKR } from "../../../packages/db/src/agent-tasks.ts";
import { db } from "../../../packages/db/src/index.ts";
import { xepViecTroLy } from "../../../packages/db/src/okr-tro-ly.ts";
import { ghiDuocOPha } from "../../../packages/validation/src/okr-chu-ky.ts";
import {
	khongDo,
	suySlug,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import {
	GOC,
	phienCua,
	trpcCua,
} from "../../vo-khu-muc-tieu/rang/do-man-lib.mjs";

const HO_SO = "che-do-soan-bo-okr";
const GIAY_MS = 1000;
const DA_THONG_CONG = new Set(["signed-off", "machine-cleared"]);
const trangThaiHopDong = (
	readFileSync(join(GOC, "_acceptance", HO_SO, "contract.md"), "utf8").match(
		/^status:\s*(\S+)/m,
	)?.[1] ?? ""
).trim();

export const BANG_CHUNG =
	process.env.BANG_CHUNG ??
	(DA_THONG_CONG.has(trangThaiHopDong)
		? join(GOC, ".acceptance-runs", HO_SO, "evidence")
		: join(GOC, "_acceptance", HO_SO, "evidence"));
export const THU_MUC_HTML = join(GOC, ".acceptance-runs", HO_SO, "html");

export const DO = {
	kho: {
		rong: { ten: "1280", rong: 1280, cao: 800 },
		hep: { ten: "375", rong: 375, cao: 812 },
	},
	cho: {
		taiMs: 180 * GIAY_MS,
		khungMs: 120 * GIAY_MS,
		luuMs: 90 * GIAY_MS,
		apiMs: 20 * GIAY_MS,
		onDinhMs: 1500,
		nhipMs: 250,
		cuonMs: 300,
		phimMs: 60,
	},
	cuon: { soLan: 12, lePx: 40 },
	lechPx: 1,
	bamToiDa: 3,
	anh: [
		"soan-1280-sang",
		"soan-1280-toi",
		"soan-375-sang",
		"soan-375-toi",
		"the-chat-luong-375-sang",
		"trong-1280-sang",
		"hoi-cong-bo-1280-sang",
		"hoi-cong-bo-1280-toi",
		"ngan-1280-sang",
		"ngan-1280-toi",
	],
	html: ["gop-y", "trong", "hoi-cong-bo", "chi-xem"],
};

export const MOI_EVAL = ["E2", "E4", "E9", "E11", "E13", "E16", "E20"];
export const AN_CONG_CU_DEV =
	".tsqd-parent-container, .tsqd-open-btn-container, nextjs-portal { display: none !important; }";
export const THAM = {
	ky: SEARCH_PARAM.okr.ky,
	don: SEARCH_PARAM.okr.don,
	record: SEARCH_PARAM.record.stack,
};
export const CHU = okrSoanBoMessages("vi");
export const KARA_GIA = {
	OKR_AGENT_BRIDGE_SECRET: "gia-do-che-do-soan-bo-okr",
	OKR_AGENT_URL: "http://127.0.0.1:9",
	AGENT_BRIDGE_SECRET: "gia-do-che-do-soan-bo-okr",
	AGENT_URL: "http://127.0.0.1:9",
};

const PHONG = {
	mo: "kho-van",
	viet: "tai-chinh",
	bam: "nhan-su",
	gopY: "kd-bac",
	sua: "marketing",
	trong: "kd-nam",
};

const BAT_KARA = {
	aiOn: true,
	aiDeXuatPhamVi: "toan-cong-ty",
	aiDeXuatDonVi: [],
	aiDeXuatAnPhamVi: "tat",
	aiDeXuatAnDonVi: [],
	aiSoanPhamVi: "toan-cong-ty",
	aiSoanDonVi: [],
	aiSoanAnPhamVi: "tat",
	aiSoanAnDonVi: [],
};

const MUC_TIEU_MO = [
	{
		ten: "Kho lạnh Bắc Ninh sẵn sàng mùa cao điểm",
		congBo: false,
		kr: [
			{
				ten: "Công suất kho lạnh đạt 1.200 pallet",
				kieu: "tang-toi",
				khoi: 800,
				dich: 1200,
				donVi: "pallet",
			},
			{
				ten: "Tỷ lệ hàng hư hỏng giảm còn 1%",
				kieu: "giam-xuong",
				khoi: 3,
				dich: 1,
				donVi: "%",
			},
		],
	},
	{
		ten: "Đơn xuất kho đúng giờ cho mọi tuyến",
		congBo: true,
		kr: [
			{
				ten: "Đơn xuất đúng giờ đạt 98%",
				kieu: "tang-toi",
				khoi: 90,
				dich: 98,
				donVi: "%",
			},
		],
	},
];

const GOP_Y = {
	sau: "Ký mới 15 hợp đồng bán lẻ",
	lyDo: "Đặt động từ lên đầu để đội đọc một lần là biết việc cần ra kết quả gì.",
};
const TIEN_TO_PHIEN = "che-do-soan-bo-okr-gieo-";

export const nghi = (ms) => new Promise((xong) => setTimeout(xong, ms));
const thuMau = (ma) => `${ma}@${OKR_MAU.mienThu}`;
export const LOC_TRONG = {
	phuTrach: [],
	loai: [],
	trangThai: [],
	tuTin: [],
	gopY: [],
};

function napBoMau() {
	const nap = spawnSync("bun", ["scripts/okr-mau.ts"], {
		cwd: join(GOC, "apps", "api"),
		env: process.env,
		encoding: "utf8",
	});
	const cuoi = `${nap.stdout ?? ""}${nap.stderr ?? ""}`
		.trim()
		.split("\n")
		.at(-1);
	console.log(`nap bo OKR mau: ma ${nap.status} — ${cuoi?.slice(0, 160)}`);
	return nap.status === 0;
}

function congTyMau() {
	return JSON.parse(
		readFileSync(join(GOC, "apps/api/scripts/okr-mau/cong-ty.json"), "utf8"),
	);
}

export const mucTieuCuaBo = (ds, pbId) =>
	ds.rows.filter(
		(r) => r.level === "phong-ban" && r.unitId === pbId && r.status !== "da-bo",
	);

export const docBo = (api, cycleId, pbId) =>
	api
		.hoi("okr.danhSach", {
			cycleId,
			unit: { loai: "pb", id: pbId },
			loc: LOC_TRONG,
		})
		.then((ds) => mucTieuCuaBo(ds, pbId));

function nopCon(phienGoc) {
	return {
		agent: { name: "tro_ly_okr" },
		channel: {
			kind: "subagent",
			continuationToken: `subagent:${phienGoc}:goi-tro-ly`,
		},
		session: {
			id: `${phienGoc}-con`,
			parent: { sessionId: phienGoc, rootSessionId: phienGoc },
		},
	};
}

async function nop(objectiveId, nguoiYeuCau, dong) {
	const xep = await xepViecTroLy(db, {
		viec: "de-xuat",
		objectiveId,
		keyResultId: null,
		nguoiYeuCau,
		nac: "bat",
	});
	if (!xep.bat) throw new Error(`xep viec ${objectiveId}: ${xep.lyDo}`);
	if (xep.dungLai) throw new Error(`xep viec ${objectiveId} dung lai viec cu`);
	await db.agentTask.update({
		where: { id: xep.taskId },
		data: {
			attempts: { increment: 1 },
			startedAt: new Date(),
			leasedUntil: new Date(Date.now() + VIEC_OKR.leaseMs),
		},
	});
	const phienGoc = `${TIEN_TO_PHIEN}${xep.taskId}`;
	await noteSession(xep.taskId, phienGoc);
	const kq = await nopDeXuatVao({ dong }, nopCon(phienGoc));
	if (kq.ketQua !== "da-ghi")
		throw new Error(`nop ${objectiveId}: ${kq.ketQua} — ${kq.lyDo}`);
	const viec = await db.agentTask.findUniqueOrThrow({
		where: { id: xep.taskId },
		select: { finishedAt: true, outcome: true },
	});
	if (viec.finishedAt === null || viec.outcome !== TRO_LY_OKR.ketThuc.daNop)
		throw new Error(
			`viec ${xep.taskId} khong dong bang ${TRO_LY_OKR.ketThuc.daNop} (${viec.outcome})`,
		);
	const hang = await db.okrDeXuat.findMany({
		where: { taskId: xep.taskId },
		select: { id: true, trangThai: true, maLoai: true },
	});
	const loai = hang.filter((h) => h.trangThai !== "cho");
	if (loai.length > 0 || hang.length !== dong.length)
		throw new Error(
			`nop ${objectiveId}: ${hang.length}/${dong.length} dong, bi loai ${loai.map((h) => h.maLoai).join(", ")}`,
		);
	return hang.map((h) => h.id);
}

async function gieoGopY(n) {
	await n.api.quanTri.lam("okr.setProgram", BAT_KARA);
	const bo = await docBo(n.api.gopY, n.ky.cur, n.pb.gopY.id);
	const mt = bo.at(-1);
	const kr = mt?.keyResults[0];
	if (!mt || bo.length < 2 || !kr)
		await khongDo(
			`KHONG DO DUOC: bo ${n.pb.gopY.name} o ${n.ky.cur} can >= 2 muc tieu co KR (co ${bo.length})`,
		);
	const rong = {
		keyResultId: null,
		truong: null,
		truoc: null,
		sau: null,
		maVanDe: null,
		targetObjectiveId: null,
		targetKeyResultId: null,
	};
	const [deXuatId] = await nop(mt.id, n.nguoi.gopY, [
		{
			...rong,
			loai: "viet-lai",
			objectiveId: mt.id,
			keyResultId: kr.id,
			truong: "kr.title",
			truoc: kr.title,
			sau: GOP_Y.sau,
			lyDo: GOP_Y.lyDo,
		},
	]);
	return {
		mt: mt.id,
		tenMt: mt.title,
		kr: kr.id,
		cu: kr.title,
		moi: GOP_Y.sau,
		deXuatId,
	};
}

async function gieoBoMo(n) {
	const api = n.api.mo;
	const truoc = await docBo(api, n.ky.keHoach, n.pb.mo.id);
	if (truoc.length > 0)
		await khongDo(
			`KHONG DO DUOC: bo ${n.pb.mo.name} o ${n.ky.keHoach} da co ${truoc.length} muc tieu truoc khi gieo`,
		);
	for (const m of MUC_TIEU_MO) {
		const mt = await api.lam("okr.createObjective", {
			cycleId: n.ky.keHoach,
			unit: { level: "phong-ban", departmentId: n.pb.mo.id },
			title: m.ten,
			kind: "cam-ket",
			ownerUserId: n.nguoi.mo,
			participantIds: [],
			whyNow: "",
			hienThi: "cong-khai",
		});
		for (const k of m.kr)
			await api.lam("okr.createKeyResult", {
				objectiveId: mt.id,
				title: k.ten,
				kind: k.kieu,
				ownerUserId: n.nguoi.mo,
				startValue: k.khoi,
				targetValue: k.dich,
				currentValue: k.khoi,
				unit: k.donVi,
				dueOn: null,
				weight: 1,
			});
		if (m.congBo) await api.lam("okr.publishObjective", { id: mt.id });
	}
}

function chonKy(chuKy) {
	const cur = chuKy.cycles.find((c) => c.id === chuKy.currentId);
	const keHoach = chuKy.cycles.find(
		(c) => c.id !== chuKy.currentId && ghiDuocOPha(c.phase),
	);
	const daDong = chuKy.cycles.find((c) => !ghiDuocOPha(c.phase));
	return { cur, keHoach, daDong };
}

function nguoiMau() {
	const congTy = congTyMau();
	const truong = Object.fromEntries(
		Object.entries(PHONG).map(([vai, ma]) => {
			const p = congTy.phongBan.find((x) => x.ma === ma);
			return [vai, p ? { ma: p.truong, ten: p.ten } : null];
		}),
	);
	const quanTri = congTy.nguoi.find((x) => x.vai === "admin")?.ma ?? null;
	return { truong, quanTri };
}

export async function dungDuLieu() {
	if (!napBoMau()) await khongDo("KHONG DO DUOC: nap bo OKR mau that bai");
	const mau = nguoiMau();
	const thieu = Object.entries(mau.truong).filter(([, v]) => v === null);
	if (thieu.length > 0 || !mau.quanTri)
		await khongDo(
			`KHONG DO DUOC: bo mau thieu phong ban ${thieu.map(([k]) => PHONG[k]).join(", ")} hay quan tri`,
		);
	const vai = Object.keys(PHONG);
	const ck = Object.fromEntries([
		...vai.map((v) => [v, phienCua(thuMau(mau.truong[v].ma))]),
		["quanTri", phienCua(thuMau(mau.quanTri))],
	]);
	const api = Object.fromEntries(
		Object.entries(ck).map(([v, c]) => [v, trpcCua(c)]),
	);
	const [chuKy, cay, slug] = await Promise.all([
		api.mo.hoi("okr.cycles"),
		api.mo.hoi("org.tree"),
		suySlug(ck.mo),
	]);
	const ky = chonKy(chuKy);
	if (!ky.cur || !ky.keHoach || !ky.daDong)
		await khongDo(
			`KHONG DO DUOC: bo mau thieu chu ky (hien tai ${ky.cur?.id}, ke hoach ${ky.keHoach?.id}, da dong ${ky.daDong?.id})`,
		);
	const moiPb = [
		...cay.divisions.flatMap((b) => b.departments),
		...cay.chuaXep,
	];
	const pb = Object.fromEntries(
		vai.map((v) => [v, moiPb.find((p) => p.name === mau.truong[v].ten)]),
	);
	const lech = vai.filter((v) => !pb[v]?.head?.id);
	if (lech.length > 0)
		await khongDo(
			`KHONG DO DUOC: cay thieu phong ban hay truong cho ${lech.join(", ")}`,
		);
	const nguoi = Object.fromEntries(vai.map((v) => [v, pb[v].head.id]));
	const n = {
		ck,
		api,
		slug,
		ky: { cur: ky.cur.id, keHoach: ky.keHoach.id, daDong: ky.daDong.id },
		tenKy: Object.fromEntries(chuKy.cycles.map((c) => [c.id, c.name])),
		pb,
		nguoi,
	};
	for (const v of ["viet", "bam", "trong"]) {
		const co = await docBo(api[v], n.ky.keHoach, pb[v].id);
		if (co.length > 0)
			await khongDo(
				`KHONG DO DUOC: bo ${pb[v].name} o ${n.ky.keHoach} khong trong (${co.length})`,
			);
	}
	await gieoBoMo(n);
	n.gopY = await gieoGopY(n);
	console.log(
		`du lieu: ky hien tai ${n.ky.cur} · ky ke hoach ${n.ky.keHoach} · ky da dong ${n.ky.daDong} · mo ${pb.mo.name} · viet ${pb.viet.name} · bam ${pb.bam.name} · gop y ${pb.gopY.name} (KR ${n.gopY.kr}) · sua ${pb.sua.name} · trong ${pb.trong.name}`,
	);
	return n;
}

export const duongBo = (n, pbId, ky) =>
	`/${n.slug}/okr/bo-okr?${THAM.don}=pb:${pbId}&${THAM.ky}=${ky}`;
export const khoaRecord = (ky, pbId) => `soan-bo:${ky}~pb:${pbId}`;
export const duongSoan = (n, pbId, ky) =>
	`${duongBo(n, pbId, ky)}&${THAM.record}=${encodeURIComponent(khoaRecord(ky, pbId))}`;
