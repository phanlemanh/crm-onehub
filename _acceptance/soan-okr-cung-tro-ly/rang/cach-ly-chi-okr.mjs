import { createHmac, randomBytes } from "node:crypto";
import { createServer, request as yeuCau } from "node:http";
import { join } from "node:path";
import { TRO_LY_OKR_SOAN } from "../../../apps/agent-okr/agent/lib/config.ts";
import { OKR_SOAN_CUA } from "../../../apps/app/lib/okr-soan-record.ts";
import {
	batTacTu,
	cauThieuKhoa,
	coKhoaMoHinh,
	congTuDo,
	laKhoDo,
	napBoMau,
	phienCookie,
	thuMau,
	tre,
	trpc,
	truyVan,
} from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import {
	batAgentOkr,
	cauThieuKhoaSoan,
	chayTrongPhienSoan,
	coKhoaMoHinhSoan,
	PHIEN_SOAN,
	RA_SOAN,
	trongPhienSoan,
} from "./phien-soan.mjs";

const GIAY_MS = 1000;
const PHUT_MS = 60 * GIAY_MS;

const CACH_LY = {
	lenh: 'bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/soan-okr-cung-tro-ly/rang/cach-ly-chi-okr.mjs"',
	ra: join(RA_SOAN, "cach-ly"),
	bienCongTacTu: "SCL_CONG_TAC_TU",
	cua: { cu: "/eve/v1", moi: `${OKR_SOAN_CUA.host}/eve/v1` },
	dau: { cuoc: OKR_SOAN_CUA.header, congTy: "x-crm-company" },
	cauHoi: "liệt kê deals của công ty",
	nguoi: { quanTri: "le-hai-dang", vaiOkr: "thai-minh-chau" },
	vai: { okr: "okr", tam: "member" },
	chuKy: { phase: "lap-ke-hoach" },
	capDonVi: "phong-ban",
	ten: { toiThieu: 40, doDaiToiThieu: 4, inToiDa: 3 },
	cho: { luotMs: 4 * PHUT_MS, moMs: 30 * GIAY_MS, noiLaiMs: GIAY_MS },
	jwtCu: { iss: "crm-app", aud: "crm-agent", ttlGiay: 120, lechGiay: 5 },
	claimDoiTac: ["contactId", "companyId", "dealId"],
	hostNgoai: "agent.onehub.internal",
	suKienKet: new Set([
		"input.requested",
		"session.waiting",
		"turn.completed",
		"turn.failed",
		"session.failed",
		"session.completed",
	]),
	boDauTra: ["connection", "keep-alive", "transfer-encoding"],
	thongDiep: {
		ro: "duong vao ro",
		mayDo: "may do khong song",
		kenhGiu: "lop kenh giu: apps/agent tu choi vai okr",
	},
	ma: { dat: 0, khongDat: 1, khongDo: 2, khongSong: 3 },
	tuKiem: {
		ten: ["Stripe", "Công ty Phú Mỹ", "Amara Adeyemi", "Ben", "Wise"],
		bat: [
			{ van: "Deal của STRIPE đang mở", ten: ["stripe"] },
			{ van: "stripes, unstripe", ten: [] },
			{ van: "Công ty Phú Mỹ".normalize("NFD"), ten: ["công ty phú mỹ"] },
			{ van: "Wiseman nói Ben ổn", ten: [] },
			{ van: "Amara Adeyemi (wise)", ten: ["amara adeyemi", "wise"] },
		],
		soTen: 4,
		dongJson: {
			dong: '{"type":"message.delta","data":{"text":"C\\u00f4ng ty \\"Stripe\\""}}',
			chuoi: ["type", "message.delta", "data", "text", 'Công ty "Stripe"'],
		},
		jwt: { biMat: "bi-mat-tu-kiem", claims: { sub: "u1", dealId: "d1" } },
		claim: [
			{ claims: { vai: "okr", cuocSoanId: "c1", sub: "u1" }, la: [] },
			{
				claims: { dealId: "d1", companyId: "c2" },
				la: ["companyId", "dealId"],
			},
			{ claims: null, la: [] },
		],
	},
};

class KhongDo extends Error {}
class KhongSong extends Error {}

function ghi(cau) {
	console.log(cau);
}

function loi(cau) {
	ghi(`SAI ${cau}`);
	ghi("KHONG DAT");
	return CACH_LY.ma.khongDat;
}

function chuanHoa(chu) {
	return `${chu ?? ""}`.normalize("NFC").toLowerCase().trim();
}

function thoatRegex(chu) {
	return chu.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mayDoTen(tenGoc) {
	const ten = [...new Set(tenGoc.map(chuanHoa))].filter(
		(t) => t.length >= CACH_LY.ten.doDaiToiThieu,
	);
	const mau = ten.map((t) => ({
		t,
		re: new RegExp(
			`(?<![\\p{L}\\p{N}])${thoatRegex(t)}(?![\\p{L}\\p{N}])`,
			"u",
		),
	}));
	return {
		soTen: ten.length,
		bat: (chuoi) => {
			const c = chuanHoa(chuoi);
			return mau.filter((m) => m.re.test(c)).map((m) => m.t);
		},
	};
}

function inTen(ten) {
	return ten.slice(0, CACH_LY.ten.inToiDa).join(" · ");
}

async function docTenDoiTac(url) {
	const hang = await truyVan(
		url,
		`SELECT name AS ten FROM company
		 UNION SELECT name FROM deal
		 UNION SELECT trim(concat_ws(' ', "firstName", "lastName")) FROM contact`,
	);
	return hang.map((h) => h.ten);
}

function chuoiTrong(dongJson) {
	return (dongJson.match(/"(?:[^"\\]|\\.)*"/g) ?? []).map((c) => JSON.parse(c));
}

function khoaDoiTac(claims) {
	return CACH_LY.claimDoiTac.filter((k) => claims && k in claims).sort();
}

function kyJwtCu(claims, biMat) {
	const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
	const gio = Math.floor(Date.now() / GIAY_MS);
	const vao = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({
		iss: CACH_LY.jwtCu.iss,
		aud: CACH_LY.jwtCu.aud,
		iat: gio,
		nbf: gio - CACH_LY.jwtCu.lechGiay,
		exp: gio + CACH_LY.jwtCu.ttlGiay,
		...claims,
	})}`;
	const ky = createHmac("sha256", biMat).update(vao).digest("base64url");
	return `${vao}.${ky}`;
}

function docJwt(dau) {
	const token = `${dau ?? ""}`.replace(/^Bearer\s+/i, "");
	const giua = token.split(".")[1];
	if (!giua) return null;
	try {
		return JSON.parse(Buffer.from(giua, "base64url").toString("utf8"));
	} catch {
		return null;
	}
}

function tuKiemThuan() {
	const k = CACH_LY.tuKiem;
	const sai = [];
	const may = mayDoTen(k.ten);
	if (may.soTen !== k.soTen)
		sai.push(`mayDoTen giu ${may.soTen} ten, can ${k.soTen}`);
	for (const c of k.bat) {
		const co = may.bat(c.van).sort().join(",");
		if (co !== [...c.ten].sort().join(","))
			sai.push(`bat «${c.van}» ra [${co}], can [${c.ten.join(",")}]`);
	}
	const chuoi = chuoiTrong(k.dongJson.dong);
	if (JSON.stringify(chuoi) !== JSON.stringify(k.dongJson.chuoi))
		sai.push(`chuoiTrong ra ${JSON.stringify(chuoi)}`);
	const token = kyJwtCu(k.jwt.claims, k.jwt.biMat);
	const [dau, than, ky] = token.split(".");
	const kyLai = createHmac("sha256", k.jwt.biMat)
		.update(`${dau}.${than}`)
		.digest("base64url");
	const doc = docJwt(`Bearer ${token}`);
	if (ky !== kyLai) sai.push("kyJwtCu: chu ky khong khop HS256");
	if (
		doc?.iss !== CACH_LY.jwtCu.iss ||
		doc?.aud !== CACH_LY.jwtCu.aud ||
		doc?.dealId !== k.jwt.claims.dealId ||
		!(doc.exp > doc.iat && doc.nbf < doc.iat)
	)
		sai.push(`docJwt(kyJwtCu) ra ${JSON.stringify(doc)}`);
	if (docJwt("Bearer khong-phai-jwt") !== null)
		sai.push("docJwt nhan chuoi khong phai JWT");
	for (const c of k.claim) {
		const la = khoaDoiTac(c.claims).join(",");
		if (la !== c.la.join(","))
			sai.push(`khoaDoiTac(${JSON.stringify(c.claims)}) ra [${la}]`);
	}
	return { sai, soCa: 1 + k.bat.length + 3 + k.claim.length };
}

async function doiVai(url, userId, vai) {
	if (!laKhoDo(url))
		throw new KhongDo("tu choi doi vai: kho khong phai kho do");
	await truyVan(url, 'UPDATE member SET role = $2 WHERE "userId" = $1', [
		userId,
		vai,
	]);
}

function cuaTrung({ cong = 0, dichCong, doiDau }) {
	const may = createServer(async (req, res) => {
		const phan = [];
		for await (const c of req) phan.push(c);
		const than = Buffer.concat(phan);
		const dauVao = { ...doiDau(req.headers) };
		delete dauVao["transfer-encoding"];
		delete dauVao["content-length"];
		if (than.length > 0) dauVao["content-length"] = String(than.length);
		const ra = yeuCau(
			{
				host: "127.0.0.1",
				port: dichCong,
				path: req.url,
				method: req.method,
				headers: dauVao,
			},
			(tra) => {
				const dau = { ...tra.headers };
				for (const d of CACH_LY.boDauTra) delete dau[d];
				res.writeHead(tra.statusCode ?? 502, dau);
				tra.pipe(res);
			},
		);
		ra.on("error", (e) => {
			if (!res.headersSent) res.writeHead(502);
			res.end(`${e?.message ?? e}`);
		});
		ra.end(than);
	});
	return new Promise((xong, hong) => {
		may.once("error", hong);
		may.listen(cong, "127.0.0.1", () =>
			xong({
				goc: `http://127.0.0.1:${may.address().port}`,
				dung: () =>
					new Promise((x) => {
						may.closeAllConnections?.();
						may.close(() => x());
					}),
			}),
		);
	});
}

async function moPhien(goc, duong, cookie, dauThem, cauHoi) {
	const res = await fetch(`${goc}${duong}/session`, {
		method: "POST",
		redirect: "manual",
		headers: {
			"content-type": "application/json",
			Cookie: `${cookie.ten}=${cookie.gia}; lang=vi`,
			...dauThem,
		},
		body: JSON.stringify({ message: cauHoi }),
		signal: AbortSignal.timeout(CACH_LY.cho.moMs),
	});
	const chu = await res.text();
	let than = null;
	try {
		than = JSON.parse(chu);
	} catch {}
	return {
		ma: res.status,
		nhan: res.ok && Boolean(than?.sessionId),
		than,
		chu: chu.slice(0, 300),
	};
}

async function docMotLan(url, dau, conMs, suKien) {
	const res = await fetch(url, {
		headers: dau,
		signal: AbortSignal.timeout(conMs),
	});
	if (res.status !== 200 || !res.body)
		throw new KhongDo(
			`stream tra ${res.status}: ${(await res.text()).slice(0, 200)}`,
		);
	const bo = res.body.getReader();
	const giai = new TextDecoder();
	let du = "";
	try {
		for (;;) {
			const { value, done } = await bo.read();
			if (done) return false;
			du += giai.decode(value, { stream: true });
			const cac = du.split("\n");
			du = cac.pop() ?? "";
			for (const d of cac) {
				if (!d.trim()) continue;
				const sk = JSON.parse(d);
				suKien.push({ ...sk, tho: d });
				if (CACH_LY.suKienKet.has(sk.type)) return true;
			}
		}
	} finally {
		await bo.cancel().catch(() => {});
	}
}

async function docLuot(goc, duong, cookie, sessionId, dauThem = {}) {
	const dau = { Cookie: `${cookie.ten}=${cookie.gia}; lang=vi`, ...dauThem };
	const goc0 = `${goc}${duong}/session/${encodeURIComponent(sessionId)}/stream`;
	const han = Date.now() + CACH_LY.cho.luotMs;
	const suKien = [];
	let het = false;
	while (!het) {
		const conMs = han - Date.now();
		if (conMs <= 0)
			throw new KhongDo(
				`luong ${sessionId} chua ket sau ${CACH_LY.cho.luotMs / GIAY_MS} s (${suKien.length} su kien, cuoi ${suKien.at(-1)?.type ?? "-"})`,
			);
		try {
			het = await docMotLan(
				`${goc0}?startIndex=${suKien.length}`,
				dau,
				conMs,
				suKien,
			);
		} catch (e) {
			if (e instanceof KhongDo) throw e;
			if (Date.now() >= han) continue;
		}
		if (!het) await tre(CACH_LY.cho.noiLaiMs);
	}
	const tool = suKien
		.filter((s) => s.type === "actions.requested")
		.flatMap((s) => s.data?.actions ?? [])
		.map((a) => a.toolName ?? a.subagentName ?? a.kind);
	const chu = suKien
		.filter((s) => s.type !== "message.received")
		.flatMap((s) => chuoiTrong(s.tho))
		.join("\n");
	const cuoi = suKien.at(-1)?.type ?? "(khong su kien)";
	return { suKien, tool, chu, cuoi };
}

async function docInfo(app, cookie, cuocSoanId) {
	const res = await fetch(`${app}${CACH_LY.cua.moi}/info`, {
		headers: {
			Cookie: `${cookie.ten}=${cookie.gia}; lang=vi`,
			[CACH_LY.dau.cuoc]: cuocSoanId,
		},
		signal: AbortSignal.timeout(CACH_LY.cho.moMs),
	});
	if (res.status !== 200)
		throw new KhongDo(`info qua cua moi tra ${res.status}`);
	const than = await res.json();
	return (than?.tools?.available ?? []).map((t) => t.name).sort();
}

async function inChiPhi(url) {
	try {
		const hang = await truyVan(
			url,
			`SELECT "tinhNang", count(*)::int AS n, coalesce(sum("costUsd"), 0)::float AS usd
			 FROM "aiChiPhi" GROUP BY "tinhNang" ORDER BY "tinhNang"`,
		);
		const tong = hang.reduce((s, h) => s + h.usd, 0);
		ghi(
			`CHI PHI ${tong.toFixed(4)} USD — ${hang.map((h) => `${h.tinhNang} ${h.usd.toFixed(4)} (${h.n} dong)`).join(" · ") || "khong dong AiChiPhi"}`,
		);
	} catch (e) {
		ghi(`CHI PHI khong doc duoc: ${e?.message ?? e}`);
	}
}

function trongPhienCachLy() {
	return (
		trongPhienSoan() &&
		Boolean(process.env[CACH_LY.bienCongTacTu]) &&
		Boolean(process.env.AGENT_BRIDGE_SECRET?.trim())
	);
}

async function chuanBi(url) {
	const nap = napBoMau();
	if (nap.ma !== 0)
		throw new KhongDo(`okr:mau --moc ${nap.moc} thoat ${nap.ma}: ${nap.dong}`);
	const qt = phienCookie(thuMau(CACH_LY.nguoi.quanTri));
	const ok = phienCookie(thuMau(CACH_LY.nguoi.vaiOkr));
	const [nguoiOkr] = await truyVan(
		url,
		'SELECT u.id, u.email, u.name, m.role FROM "user" u JOIN member m ON m."userId" = u.id WHERE u.email = $1',
		[thuMau(CACH_LY.nguoi.vaiOkr)],
	);
	if (nguoiOkr?.role !== CACH_LY.vai.okr)
		throw new KhongDo(
			`${CACH_LY.nguoi.vaiOkr} khong mang vai ${CACH_LY.vai.okr} (${nguoiOkr?.role})`,
		);
	const [phongBan] = await truyVan(
		url,
		'SELECT id, "divisionId" FROM department WHERE "headUserId" = $1',
		[nguoiOkr.id],
	);
	if (!phongBan)
		throw new KhongDo(`${CACH_LY.nguoi.vaiOkr} khong la truong phong ban nao`);
	const [chuKy] = await truyVan(
		url,
		'SELECT id FROM "okrCycle" WHERE phase = $1 ORDER BY "startsOn" DESC LIMIT 1',
		[CACH_LY.chuKy.phase],
	);
	if (!chuKy)
		throw new KhongDo(`bo mau khong co chu ky ${CACH_LY.chuKy.phase}`);
	return { qt, ok, nguoiOkr, phongBan, chuKy };
}

async function trongPhien() {
	const url = process.env.DATABASE_URL;
	const app = process.env.APP_URL;
	const api = process.env.API_URL;
	if (!app || !api || !laKhoDo(url))
		throw new KhongDo("thieu APP_URL/API_URL hay kho khong phai kho do");
	const congTacTu = Number(process.env[CACH_LY.bienCongTacTu]);
	const congCuaOkr = Number(process.env[PHIEN_SOAN.bienCong]);
	if (process.env.AGENT_URL !== `http://127.0.0.1:${congTacTu}`)
		throw new KhongDo(
			`AGENT_URL cua phien (${process.env.AGENT_URL}) khong tro vao cong ${congTacTu}`,
		);
	if (process.env[TRO_LY_OKR_SOAN.env.url] !== `http://127.0.0.1:${congCuaOkr}`)
		throw new KhongDo(
			`${TRO_LY_OKR_SOAN.env.url} cua phien khong tro vao cong ${congCuaOkr}`,
		);

	const { canhCay } = await import(
		"../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs"
	);
	const cay = await canhCay();
	if (cay.ket !== "dung-cay") throw new KhongDo(`app: ${cay.dong.join(" · ")}`);

	const { qt, ok, nguoiOkr, phongBan, chuKy } = await chuanBi(url);
	const doTen = mayDoTen(await docTenDoiTac(url));
	if (doTen.soTen < CACH_LY.ten.toiThieu)
		throw new KhongSong(
			`${CACH_LY.thongDiep.mayDo}: chi doc duoc ${doTen.soTen} ten doi tac (< ${CACH_LY.ten.toiThieu})`,
		);
	const [congTy] = await truyVan(
		url,
		'SELECT c.id, c.name, count(d.id)::int AS so FROM company c JOIN deal d ON d."companyId" = c.id GROUP BY c.id ORDER BY so DESC LIMIT 1',
	);
	if (!congTy)
		throw new KhongSong(
			`${CACH_LY.thongDiep.mayDo}: khong co cong ty nao co deal`,
		);

	const okrThat = await batAgentOkr({
		cong: await congTuDo(),
		thuMuc: CACH_LY.ra,
	});
	const jwtSangOkr = [];
	let soi = null;
	let tacTu = null;
	let vaiDaDoi = null;
	try {
		if (okrThat.cay.ket !== "dung-cay")
			throw new KhongDo(
				`agent-okr /health tra cay «${okrThat.cay.co}», cay dang xet «${okrThat.cay.can}»`,
			);
		soi = await cuaTrung({
			cong: congCuaOkr,
			dichCong: Number(new URL(okrThat.url).port),
			doiDau: (dau) => {
				if (dau.authorization) jwtSangOkr.push(docJwt(dau.authorization));
				return dau;
			},
		});
		tacTu = await batTacTu({
			cong: congTacTu,
			thuMuc: CACH_LY.ra,
			env: { ...process.env, NODE_ENV: "development" },
		});
		ghi(
			`cay: app dung-cay · agent-okr ${okrThat.url} dung-cay (${okrThat.cay.co}) sau may soi ${soi.goc} · apps/agent ${tacTu.url} · ${doTen.soTen} ten doi tac`,
		);

		const dc = await moPhien(
			app,
			CACH_LY.cua.cu,
			qt,
			{ [CACH_LY.dau.congTy]: congTy.id },
			CACH_LY.cauHoi,
		);
		if (!dc.nhan)
			throw new KhongDo(`(0) cua cu quan tri tra ${dc.ma}: ${dc.chu}`);
		const luotDc = await docLuot(app, CACH_LY.cua.cu, qt, dc.than.sessionId);
		const batDc = doTen.bat(luotDc.chu);
		if (batDc.length === 0)
			throw new KhongSong(
				`${CACH_LY.thongDiep.mayDo}: doi chung duong (quan tri, cua cu, ${congTy.name}) bat 0 ten; tool ${luotDc.tool.join(",") || "-"}; ket ${luotDc.cuoi}`,
			);
		ghi(
			`(0) doi chung duong: quan tri qua cua cu bat ${batDc.length} ten (${inTen(batDc)}), tool ${luotDc.tool.join(",") || "-"}, ket ${luotDc.cuoi}`,
		);

		const cu = await moPhien(app, CACH_LY.cua.cu, ok, {}, CACH_LY.cauHoi);
		if (cu.ma !== 403)
			return loi(`(1) cua cu nhan vai okr: ${cu.ma} ${cu.chu}`);
		ghi(`(1) vai okr qua cua cu: 403 ${cu.than?.error ?? ""}`.trim());

		await trpc(api, qt).lam("okr.setProgram", {
			aiOn: true,
			aiSoanPhamVi: "toan-cong-ty",
			aiSoanDonVi: [],
		});
		const mo = await trpc(api, ok).lam("okr.soanMo", {
			cycleId: chuKy.id,
			level: CACH_LY.capDonVi,
			divisionId: phongBan.divisionId,
			departmentId: phongBan.id,
		});
		if (!mo?.ok || !mo.cuoc?.id)
			throw new KhongDo(
				`soanMo khong mo cuoc: ${JSON.stringify(mo).slice(0, 200)}`,
			);
		const cuocSoanId = mo.cuoc.id;
		const dauCuoc = { [CACH_LY.dau.cuoc]: cuocSoanId };
		const moi = await moPhien(
			app,
			CACH_LY.cua.moi,
			ok,
			dauCuoc,
			CACH_LY.cauHoi,
		);
		if (!moi.nhan) return loi(`(2) cua moi tra ${moi.ma}: ${moi.chu}`);
		const [cuoc] = await truyVan(
			url,
			'SELECT "sessionId" FROM "okrCuocSoan" WHERE id = $1',
			[cuocSoanId],
		);
		if (cuoc?.sessionId !== moi.than.sessionId)
			return loi(
				`(2) OkrCuocSoan.sessionId «${cuoc?.sessionId}» khac phien vua mo «${moi.than.sessionId}»`,
			);
		ghi(
			`(2) vai okr qua cua moi: ${moi.ma}, cuoc ${cuocSoanId} phien ${moi.than.sessionId}`,
		);

		const luotOkr = await docLuot(
			app,
			CACH_LY.cua.moi,
			ok,
			moi.than.sessionId,
			dauCuoc,
		);
		const congCuSong = [...TRO_LY_OKR_SOAN.congCu.song].sort();
		const info = await docInfo(app, ok, cuocSoanId);
		const { goiSoan, goiThanhChiDan } = await import(
			"../../../apps/agent-okr/agent/lib/goi-soan.ts"
		);
		const goi = await goiSoan(cuocSoanId, {
			vai: CACH_LY.vai.okr,
			ghiDaCat: false,
		});
		if (!goi) throw new KhongDo(`goiSoan(${cuocSoanId}) tra null`);
		const chuGoi = goiThanhChiDan(goi);
		const batGoi = doTen.bat(chuGoi);
		const batOkr = doTen.bat(luotOkr.chu);
		const toolLa = [...luotOkr.tool, ...info].filter(
			(t) => !congCuSong.includes(t),
		);
		const claimLa = jwtSangOkr.flatMap(khoaDoiTac);
		const vaiJwt = [...new Set(jwtSangOkr.map((c) => c?.vai))];
		if (batGoi.length > 0)
			return loi(`(3) ro ten trong goi boi canh: ${inTen(batGoi)}`);
		if (batOkr.length > 0)
			return loi(`(3) ro ten qua phien OKR: ${inTen(batOkr)}`);
		if (toolLa.length > 0)
			return loi(`(3) tool la trong phien OKR: ${toolLa.join(",")}`);
		if (info.join(",") !== congCuSong.join(","))
			return loi(
				`(3) info() tra tool [${info.join(",")}], can [${congCuSong.join(",")}]`,
			);
		if (jwtSangOkr.length === 0)
			return loi("(3) may soi khong thay JWT nao sang agent-okr");
		if (claimLa.length > 0)
			return loi(
				`(3) JWT sang agent-okr mang khoa doi tac: ${[...new Set(claimLa)].join(",")}`,
			);
		if (vaiJwt.join(",") !== CACH_LY.vai.okr)
			return loi(`(3) JWT sang agent-okr mang vai ${vaiJwt.join(",")}`);
		ghi(
			`(3) phien OKR: 0 ten trong goi (${chuGoi.length} ky tu) va ${luotOkr.suKien.length} su kien, tool goi ${luotOkr.tool.join(",") || "(khong goi)"}, info() [${info.join(",")}], ${jwtSangOkr.length} JWT vai okr 0 khoa doi tac, ket ${luotOkr.cuoi}`,
		);

		const [deal] = await truyVan(
			url,
			'SELECT id FROM deal WHERE "companyId" = $1 LIMIT 1',
			[congTy.id],
		);
		const ro = await cuaTrung({
			dichCong: congTacTu,
			doiDau: (dau) => ({
				host: CACH_LY.hostNgoai,
				"content-type": dau["content-type"] ?? "application/json",
				authorization: `Bearer ${kyJwtCu(
					{
						sub: nguoiOkr.id,
						email: nguoiOkr.email,
						name: nguoiOkr.name,
						dealId: deal.id,
					},
					process.env.AGENT_BRIDGE_SECRET,
				)}`,
			}),
		});
		try {
			const mot = await moPhien(ro.goc, CACH_LY.cua.cu, ok, {}, CACH_LY.cauHoi);
			if (mot.nhan) {
				const l = await docLuot(ro.goc, CACH_LY.cua.cu, ok, mot.than.sessionId);
				const b = doTen.bat(l.chu);
				return loi(
					`(4a) kenh apps/agent nhan vai okr qua cua ro (${b.length} ten: ${inTen(b)})`,
				);
			}
			ghi(`(4a) ${CACH_LY.thongDiep.kenhGiu} (${mot.ma})`);

			vaiDaDoi = nguoiOkr.id;
			await doiVai(url, nguoiOkr.id, CACH_LY.vai.tam);
			const hai = await moPhien(ro.goc, CACH_LY.cua.cu, ok, {}, CACH_LY.cauHoi);
			if (!hai.nhan)
				throw new KhongSong(
					`chieu do khong do: bo hai lop ma cua ro van tra ${hai.ma}: ${hai.chu}`,
				);
			const l2 = await docLuot(ro.goc, CACH_LY.cua.cu, ok, hai.than.sessionId);
			const b2 = doTen.bat(l2.chu);
			if (b2.length === 0)
				throw new KhongSong(
					`chieu do khong do: bo hai lop van 0 ten (tool ${l2.tool.join(",") || "-"}, ket ${l2.cuoi})`,
				);
			ghi(
				`(4b) ${CACH_LY.thongDiep.ro}: ${inTen(b2)} — bo lop cua va lop kenh (vai tam ${CACH_LY.vai.tam} trong kho do, JWT co dealId), chieu do bat dung, may do song`,
			);
		} finally {
			await ro.dung();
		}
		ghi("DAT");
		return CACH_LY.ma.dat;
	} finally {
		if (vaiDaDoi) await doiVai(url, vaiDaDoi, CACH_LY.vai.okr);
		await inChiPhi(url);
		if (soi) await soi.dung();
		if (tacTu) await tacTu.dung();
		await okrThat.dung();
	}
}

async function main() {
	const tu = tuKiemThuan();
	if (tu.sai.length > 0) {
		console.log(`KHONG DO DUOC: tu kiem thuoc sai: ${tu.sai.join(" · ")}`);
		return CACH_LY.ma.khongDo;
	}
	console.log(
		`tu kiem thuoc: ${tu.soCa} ca dung (may do ten, chuoi JSON, JWT, khoa doi tac)`,
	);
	if (!coKhoaMoHinh()) {
		console.log(`KHONG DO DUOC: ${cauThieuKhoa()}`);
		return CACH_LY.ma.khongDo;
	}
	if (!coKhoaMoHinhSoan()) {
		console.log(`KHONG DO DUOC: ${cauThieuKhoaSoan()}`);
		return CACH_LY.ma.khongDo;
	}
	if (!trongPhienCachLy()) {
		const cong = await congTuDo();
		process.env.AGENT_BRIDGE_SECRET = randomBytes(24).toString("hex");
		process.env.AGENT_URL = `http://127.0.0.1:${cong}`;
		process.env[CACH_LY.bienCongTacTu] = String(cong);
		console.log(`-- phien do cach ly: apps/agent cong ${cong}`);
		return chayTrongPhienSoan(CACH_LY.lenh);
	}
	try {
		return await trongPhien();
	} catch (e) {
		if (e instanceof KhongSong) {
			console.log(`PHEP DO KHONG SONG: ${e.message}`);
			return CACH_LY.ma.khongSong;
		}
		console.log(
			`KHONG DO DUOC: ${e instanceof KhongDo ? e.message : (e?.stack ?? e)}`,
		);
		return CACH_LY.ma.khongDo;
	}
}

process.exit(await main());
