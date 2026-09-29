import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	batTacTu,
	chayTrongPhienCoTacTu,
	idMau,
	napBoMau,
	PHIEN_TRO_LY,
	phienCookie,
	thuMau,
	trongPhienCoTacTu,
	trpc,
	truyVan,
} from "../../../../_acceptance/tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";

const THU_MUC = join(
	import.meta.dir,
	"..",
	"..",
	"..",
	"..",
	".acceptance-runs",
	"lai-thu-the-gop-y",
);
const TEP_PHIEN = join(THU_MUC, "phien.json");
const TEP_DUNG = join(THU_MUC, "dung");
const GIU_TOI_DA_MS = 4 * 60 * 60 * 1000;
const NHIP_MS = 2000;

if (!trongPhienCoTacTu()) {
	process.exit(await chayTrongPhienCoTacTu(`bun ${import.meta.path}`));
}

mkdirSync(THU_MUC, { recursive: true });
const nap = napBoMau();
if (nap.ma !== 0) {
	console.error(`okr:mau thoat ${nap.ma}: ${nap.dong}`);
	process.exit(2);
}
console.log(`NAP okr:mau --moc ${nap.moc}: ${nap.dong}`);
const API = process.env.API_URL;
const qt = phienCookie(thuMau("le-hai-dang"));
const tl = phienCookie(thuMau("nguyen-thi-lan"));
const MT = idMau("mt", "q4-kd-bac-1");
await trpc(API, qt).lam("okr.setProgram", {
	aiOn: true,
	aiDeXuatPhamVi: "danh-sach",
	aiDeXuatDonVi: [idMau("pb", "kd-bac")],
});
await trpc(API, tl).lam("okr.updateObjective", {
	id: MT,
	title: "Doanh thu quý 4 miền Bắc",
});
await trpc(API, tl).lam("okr.createKeyResult", {
	objectiveId: MT,
	title: "Gọi điện cho đối tác mới mỗi tuần",
	kind: "tang-toi",
	startValue: 0,
	targetValue: 200,
	currentValue: 0,
	unit: "cuộc",
	dueOn: null,
	weight: 1,
	ownerUserId: idMau("nguoi", "nguyen-thi-lan"),
});

const url = process.env.DATABASE_URL;
const [lh] = await truyVan(
	url,
	`SELECT id FROM "contact" ORDER BY "createdAt" LIMIT 1`,
);
const lienHe = lh?.id ?? null;
if (lienHe) {
	await truyVan(
		url,
		`INSERT INTO "contactFact" (id, "contactId", field, value, score, band, evidence, method, "sourceUrl", status, "observedAt")
		 VALUES ('fact-lai-tay-1', $1, 'title', 'Giám đốc kinh doanh miền Bắc', 0.62, 'POSSIBLE', $2::jsonb, 'agent', NULL, 'PROPOSED', now())
		 ON CONFLICT (id) DO NOTHING`,
		[
			lienHe,
			JSON.stringify([
				{ kind: "profile", detail: "Hồ sơ LinkedIn ghi chức danh này" },
				{ kind: "email", detail: "Chữ ký email tháng 9" },
			]),
		],
	);
}

const tacTu = await batTacTu({
	cong: Number(process.env[PHIEN_TRO_LY.bienCongTacTu]),
	thuMuc: THU_MUC,
});
writeFileSync(
	TEP_PHIEN,
	JSON.stringify(
		{
			app: process.env.APP_URL,
			api: process.env.API_URL,
			tacTu: tacTu.url,
			mucTieu: MT,
			phong: idMau("pb", "kd-bac"),
			chuKy: idMau("chu-ky", "quy4"),
			lienHe,
			quanTri: { email: thuMau("le-hai-dang"), ...qt },
			truongPhong: { email: thuMau("nguyen-thi-lan"), ...tl },
		},
		null,
		1,
	),
);
console.log(
	`SAN SANG app ${process.env.APP_URL} · api ${process.env.API_URL} · lien he ${lienHe}`,
);
const han = Date.now() + GIU_TOI_DA_MS;
while (!existsSync(TEP_DUNG) && Date.now() < han) {
	await new Promise((r) => setTimeout(r, NHIP_MS));
}
await tacTu.dung();
console.log("DUNG phien lai tay");
process.exit(0);
