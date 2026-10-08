import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	chuanBi,
	ghi,
	guiTin,
	ket,
	khongDo,
	mo,
	moCuoc,
	moPhien,
	trang,
} from "../../soan-okr-trang-rieng/rang/man-chung.mjs";
import { batCham, doLan, doVuot, KHO, KHO_CHAM } from "./do-lan.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const RA = join(
	HERE,
	"..",
	"..",
	"..",
	".acceptance-runs",
	"khung-chat-cuon-duoc",
	"tai-hien",
);
const KHUNG = "[data-slot=kara-transcript]";
const TIN_TOI_DA = 10;

await moPhien(
	'bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/khung-chat-cuon-duoc/rang/tai-hien-soan.mjs"',
);
await chuanBi("kcs");
mkdirSync(RA, { recursive: true });
const ketQua = [];
try {
	for (const [nhan, kho] of [...Object.entries(KHO), ["390-cham", KHO_CHAM]]) {
		const cuoc = await moCuoc();
		const t = await trang(kho);
		if (kho.cham) await batCham(t.p);
		try {
			if (!(await mo(t, cuoc.id)))
				await khongDo(`khong mo duoc cuoc soan ${cuoc.id} o ${nhan}`);
			let tran = 0;
			for (let i = 0; i < TIN_TOI_DA; i += 1) {
				tran = await t.p.evaluate((chon) => {
					const k = [...document.querySelectorAll(chon)].find((x) =>
						x.checkVisibility(),
					);
					if (!k) return -1;
					return Math.max(
						0,
						...[k, ...k.querySelectorAll("*")].map(
							(e) => e.scrollHeight - e.clientHeight,
						),
					);
				}, KHUNG);
				if (tran > 600) break;
				if (
					!(await guiTin(
						t,
						`Câu hỏi thử cuộn số ${i}: cho xem lại toàn bộ bản nháp và giải thích từng KR.`,
					))
				)
					ghi(`-- tin ${i} o ${nhan} khong co tra loi`);
			}
			const lan = kho.cham ? await doVuot(t.p, KHUNG) : await doLan(t.p, KHUNG);
			const anh = join(RA, `soan-${nhan}.png`);
			await t.p.screenshot({ path: anh });
			ketQua.push({
				mat: "soan",
				kho: nhan,
				tranTruocDo: tran,
				...lan,
				anh,
				loiConsole: t.loi.slice(0, 5),
			});
		} finally {
			await t.dong();
		}
	}
} catch (loi) {
	await khongDo(`tai hien soan: ${loi?.stack ?? loi}`);
}
writeFileSync(
	join(RA, "ket-qua-soan.json"),
	`${JSON.stringify(ketQua, null, 2)}\n`,
);
for (const k of ketQua) {
	if (k.loi) {
		ghi(`${k.mat} ${k.kho}: ${k.loi}`);
		continue;
	}
	ghi(
		`${k.mat} ${k.kho}: cao=${k.caoKhung} hien=${k.hienCao} tran=${k.tranNhat} cuonTrong=${k.soCuonTrong} cuonTren=${k.soCuonTren} len=${k.lenDuoc} xuong=${k.xuongDuoc} dau=${k.dau} sauLen=${k.sauLen}`,
	);
	if (k.chuoi) ghi(`   chuoi: ${k.chuoi.slice(0, 8).join(" < ")}`);
}
await ket(0);
