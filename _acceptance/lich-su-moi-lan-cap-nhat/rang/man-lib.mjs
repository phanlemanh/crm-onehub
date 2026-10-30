import { readFileSync } from "node:fs";
import { join } from "node:path";
import { idMau, OKR_MAU } from "../../../apps/api/scripts/okr-mau/cau-hinh.ts";
import { SEARCH_PARAM } from "../../../apps/app/lib/search-param-keys.ts";
import { db } from "../../../packages/db/src/index.ts";
import { napCa } from "../../hop-tuan-tren-bang/rang/man-lib.mjs";
import {
	khongDo,
	suySlug,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import {
	GOC,
	phienCua,
	trpcCua,
} from "../../vo-khu-muc-tieu/rang/do-man-lib.mjs";

const HO_SO = "lich-su-moi-lan-cap-nhat";
const GIAY_MS = 1000;

export const LSML = {
	kho: [
		{ ten: "1440", rong: 1440, cao: 900 },
		{ ten: "375", rong: 375, cao: 812 },
	],
	theme: [
		{ ten: "sang", toi: false },
		{ ten: "toi", toi: true },
	],
	cho: {
		lanMs: 45 * GIAY_MS,
		sqlMs: 30 * GIAY_MS,
		nhipMs: 250,
		dungYenMs: 250,
		dungYenToiDa: 40,
	},
	soLanGui: 2,
	soAnh: 8,
	maP: "cham-soc",
	kieu: "tang-toi",
	nguon: "tay",
	lanToiThieu: 2,
	tuTinMacDinh: "vua",
};

export const CHON = {
	muc: "[data-muc-ngan='lich-su']",
	dong: "[data-muc-ngan='lich-su'] [data-lan-cap-nhat]",
	cham: "[data-muc-ngan='lich-su'] .recharts-line-dots circle",
	nutCapNhat: (kr) =>
		`[data-kr-sheet='${kr}'] [data-nut='mo-khoi-cap-nhat-kr']`,
	khoi: (kr) => `[data-kr-sheet='${kr}'] [data-khoi-cap-nhat-kr]`,
	hop: (kr) => `[data-kr-sheet='${kr}'] [data-khoi-cap-nhat-kr='mo']`,
	ngan: "[data-slot='sheet-content'], [data-slot='drawer-content']",
};

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

const dem = { dung: 0, sai: 0 };
export const ketQua = () => ({ ...dem });
export function dong(ac, dat, ten, chu) {
	if (dat) dem.dung += 1;
	else dem.sai += 1;
	console.log(dat ? `DUNG ${ten}: ${chu}` : `SAI ${ac}: ${ten} ${chu}`);
}

export async function soLanSql(krId) {
	const [r] = await db.$queryRaw`
		SELECT COUNT(*)::int AS n FROM "okrCheckIn" WHERE "keyResultId" = ${krId}`;
	return r.n;
}

export async function moiNhatSql(krId) {
	return db.$queryRaw`
		SELECT id, value::float8 AS "giaTri", confidence AS "tuTin"
		FROM "okrCheckIn"
		WHERE "keyResultId" = ${krId}
		ORDER BY "createdAt" DESC, id DESC
		LIMIT 2`;
}

export async function choSqlDat(krId, can) {
	const het = Date.now() + LSML.cho.sqlMs;
	let n = await soLanSql(krId);
	while (n < can && Date.now() < het) {
		await new Promise((xong) => setTimeout(xong, LSML.cho.nhipMs));
		n = await soLanSql(krId);
	}
	return n;
}

async function chonKr(cycleId, pbUuTien) {
	const ds = await db.okrKeyResult.findMany({
		where: {
			kind: LSML.kieu,
			source: LSML.nguon,
			objective: {
				cycleId,
				departmentId: { startsWith: OKR_MAU.tienTo },
				level: "phong-ban",
				status: "cong-bo",
			},
			owner: { email: { endsWith: `@${OKR_MAU.mienThu}` } },
		},
		orderBy: [{ objective: { position: "asc" } }, { position: "asc" }],
		select: {
			id: true,
			title: true,
			kind: true,
			unit: true,
			startValue: true,
			targetValue: true,
			objectiveId: true,
			objective: { select: { departmentId: true } },
			owner: { select: { email: true } },
			_count: { select: { checkIns: true } },
		},
	});
	const du = ds.filter((k) => k._count.checkIns >= LSML.lanToiThieu);
	const theoPb = du.find((k) => k.objective.departmentId === pbUuTien);
	return theoPb ?? du[0] ?? null;
}

function truongCua(maPb) {
	const congTy = JSON.parse(
		readFileSync(join(GOC, "apps/api/scripts/okr-mau/cong-ty.json"), "utf8"),
	);
	const pb = congTy.phongBan.find((p) => p.ma === maPb);
	return pb ? `${pb.truong}@${OKR_MAU.mienThu}` : null;
}

export async function dungDuLieu() {
	const ca = napCa();
	if (!ca)
		await khongDo("KHONG DO DUOC: nap bo OKR mau (okr:mau --ca hop-tuan) hong");
	const truong = truongCua(LSML.maP);
	if (!truong)
		await khongDo(`KHONG DO DUOC: bo mau khong co phong ban ${LSML.maP}`);
	const apiTruong = trpcCua(phienCua(truong));
	const chuKy = await apiTruong.hoi("okr.cycles");
	const cur = chuKy.currentId;
	if (!cur) await khongDo("KHONG DO DUOC: bo mau khong co chu ky hien tai");
	const kr = await chonKr(cur, idMau("pb", LSML.maP));
	if (!kr)
		await khongDo(
			`KHONG DO DUOC: bo mau khong co KR ${LSML.kieu} nhap tay cua phong ban nao co >= ${LSML.lanToiThieu} lan cap nhat trong ky ${cur}`,
		);
	const pbId = kr.objective.departmentId;
	const email = kr.owner.email;
	const ck = phienCua(email);
	const slug = await suySlug(ck);
	const q = new URLSearchParams({
		[SEARCH_PARAM.okr.ky]: cur,
		[SEARCH_PARAM.okr.don]: `pb:${pbId}`,
		[SEARCH_PARAM.record.stack]: `kr:${kr.id}`,
	});
	console.log(
		`du lieu: KR ${kr.id} «${kr.title}» (${kr.kind}, don vi «${kr.unit}») · ${kr._count.checkIns} lan · nguoi phu trach ${email} · ky ${cur} · phong ban ${pbId}`,
	);
	return {
		kr,
		email,
		ck,
		slug,
		cur,
		pbId,
		duong: `/${slug}/okr/bo-okr?${q}`,
	};
}

export const DOC_MUC = (chon) => {
	const hien = (el) => el.checkVisibility();
	const muc = [...document.querySelectorAll(chon.muc)].filter(hien);
	const goc = muc[0] ?? null;
	const dongs = goc
		? [...goc.querySelectorAll("[data-lan-cap-nhat]")].filter(hien)
		: [];
	const cham = goc
		? goc.querySelectorAll(".recharts-line-dots circle").length
		: 0;
	return {
		muc: muc.length,
		dong: dongs.length,
		cham,
		dau: dongs.slice(0, 2).map((d) => ({
			id: d.getAttribute("data-lan-cap-nhat"),
			giaTri:
				d
					.querySelector("[data-gia-tri-lan]")
					?.textContent.replace(/\s+/g, " ")
					.trim() ?? null,
		})),
		ids: dongs.map((d) => d.getAttribute("data-lan-cap-nhat")),
	};
};

export function coSo(chu, so) {
	if (chu === null) return false;
	const dang = so.toLocaleString("vi-VN").replace(/\./g, "\\.");
	return new RegExp(`(^|[^\\d.,])${dang}([^\\d.,]|$)`).test(chu);
}
