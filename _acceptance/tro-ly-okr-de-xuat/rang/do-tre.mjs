import { readFileSync } from "node:fs";
import { join } from "node:path";
import { TRO_LY_OKR_TRAN } from "../../../packages/db/src/okr-tro-ly-danh-muc.ts";
import {
	batTacTu,
	cauThieuKhoa,
	chanSoDu,
	chayTrongPhienCoTacTu,
	coKhoaMoHinh,
	docSql,
	GOC,
	idMau,
	napBoMau,
	PHIEN_TRO_LY,
	phienCookie,
	RA,
	thangVN,
	thuMau,
	tre,
	trongPhienCoTacTu,
	trpc,
	truyVan,
} from "./phien-tro-ly.mjs";

const GIAY_MS = 1000;
const PHUT_MS = 60 * GIAY_MS;

const E24 = {
	lanMacDinh: 20,
	nguong: { p50Ms: 8_000, p90Ms: 15_000 },
	hongMs: 30_000,
	choMoiLuotMs: 3 * PHUT_MS,
	nhipMs: 500,
	quanTri: "le-hai-dang",
	chuKy: "quy4",
	nac: "bat",
	lechChoPhepMs: 1,
	lenh: "bun _acceptance/tro-ly-okr-de-xuat/rang/do-tre.mjs",
	dauLoiTacTu: /MODEL_CALL_FAILED|insufficient_funds|budget exceeded|quota_for_entity_exceeded/,
	sql: join(GOC, "_acceptance/tro-ly-okr-de-xuat/rang/do-tre.sql"),
};

const lan = (() => {
	const i = process.argv.indexOf("--lan");
	if (i < 0) return E24.lanMacDinh;
	const so = Number(process.argv[i + 1]);
	if (!Number.isInteger(so) || so < 1) {
		console.log(
			`KHONG DO DUOC: --lan can mot so nguyen duong, nhan «${process.argv[i + 1] ?? ""}»`,
		);
		process.exit(2);
	}
	return so;
})();

function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	return 2;
}

function phanVi(so, p) {
	const xep = [...so].sort((a, b) => a - b);
	const vi = p * (xep.length - 1);
	const duoi = Math.floor(vi);
	const tren = Math.ceil(vi);
	return xep[duoi] + (xep[tren] - xep[duoi]) * (vi - duoi);
}

async function choXong(url, taskId) {
	const han = Date.now() + E24.choMoiLuotMs;
	while (Date.now() < han) {
		const [h] = await truyVan(
			url,
			`SELECT "finishedAt", outcome FROM "agentTask" WHERE id = $1`,
			[taskId],
		);
		if (h?.finishedAt) return h;
		await tre(E24.nhipMs);
	}
	return null;
}

async function chonMucTieu(url) {
	const ds = await truyVan(
		url,
		`SELECT o.id, o.title, coalesce(dh.email, vh.email) AS email
		 FROM "okrObjective" o
		 LEFT JOIN department d ON d.id = o."departmentId"
		 LEFT JOIN "user" dh ON dh.id = d."headUserId"
		 LEFT JOIN division v ON v.id = o."divisionId"
		 LEFT JOIN "user" vh ON vh.id = v."headUserId"
		 WHERE o."cycleId" = $1 AND o.status = 'cong-bo'
		 ORDER BY o.position, o.id`,
		[idMau("chu-ky", E24.chuKy)],
	);
	const coTruong = ds.filter((d) => d.email);
	const khac = [...new Map(coTruong.map((d) => [d.title, d])).values()];
	return khac.slice(0, lan);
}

function nguoiGoi(api) {
	const daCo = new Map();
	return (email) => {
		if (!daCo.has(email)) daCo.set(email, trpc(api, phienCookie(email)));
		return daCo.get(email);
	};
}

async function chayLuot(url, qt, mt, i) {
	const kq = await qt.lam("okr.troLyDeXuat", { objectiveId: mt.id });
	if (!kq.bat) return { i, mt, taskId: null, lyDo: kq.lyDo };
	if (kq.dungLai)
		throw new Error(`luot ${i + 1} dung lai viec cu ${kq.taskId}`);
	const xong = await choXong(url, kq.taskId);
	return {
		i,
		mt,
		taskId: kq.taskId,
		lyDo: xong ? null : `qua ${E24.choMoiLuotMs / GIAY_MS} s chua dong`,
	};
}

async function doTungLuot(url, luot) {
	const id = luot.map((l) => l.taskId).filter(Boolean);
	const hang = await truyVan(
		url,
		`SELECT t.id, t."createdAt", t."finishedAt", t.outcome,
			(SELECT min(d."createdAt") FROM "okrDeXuat" d WHERE d."taskId" = t.id) AS dau
		 FROM "agentTask" t WHERE t.id = ANY($1::text[])`,
		[id],
	);
	const theoId = new Map(hang.map((h) => [h.id, h]));
	return luot.map((l) => {
		const h = l.taskId ? theoId.get(l.taskId) : null;
		const hong =
			!h?.finishedAt || !`${h.outcome ?? ""}`.startsWith("da-nop") || l.lyDo;
		const that = h?.finishedAt
			? (h.dau ?? h.finishedAt).getTime() - h.createdAt.getTime()
			: null;
		return {
			...l,
			outcome: h?.outcome ?? null,
			createdAt: h?.createdAt ?? null,
			that,
			hong: Boolean(hong),
			ms: hong ? E24.hongMs : that,
		};
	});
}

async function trongPhien() {
	const url = process.env.DATABASE_URL;
	const api = process.env.API_URL;
	if (!api) return khongDo("thieu API_URL — phai chay trong phien do");
	const tacTu = await batTacTu({
		cong: Number(process.env[PHIEN_TRO_LY.bienCongTacTu]),
		thuMuc: join(RA, "do-tre"),
	});
	try {
		const nap = napBoMau();
		if (nap.ma !== 0)
			return khongDo(`okr:mau --moc ${nap.moc} thoat ${nap.ma}: ${nap.dong}`);
		console.log(`okr:mau --moc ${nap.moc}: ${nap.dong}`);
		const qt = trpc(api, phienCookie(thuMau(E24.quanTri)));
		await qt.lam("okr.setProgram", {
			aiOn: true,
			aiDeXuatPhamVi: "toan-cong-ty",
			aiDeXuatDonVi: [],
		});
		const mt = await chonMucTieu(url);
		if (mt.length < lan)
			return khongDo(
				`bo mau chi co ${mt.length} Muc tieu cong-bo ten khac nhau o ${E24.chuKy}, can ${lan}`,
			);
		const truong = nguoiGoi(api);
		const soLuot = new Map();
		for (const m of mt) soLuot.set(m.email, (soLuot.get(m.email) ?? 0) + 1);
		const vuot = [...soLuot].filter(
			([, n]) => n > TRO_LY_OKR_TRAN.troLyNgayMoiNguoi,
		);
		if (vuot.length > 0)
			return khongDo(
				`vuot tran ngay moi nguoi ${TRO_LY_OKR_TRAN.troLyNgayMoiNguoi}: ${vuot.map(([e, n]) => `${e} ${n}`).join(", ")}`,
			);
		const ss = await truong(mt[0].email).hoi("okr.troLySanSang", {
			objectiveId: mt[0].id,
		});
		if (!ss.bat) return khongDo(`troLySanSang tra ${ss.lyDo}`);

		const luot = [];
		for (const [i, m] of mt.entries()) {
			const l = await chayLuot(url, truong(m.email), m, i);
			console.log(
				`luot ${i + 1}/${lan}: ${m.id} ${l.taskId ?? "-"}${l.lyDo ? ` (${l.lyDo})` : ""}`,
			);
			luot.push(l);
		}

		const so = await doTungLuot(url, luot);
		for (const l of so) {
			console.log(
				`${l.i + 1}. ${l.ms} ms${l.hong ? ` — hong (${l.lyDo ?? l.outcome ?? "khong dong"}), tinh ${E24.hongMs}` : ""} · ${l.mt.id}`,
			);
		}
		const dau = so.find((l) => l.createdAt)?.createdAt ?? new Date();
		const thang = thangVN(dau);
		const bang = await docSql(url, E24.sql, thang);
		const hangBat = bang.find((h) => h.nac === E24.nac) ?? {};
		console.log(`do-tre.sql okr.thang=${thang}: ${JSON.stringify(bang)}`);

		if (laHongHet(so))
			return khongDo(hongHet(so, join(RA, "do-tre", "tac-tu.log")));

		const msList = so.map((l) => l.ms);
		const p50 = Math.round(phanVi(msList, 0.5));
		const p90 = Math.round(phanVi(msList, 0.9));
		const soHong = so.filter((l) => l.hong).length;
		console.log(`${msList.length} so: ${msList.join(", ")}`);
		console.log(
			`p50 ${p50} ms (nguong ${E24.nguong.p50Ms}) · p90 ${p90} ms (nguong ${E24.nguong.p90Ms}) · ${soHong} luot hong tinh ${E24.hongMs}`,
		);

		const loi = [];
		if (soHong === 0) {
			if (hangBat.so_luot_do !== lan)
				loi.push(`do-tre.sql dem ${hangBat.so_luot_do} luot, khac ${lan}`);
			if (Math.abs((hangBat.p50_ms ?? -1) - p50) > E24.lechChoPhepMs)
				loi.push(`do-tre.sql p50 ${hangBat.p50_ms} lech so tung luot ${p50}`);
			if (Math.abs((hangBat.p90_ms ?? -1) - p90) > E24.lechChoPhepMs)
				loi.push(`do-tre.sql p90 ${hangBat.p90_ms} lech so tung luot ${p90}`);
		}
		if ((hangBat.p50_ms ?? Number.POSITIVE_INFINITY) > E24.nguong.p50Ms)
			loi.push(`do-tre.sql p50 ${hangBat.p50_ms} > ${E24.nguong.p50Ms}`);
		if ((hangBat.p90_ms ?? Number.POSITIVE_INFINITY) > E24.nguong.p90Ms)
			loi.push(`do-tre.sql p90 ${hangBat.p90_ms} > ${E24.nguong.p90Ms}`);
		if (p50 > E24.nguong.p50Ms) loi.push(`p50 ${p50} > ${E24.nguong.p50Ms}`);
		if (p90 > E24.nguong.p90Ms) loi.push(`p90 ${p90} > ${E24.nguong.p90Ms}`);
		for (const l of loi) console.log(`SAI ${l}`);
		console.log(loi.length === 0 ? "DAT" : "KHONG DAT");
		return loi.length === 0 ? 0 : 1;
	} finally {
		await tacTu.dung();
	}
}

export function laHongHet(so) {
	return so.length > 0 && so.every((l) => l.hong);
}

export function hongHet(so, tepNhatKy, doc = (t) => readFileSync(t, "utf8")) {
	const theoKetCuc = {};
	for (const l of so) {
		const k = l.lyDo ?? l.outcome ?? "khong dong";
		theoKetCuc[k] = (theoKetCuc[k] ?? 0) + 1;
	}
	let dong = "khong co dong loi model trong nhat ky tac tu";
	try {
		dong =
			doc(tepNhatKy)
				.split("\n")
				.find((d) => E24.dauLoiTacTu.test(d))
				?.trim() ?? dong;
	} catch {}
	const ket = Object.entries(theoKetCuc)
		.map(([k, n]) => `${k} ${n}`)
		.join(", ");
	return `${so.length}/${so.length} luot hong (${ket}) — khong phai do tre; ${dong}`;
}

async function main() {
	if (!coKhoaMoHinh()) return khongDo(cauThieuKhoa());
	const chan = await chanSoDu();
	if (chan) return khongDo(chan);
	if (trongPhienCoTacTu()) return trongPhien();
	return chayTrongPhienCoTacTu(`${E24.lenh} --lan ${lan}`);
}

if (import.meta.main) {
	let ma;
	try {
		ma = await main();
	} catch (loi) {
		ma = khongDo(loi?.message ?? String(loi));
	}
	process.exit(ma);
}
