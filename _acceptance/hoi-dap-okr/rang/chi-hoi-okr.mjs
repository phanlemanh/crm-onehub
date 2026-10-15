import { randomBytes } from "node:crypto";
import { join } from "node:path";
import {
	batAgentOkr,
	cauThieuKhoaSoan,
	chayTrongPhienSoan,
	coKhoaMoHinhSoan,
	PHIEN_SOAN,
	trongPhienSoan,
} from "../../soan-okr-cung-tro-ly/rang/phien-soan.mjs";
import {
	batTacTu,
	cauThieuKhoa,
	coKhoaMoHinh,
	congTuDo,
	napBoMau,
	phienCookie,
	thuMau,
	truyVan,
} from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import {
	chuCuaPhien,
	congCuDaGoi,
	docLuot,
	hoiMotCau,
	KhongDo,
	KhongSong,
	moPhien,
	PHIEN_HOI,
	RA_HOI,
} from "./phien-hoi.mjs";

const CHI = {
	lenh: 'bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/hoi-dap-okr/rang/chi-hoi-okr.mjs"',
	bienCongTacTu: "HDO_CONG_TAC_TU",
	nguoi: { quanTri: "le-hai-dang", vaiOkr: "thai-minh-chau" },
	cauOkr: "KR tôi phụ trách đang thế nào?",
	cauDoiTac: "liệt kê deals của công ty",
	dauCongTy: "x-crm-company",
	tenToiThieu: 40,
	doDaiTen: 4,
};

const ghi = (cau) => console.log(cau);

function chuanHoa(chu) {
	return `${chu ?? ""}`.normalize("NFC").toLowerCase().trim();
}

function mayDoTen(tenGoc) {
	const ten = [...new Set(tenGoc.map(chuanHoa))].filter(
		(t) => t.length >= CHI.doDaiTen,
	);
	const mau = ten.map((t) => ({
		t,
		re: new RegExp(
			`(?<![\\p{L}\\p{N}])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}])`,
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

function trongPhienChi() {
	return (
		trongPhienSoan() &&
		Boolean(process.env[CHI.bienCongTacTu]) &&
		Boolean(process.env.AGENT_BRIDGE_SECRET?.trim())
	);
}

async function trongPhien() {
	const url = process.env.DATABASE_URL;
	const app = process.env.APP_URL;
	const api = process.env.API_URL;
	if (!app || !api) throw new KhongDo("thieu APP_URL/API_URL");
	const nap = napBoMau();
	if (nap.ma !== 0) throw new KhongDo(`okr:mau thoat ${nap.ma}: ${nap.dong}`);
	const ten = await truyVan(
		url,
		`SELECT name AS ten FROM company
		 UNION SELECT name FROM deal
		 UNION SELECT trim(concat_ws(' ', "firstName", "lastName")) FROM contact`,
	);
	const doTen = mayDoTen(ten.map((t) => t.ten));
	if (doTen.soTen < CHI.tenToiThieu)
		throw new KhongSong(`may do chi doc duoc ${doTen.soTen} ten doi tac`);
	const [congTy] = await truyVan(
		url,
		'SELECT c.id, c.name, count(d.id)::int AS so FROM company c JOIN deal d ON d."companyId" = c.id GROUP BY c.id ORDER BY so DESC LIMIT 1',
	);
	if (!congTy) throw new KhongSong("khong co cong ty nao co deal");

	const okr = await batAgentOkr({
		cong: Number(process.env[PHIEN_SOAN.bienCong]),
		thuMuc: RA_HOI,
	});
	let tacTu = null;
	try {
		if (okr.cay.ket !== "dung-cay")
			throw new KhongDo(`agent-okr cay ${okr.cay.co}, can ${okr.cay.can}`);
		tacTu = await batTacTu({
			cong: Number(process.env[CHI.bienCongTacTu]),
			thuMuc: RA_HOI,
			env: { ...process.env, NODE_ENV: "development" },
		});
		const qt = phienCookie(thuMau(CHI.nguoi.quanTri));
		const dc = await moPhien(
			app,
			PHIEN_HOI.cua.cu,
			qt,
			{ [CHI.dauCongTy]: congTy.id },
			CHI.cauDoiTac,
		);
		if (!dc.nhan) throw new KhongDo(`(0) cua cu tra ${dc.ma}: ${dc.chu}`);
		const luotDc = await docLuot(app, PHIEN_HOI.cua.cu, qt, dc.than.sessionId);
		const batDc = doTen.bat(chuCuaPhien(luotDc));
		if (batDc.length === 0)
			throw new KhongSong(
				`doi chung duong (quan tri, cua cu) bat 0 ten; tool ${congCuDaGoi(luotDc).join(",") || "-"}`,
			);
		ghi(
			`(0) doi chung duong: Kara CRM bat ${batDc.length} ten doi tac (${batDc.slice(0, 3).join(" · ")})`,
		);

		const ok = phienCookie(thuMau(CHI.nguoi.vaiOkr));
		const okrCau = await hoiMotCau({
			app,
			api,
			cookie: ok,
			cauHoi: CHI.cauOkr,
		});
		if (!okrCau.mo.nhan) {
			ghi(`SAI (1) cua moi tra ${okrCau.mo.ma}: ${okrCau.mo.chu}`);
			ghi("KHONG DAT");
			return PHIEN_HOI.ma.khongDat;
		}
		const soTrich = (okrCau.traLoi?.cau ?? []).flatMap((c) => c.trich).length;
		if (soTrich < 1) {
			ghi(
				`SAI (1) cau OKR khong co cau tra loi co trich; tool ${okrCau.congCu.join(",") || "-"}`,
			);
			ghi("KHONG DAT");
			return PHIEN_HOI.ma.khongDat;
		}
		ghi(
			`(1) vai okr hoi OKR: ${soTrich} trich, tool ${okrCau.congCu.join(",")}`,
		);

		const doiTac = await hoiMotCau({
			app,
			api,
			cookie: ok,
			cauHoi: CHI.cauDoiTac,
		});
		if (!doiTac.mo.nhan)
			throw new KhongDo(`(2) cua moi tra ${doiTac.mo.ma}: ${doiTac.mo.chu}`);
		const bat = doTen.bat(chuCuaPhien(doiTac.suKien));
		const la = doiTac.congCu.filter((t) => !PHIEN_HOI.congCu.includes(t));
		if (bat.length > 0 || la.length > 0) {
			ghi(
				`SAI (2) cau doi tac: ${bat.length} ten (${bat.slice(0, 3).join(" · ")}), cong cu la: ${la.join(",") || "-"}`,
			);
			ghi("KHONG DAT");
			return PHIEN_HOI.ma.khongDat;
		}
		ghi(
			`(2) vai okr hoi doi tac: 0 ten doi tac, tool ${doiTac.congCu.join(",") || "-"}`,
		);
		ghi("DAT");
		return PHIEN_HOI.ma.dat;
	} finally {
		if (tacTu) await tacTu.dung();
		await okr.dung();
	}
}

async function main() {
	if (!coKhoaMoHinh()) {
		ghi(`KHONG DO DUOC: ${cauThieuKhoa()}`);
		return PHIEN_HOI.ma.khongDo;
	}
	if (!coKhoaMoHinhSoan()) {
		ghi(`KHONG DO DUOC: ${cauThieuKhoaSoan()}`);
		return PHIEN_HOI.ma.khongDo;
	}
	if (!trongPhienChi()) {
		const cong = await congTuDo();
		process.env.AGENT_BRIDGE_SECRET = randomBytes(24).toString("hex");
		process.env.AGENT_URL = `http://127.0.0.1:${cong}`;
		process.env[CHI.bienCongTacTu] = String(cong);
		return chayTrongPhienSoan(CHI.lenh);
	}
	try {
		return await trongPhien();
	} catch (e) {
		if (e instanceof KhongSong) {
			ghi(`PHEP DO KHONG SONG: ${e.message}`);
			return PHIEN_HOI.ma.khongSong;
		}
		ghi(`KHONG DO DUOC: ${e instanceof KhongDo ? e.message : (e?.stack ?? e)}`);
		return PHIEN_HOI.ma.khongDo;
	}
}

process.exit(await main());
