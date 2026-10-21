import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";
import { OKR_MAU } from "../../../apps/api/scripts/okr-mau/cau-hinh.ts";
import {
	kyMacDinhHoiY,
	kyTrongOChon,
} from "../../../apps/app/app/(app)/[slug]/okr/okr-search-params.ts";
import { db } from "../../../packages/db/src/index.ts";
import { WORKSPACE_ID } from "../../../packages/db/src/workspace.ts";
import {
	CHROME,
	datTrinhDuyet,
	khongDo,
	suySlug,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import { DO, GOC, phienCua, trangMoi, trpcCua } from "./do-man-lib.mjs";

const SO_NGUOI_THU_CAP_NHAT = 8;

export const DUONG_MUC = {
	"cua-toi": "/okr",
	"bo-okr": "/okr/bo-okr",
	"lay-y-kien": "/okr/lay-y-kien",
	"suc-khoe": "/okr/suc-khoe",
	"so-do": "/okr/so-do",
};

const thuMau = (ma) => `${ma}@${OKR_MAU.mienThu}`;
const idMau = (loai, ma) => `${OKR_MAU.tienTo}${loai}-${ma}`;

async function napBoMau() {
	const nap = spawnSync("bun", ["scripts/okr-mau.ts"], {
		cwd: join(GOC, "apps", "api"),
		env: process.env,
		encoding: "utf8",
	});
	const dong = `${nap.stdout ?? ""}${nap.stderr ?? ""}`
		.trim()
		.split("\n")
		.at(-1);
	console.log(`nap bo OKR mau: ma ${nap.status} — ${dong}`);
	if (nap.status !== 0)
		await khongDo(`KHONG DO DUOC: nap bo OKR mau thoat ${nap.status}: ${dong}`);
}

export async function datVaiOkr(email) {
	const nguoi = await db.user.findUniqueOrThrow({
		where: { email },
		select: { id: true },
	});
	await db.member.upsert({
		where: {
			organizationId_userId: { organizationId: WORKSPACE_ID, userId: nguoi.id },
		},
		create: {
			id: `member-${nguoi.id}`,
			organizationId: WORKSPACE_ID,
			userId: nguoi.id,
			role: "okr",
			createdAt: new Date(),
		},
		update: { role: "okr" },
	});
	await db.session.updateMany({
		where: { userId: nguoi.id },
		data: { activeOrganizationId: WORKSPACE_ID },
	});
}

async function chuKy(api) {
	const chuKyApi = await api.hoi("okr.cycles");
	const chuKyDb = await db.okrCycle.findMany({
		select: { id: true, name: true, phase: true },
	});
	const ky = {
		hienHanh: chuKyApi.currentId,
		keHoach: kyMacDinhHoiY(chuKyApi),
	};
	const khac = kyTrongOChon(chuKyApi.cycles)
		.filter((c) => c.id !== ky.hienHanh && c.id !== ky.keHoach)
		.sort((a, b) =>
			a.phase === "da-dong" ? -1 : b.phase === "da-dong" ? 1 : 0,
		)[0];
	const kyDu = { ...ky, khac: khac?.id ?? null };
	if (!kyDu.hienHanh || !kyDu.keHoach || !kyDu.khac)
		await khongDo(
			`KHONG DO DUOC: bo mau thieu chu ky (hien hanh ${kyDu.hienHanh}, ke hoach ${kyDu.keHoach}, khac ${kyDu.khac})`,
		);
	if (chuKyDb.find((c) => c.id === kyDu.keHoach)?.phase !== "lap-ke-hoach")
		await khongDo(
			`KHONG DO DUOC: chu ky mac dinh cua Lay y kien ${kyDu.keHoach} khong o pha lap-ke-hoach trong DB`,
		);
	return { ky: kyDu, chuKyDb };
}

async function donViVaMucTieu(maPb, kyHienHanh) {
	const donVi = await db.department.findUnique({
		where: { id: idMau("pb", maPb) },
		select: { id: true, name: true },
	});
	const mucTieu = donVi
		? await db.okrObjective.findFirst({
				where: {
					cycleId: kyHienHanh,
					departmentId: donVi.id,
					publishedAt: { not: null },
					status: { not: "da-bo" },
				},
				orderBy: { position: "asc" },
				select: { id: true, title: true },
			})
		: null;
	if (!donVi || !mucTieu)
		await khongDo(
			`KHONG DO DUOC: bo mau khong co don vi ${maPb} hay muc tieu cong bo cua no trong ${kyHienHanh}`,
		);
	return { donVi, mucTieu };
}

async function moCuocSoan(api, ky, donVi) {
	await api.quanTri.lam("okr.setProgram", {
		aiOn: true,
		aiSoanPhamVi: "danh-sach",
		aiSoanDonVi: [donVi.id],
	});
	const kq = await api.truong.lam("okr.soanMo", {
		cycleId: ky.keHoach,
		level: "phong-ban",
		divisionId: null,
		departmentId: donVi.id,
	});
	const cuoc = kq.ok ? kq.cuoc : kq.cuocDang;
	if (!cuoc)
		await khongDo(`KHONG DO DUOC: okr.soanMo tu choi mo cuoc soan: ${kq.lyDo}`);
	return cuoc;
}

async function nguoiCapNhat(kyHienHanh) {
	const kr = await db.okrKeyResult.findMany({
		where: {
			objective: { cycleId: kyHienHanh, publishedAt: { not: null } },
		},
		select: { owner: { select: { email: true } } },
		distinct: ["ownerUserId"],
		take: SO_NGUOI_THU_CAP_NHAT,
	});
	for (const { owner } of kr) {
		const ck = phienCua(owner.email);
		const cn = await trpcCua(ck).hoi("okr.capNhatTuan");
		if ((cn.items?.length ?? 0) > 0)
			return { email: owner.email, cookie: ck, capNhat: cn };
	}
	await khongDo(
		`KHONG DO DUOC: khong ai trong ${kr.length} chu KR cua ${kyHienHanh} co KR trong okr.capNhatTuan — ?tu=nhac khong mo duoc gi`,
	);
}

export async function khoMay(t) {
	await t.trang.setViewport({
		width: DO.kho.mayTinh.rong,
		height: DO.kho.mayTinh.cao,
	});
}

export async function taoNguCanh({ canSoan }) {
	await napBoMau();
	const congTy = JSON.parse(
		readFileSync(join(GOC, "apps/api/scripts/okr-mau/cong-ty.json"), "utf8"),
	);
	const maNguoi = {
		quanTri: congTy.hoiY.nguoiChon,
		truong: congTy.phongBan[0].truong,
	};
	const cookie = {
		quanTri: phienCua(thuMau(maNguoi.quanTri)),
		truong: phienCua(thuMau(maNguoi.truong)),
	};
	const slug = await suySlug(cookie.quanTri);
	const api = {
		quanTri: trpcCua(cookie.quanTri),
		truong: trpcCua(cookie.truong),
	};
	const { ky, chuKyDb } = await chuKy(api.quanTri);
	const tenKy = (id) => chuKyDb.find((c) => c.id === id)?.name ?? `?${id}`;
	const { donVi, mucTieu } = await donViVaMucTieu(
		congTy.phongBan[0].ma,
		ky.hienHanh,
	);
	const cuocSoan = canSoan ? await moCuocSoan(api, ky, donVi) : null;
	const capNhat = canSoan ? await nguoiCapNhat(ky.hienHanh) : null;
	console.log(
		`bo mau: hien hanh ${tenKy(ky.hienHanh)} · ke hoach ${tenKy(ky.keHoach)} · khac ${tenKy(ky.khac)} · don vi ${donVi.name} · muc tieu ${mucTieu.id}${capNhat ? ` · nguoi cap nhat ${capNhat.email}` : ""}${cuocSoan ? ` · cuoc soan ${cuocSoan.id}` : ""}`,
	);

	const trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});
	datTrinhDuyet(trinhDuyet);
	const may = {
		quanTri: await trangMoi(trinhDuyet, cookie.quanTri),
		truong: await trangMoi(trinhDuyet, cookie.truong),
		capNhat: capNhat ? await trangMoi(trinhDuyet, capNhat.cookie) : null,
	};
	for (const t of Object.values(may)) if (t) await khoMay(t);

	const boSlug = (duong) => duong.replace(new RegExp(`^/${slug}`), "");
	return {
		slug,
		w: (duong) => `/${slug}${duong}`,
		boSlug,
		mucSang: (tb) => tb.muc.filter((m) => m.sang).map((m) => boSlug(m.duong)),
		maNguoi,
		api,
		ky,
		chuKyDb,
		tenKy,
		donVi,
		mucTieu,
		cuocSoan,
		capNhat,
		trinhDuyet,
		may,
	};
}
