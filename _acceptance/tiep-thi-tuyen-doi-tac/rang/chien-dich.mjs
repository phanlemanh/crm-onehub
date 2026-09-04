import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import puppeteer from "puppeteer-core";
import {
	BANG_THANH_VIEN,
	COT_THANH_VIEN,
	DEM_GOI,
	DOC_CHU,
	DOC_DAU_TRANG,
	DOC_KHONG_DICH,
	DOC_MUC_MOI,
	DOC_NUT_KET_QUA,
	DOC_SO_DO,
	DOC_TIEU_DE,
	KHOA_KET_QUA,
	MA_TRANG_THAI,
	PHAM_VI,
} from "./be-mat.mjs";

const CHAN = ["luong", "chu", "trang-thai", "be-rong", "thiet-ke"];
const chan = process.argv[2] ?? "";

if (!CHAN.includes(chan)) {
	console.log(
		`CHUA DUNG: chan "${process.argv.slice(2).join(" ") || "(khong dat ten)"}" khong co trong bo rang chien dich.\n` +
			`Nam chan da dung: ${CHAN.join(" | ")}.`,
	);
	process.exit(2);
}

const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const EMAIL = process.env.PHIEN_EMAIL ?? "manh.phan@onemount.com";
const CHROME =
	process.env.CHROME ??
	"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const ANH = "_acceptance/tiep-thi-tuyen-doi-tac/evidence";
const CHO_TAI = Number(process.env.CHO_TAI ?? 120000);
const CHO_VE = Number(process.env.CHO_VE ?? 60000);
const PHA = process.env.PHA ?? "";
const CHAM_MS = Number(process.env.CHAM_MS ?? 12000);

const RUN = process.env.RUN_ID ?? `tt${Date.now().toString(36)}`;
const HO = `Rang${RUN}`;

const cho = (ms) => new Promise((r) => setTimeout(r, ms));

function cun(loi) {
	console.log(`RANG CUN: ${loi}`);
	process.exit(2);
}

function phien() {
	let raw;
	try {
		raw = execFileSync("bun", ["run", "dev:session", EMAIL], {
			cwd: "apps/api",
			encoding: "utf8",
		});
	} catch (error) {
		cun(
			`khong lay duoc phien bang "cd apps/api && bun run dev:session ${EMAIL}" — ${error.message}`,
		);
	}
	const line = raw.trim().split("\n").pop().trim();
	const eq = line.indexOf("=");
	if (eq < 1) cun(`dev:session tra dong khong doc duoc: ${JSON.stringify(line)}`);
	return { name: line.slice(0, eq), value: line.slice(eq + 1) };
}

function bia(cookie) {
	return { Cookie: `${cookie.name}=${cookie.value}` };
}

async function hoi(cookie, path, input) {
	const url =
		input === undefined
			? `${API}/api/trpc/${path}`
			: `${API}/api/trpc/${path}?input=${encodeURIComponent(JSON.stringify(input))}`;
	let res;
	try {
		res = await fetch(url, { headers: bia(cookie) });
	} catch (error) {
		cun(`may chu API ${API} khong tra loi ${path} — ${error.message}`);
	}
	const body = await res.json();
	if (body.error) cun(`${path} tra loi: ${body.error.message}`);
	return body.result.data;
}

async function bao(cookie, path, input) {
	let res;
	try {
		res = await fetch(`${API}/api/trpc/${path}`, {
			method: "POST",
			headers: { ...bia(cookie), "Content-Type": "application/json" },
			body: JSON.stringify(input),
		});
	} catch (error) {
		cun(`may chu API ${API} khong tra loi ${path} — ${error.message}`);
	}
	const body = await res.json();
	if (body.error) cun(`${path} tra loi: ${body.error.message}`);
	return body.result.data;
}

async function suySlug(cookie) {
	if (process.env.SLUG) return process.env.SLUG;
	let res;
	try {
		res = await fetch(`${APP}/`, { redirect: "manual", headers: bia(cookie) });
	} catch (error) {
		cun(`may chu app ${APP} khong tra loi — ${error.message}`);
	}
	const dich = res.headers.get("location");
	if (!dich) {
		cun(
			`khong suy duoc slug — ${APP}/ tra ${res.status} ma khong co Location. Phien hong hoac kho chua co noi lam viec.`,
		);
	}
	const dau = new URL(dich, APP).pathname.replace(/^\/+|\/+$/g, "").split("/")[0];
	if (!dau || dau === "sign-in") {
		cun(`khong suy duoc slug — ${APP}/ da day ve "${dich}"; phien khong hop le.`);
	}
	return dau;
}

function khoChuoi() {
	const doc =
		'import {campaignMessages} from "./lib/messages/campaigns";' +
		'import {crmMessages} from "./lib/messages/crm";' +
		'const f=(o,p="")=>Object.entries(o).flatMap(([k,v])=>{const q=p?p+"."+k:k;' +
		'return v&&typeof v==="object"?f(v,q):typeof v==="string"?[[q,v]]:[];});' +
		'console.log(JSON.stringify({en:Object.fromEntries(f(campaignMessages("en"))),' +
		'vi:Object.fromEntries(f(campaignMessages("vi"))),' +
		'goi:{en:crmMessages("en").timeline.type.call,vi:crmMessages("vi").timeline.type.call}}));';
	let raw;
	try {
		raw = execFileSync("bun", ["-e", doc], { cwd: "apps/app", encoding: "utf8" });
	} catch (error) {
		cun(`khong doc duoc kho chuoi apps/app/lib/messages/campaigns.ts — ${error.message}`);
	}
	const parsed = JSON.parse(raw.trim().split("\n").pop());
	if (Object.keys(parsed.vi).length < 40) {
		cun("kho chuoi chien dich tra ve qua it khoa — khuon kho chuoi da doi?");
	}
	return parsed;
}

const CHI_SO = /^[\d\s.,:%–\-—/()+…·|≈~≥≤<>]*$/;

function dem(list) {
	const m = new Map();
	for (const s of list) m.set(s, (m.get(s) ?? 0) + 1);
	return m;
}

async function dungTruong(cookie) {
	const co = await hoi(cookie, "fields.list", { entity: "CONTACT" });
	const theoKhoa = new Map(co.map((f) => [f.key, f]));
	const can = [
		{
			key: "san_luong",
			tho: "San luong",
			nhan: "Sản lượng",
			type: "SELECT",
			options: ["Cao", "Vừa", "Thấp", "Ngủ"],
			showOnTable: true,
			showOnFilter: true,
		},
		{
			key: "tin_moi_30_ngay",
			tho: "Tin moi 30 ngay",
			nhan: "Tin mới 30 ngày",
			type: "NUMBER",
			showOnTable: true,
			showOnFilter: false,
		},
		{
			key: "dia_ban",
			tho: "Dia ban",
			nhan: "Địa bàn",
			type: "TEXT",
			showOnTable: true,
			showOnFilter: false,
		},
	];

	for (const truong of can) {
		if (theoKhoa.has(truong.key)) continue;
		const moi = await bao(cookie, "fields.create", {
			entity: "CONTACT",
			label: truong.tho,
			type: truong.type,
			options: (truong.options ?? []).map((label) => ({ label })),
			agentFilled: false,
			agentBrief: null,
			required: false,
			showOnSheet: true,
			showOnTable: truong.showOnTable,
			showOnFilter: truong.showOnFilter,
		});
		if (moi.key !== truong.key) {
			cun(
				`truong moi mang khoa "${moi.key}" chu khong phai "${truong.key}" — khong gieo duoc du lieu san.`,
			);
		}
		await bao(cookie, "fields.update", {
			id: moi.id,
			data: { label: truong.nhan },
		});
	}

	const sau = await hoi(cookie, "fields.list", { entity: "CONTACT" });
	const map = new Map(sau.map((f) => [f.key, f]));
	for (const truong of can) {
		if (!map.has(truong.key)) cun(`truong ${truong.key} van khong co sau khi gieo`);
	}
	return map;
}

async function gieoNguoi(cookie, truong) {
	const sanLuong = truong.get("san_luong");
	const cao = sanLuong.options.find((o) => o.label === "Cao");
	const ngu = sanLuong.options.find((o) => o.label === "Ngủ");
	if (!cao || !ngu) cun("truong san_luong thieu lua chon Cao hoac Ngủ");

	const mau = [
		{ ten: "Quỳnh", dienThoai: "0901234501", tin: 24, diaBan: "Quận 7" },
		{ ten: "Bảo", dienThoai: "0901234502", tin: 17, diaBan: "Quận 2" },
		{ ten: "Diệp", dienThoai: "0901234503", tin: 9, diaBan: "Bình Thạnh" },
		{ ten: "Trâm", dienThoai: null, tin: 4, diaBan: "Gò Vấp" },
	];

	const nguoi = [];
	for (const m of mau) {
		const dauVao = { firstName: m.ten, lastName: HO };
		if (m.dienThoai) dauVao.phone = m.dienThoai;
		const tao = await bao(cookie, "contacts.create", dauVao);
		await bao(cookie, "contacts.update", {
			id: tao.id,
			data: {
				fields: {
					san_luong: "Cao",
					tin_moi_30_ngay: m.tin,
					dia_ban: m.diaBan,
				},
			},
		});
		nguoi.push({ id: tao.id, ten: `${m.ten} ${HO}`, dienThoai: m.dienThoai, diaBan: m.diaBan });
	}

	return { nguoi, caoId: cao.id, nguId: ngu.id };
}

function locGocNhin(optionId) {
	return {
		q: HO,
		sort: "createdAt",
		dir: "desc",
		archived: false,
		filters: { "field:san_luong": [optionId] },
	};
}

function locDanhSach(optionId) {
	return {
		q: HO,
		sort: "createdAt",
		dir: "desc",
		page: 1,
		pageSize: 100,
		owner: [],
		company: [],
		source: [],
		title: [],
		seniority: [],
		persona: [],
		activity: [],
		fields: { san_luong: [optionId] },
		archived: false,
	};
}

async function gieo(cookie) {
	const truong = await dungTruong(cookie);
	const { nguoi, caoId, nguId } = await gieoNguoi(cookie, truong);

	const gocNhin = await bao(cookie, "savedViews.create", {
		entity: "CONTACT",
		name: `Sản lượng cao ${RUN}`,
		shared: true,
		filters: locGocNhin(caoId),
	});
	const gocRong = await bao(cookie, "savedViews.create", {
		entity: "CONTACT",
		name: `Sản lượng ngủ ${RUN}`,
		shared: true,
		filters: locGocNhin(nguId),
	});

	return { nguoi, caoId, nguId, gocNhin, gocRong };
}

async function moTrinhDuyet(rong, cao) {
	try {
		return await puppeteer.launch({
			executablePath: CHROME,
			headless: "new",
			args: ["--no-sandbox", `--window-size=${rong},${cao}`],
		});
	} catch (error) {
		cun(`khong mo duoc Chrome tai ${CHROME} — ${error.message}`);
	}
}

async function moTrang(browser, cookie, locale, rong, cao) {
	const page = await browser.newPage();
	await page.setViewport({ width: rong, height: cao, deviceScaleFactor: 1 });
	await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
	await browser.setCookie(
		{ name: cookie.name, value: cookie.value, domain: "localhost", path: "/" },
		{ name: "lang", value: locale, domain: "localhost", path: "/" },
	);
	return page;
}

function chanCham(page) {
	const trang = { khop: null, ms: CHAM_MS };
	page.on("request", (req) => {
		if (!req.isInterceptResolutionHandled?.()) {
			const url = req.url();
			if (trang.khop && url.includes(trang.khop)) {
				setTimeout(() => req.continue().catch(() => {}), trang.ms);
				return;
			}
			req.continue().catch(() => {});
		}
	});
	return trang;
}

async function di(page, duong) {
	await page.goto(`${APP}${duong}`, {
		waitUntil: "networkidle0",
		timeout: CHO_TAI,
	});
}

async function chupHinh(page, ten) {
	mkdirSync(ANH, { recursive: true });
	await page.screenshot({ path: `${ANH}/${ten}` });
}

async function nutTheoChu(page, chuMuon, trong) {
	const goc = trong ?? "body";
	const handle = await page.evaluateHandle(
		(sel, want) =>
			[...document.querySelectorAll(`${sel} button, ${sel} a`)].find(
				(el) => (el.textContent ?? "").replace(/\s+/g, " ").trim() === want,
			) ?? null,
		goc,
		chuMuon,
	);
	return handle.asElement();
}

async function choBang(page) {
	await page.waitForSelector('[data-slot="table-head"]', { timeout: CHO_VE });
}

async function choBangThanhVien(page, nhanCot) {
	await choBang(page);
	try {
		await page.waitForFunction(
			(doc, cot) => {
				const fn = new Function(`return (${doc})`)();
				const r = fn(cot);
				return r.khop === 1 && r.dong > 0;
			},
			{ timeout: CHO_VE },
			BANG_THANH_VIEN.toString(),
			nhanCot,
		);
	} catch {
		const nay = await page.evaluate(BANG_THANH_VIEN, nhanCot);
		cun(
			`trang chien dich khong on dinh o mot bang thanh vien: tong=${nay.tong} khop=${nay.khop} (cot "${nhanCot}")`,
		);
	}
	return page.evaluate(BANG_THANH_VIEN, nhanCot);
}

function soTu(chuoi) {
	const chi = chuoi.replace(/[^\d]/g, "");
	return chi === "" ? null : Number(chi);
}

async function ghiKetQua(page, dongThuTu, nhan) {
	const nut = await page.evaluateHandle(
		(i, want) => {
			const rows = [
				...document.querySelectorAll(
					'[data-slot="table-body"] [data-slot="table-row"]',
				),
			];
			const row = rows[i];
			if (!row) return null;
			return (
				[...row.querySelectorAll("button")].find(
					(b) => (b.textContent ?? "").replace(/\s+/g, " ").trim() === want,
				) ?? null
			);
		},
		dongThuTu,
		nhan,
	);
	const el = nut.asElement();
	if (!el) return false;
	await el.click();
	return true;
}

const cookie = phien();
const slug = await suySlug(cookie);
const kho = khoChuoi();
const vi = kho.vi;

const DUONG_DS = `/${slug}/campaigns`;
const duongCd = (id) => `/${slug}/campaigns/${id}`;

if (chan === "luong") {
	const d = await gieo(cookie);
	const browser = await moTrinhDuyet(1440, 1000);
	try {
		const page = await moTrang(browser, cookie, "vi", 1440, 1000);

		await di(page, `/${slug}/contacts?q=${encodeURIComponent(HO)}`);
		await choBang(page);
		await chupHinh(page, "E6-goc-nhin.png");

		await di(page, `${DUONG_DS}?new=true`);
		await page.waitForSelector('[data-slot="sheet-content"]', { timeout: CHO_VE });
		await cho(800);
		const oTen = await page.$('[data-slot="sheet-content"] input');
		if (!oTen) cun("hop tao chien dich khong co o nhap ten");
		const tenCd = `Chiến dịch ${RUN}`;
		await oTen.type(tenCd);
		const oChon = await page.$('[data-slot="sheet-content"] [data-slot="select-trigger"]');
		if (!oChon) cun("hop tao chien dich khong co o chon phan khuc");
		await oChon.click();
		await cho(700);
		const muc = await page.evaluateHandle(
			(ten) =>
				[...document.querySelectorAll('[data-slot="select-item"]')].find((el) =>
					(el.textContent ?? "").includes(ten),
				) ?? null,
			`Sản lượng cao ${RUN}`,
		);
		const mucEl = muc.asElement();
		if (!mucEl) cun(`o chon phan khuc khong co muc "Sản lượng cao ${RUN}"`);
		await mucEl.click();
		await cho(500);
		await chupHinh(page, "E6-tao.png");
		const nutTao = await nutTheoChu(page, vi["create.submit"], '[data-slot="sheet-content"]');
		if (!nutTao) cun(`khong thay nut "${vi["create.submit"]}" trong hop tao`);
		await nutTao.click();
		await page.waitForFunction(
			() => /\/campaigns\/[^/?]+/.test(location.pathname),
			{ timeout: CHO_VE },
		);
		const bangDau = await choBangThanhVien(page, vi["memberColumns.phone"]);
		await cho(600);

		const cdId = new URL(page.url()).pathname.split("/").pop();
		const trenMan = bangDau.dong;
		const quaApi = await hoi(cookie, "contacts.list", locDanhSach(d.caoId));

		if (trenMan !== quaApi.total || trenMan < 1) {
			console.log(
				`E6 THANH VIEN LECH man=${trenMan} api=${quaApi.total} — bang thanh vien khong bang ket qua contacts.list cung bo loc`,
			);
			process.exit(1);
		}
		console.log(`E6 THANH VIEN KHOP n=${trenMan}`);

		const soDoTruoc = await page.evaluate(DOC_SO_DO);
		const tyLeTruoc = soDoTruoc[0]?.[2]?.so ?? "";
		if (tyLeTruoc !== "—") {
			console.log(
				`E12 SO DO SAI: chua goi ai ma ty le tra loi hien "${tyLeTruoc}", khong phai "—"`,
			);
			process.exit(1);
		}

		const thanhVien = await hoi(cookie, "campaigns.members", {
			id: cdId,
			page: 1,
			pageSize: 50,
			uncalledOnly: false,
			q: "",
		});
		const tenTrenMan = await page.evaluate(
			() =>
				[
					...document.querySelectorAll(
						'[data-slot="table-body"] [data-slot="table-row"]',
					),
				].map((r) => (r.textContent ?? "").replace(/\s+/g, " ").trim()),
		);
		if (!tenTrenMan[0]?.includes(thanhVien.rows[0].name)) {
			cun(
				`thu tu dong tren man khong khop API: dong dau tren man "${tenTrenMan[0]}", API "${thanhVien.rows[0].name}"`,
			);
		}
		const nguoiDau = thanhVien.rows[0];
		await di(page, `${duongCd(cdId)}?record=contact:${nguoiDau.id}&tab=activity`);
		await page.waitForSelector('[data-slot="sheet-content"]', { timeout: CHO_VE });
		await cho(1500);
		const n0 = await page.evaluate(DEM_GOI, kho.goi.vi);

		await di(page, duongCd(cdId));
		await choBang(page);
		const nutBatDau = await nutTheoChu(page, vi["detail.start"], '[data-slot="page-shell-actions"]');
		if (!nutBatDau) cun(`trang chien dich khong co nut "${vi["detail.start"]}"`);
		await nutBatDau.click();
		await page.waitForFunction(
			(want) =>
				[
					...document.querySelectorAll(
						'[data-slot="page-shell-actions"] [data-slot="badge"]',
					),
				].some((b) => (b.textContent ?? "").trim() === want),
			{ timeout: CHO_VE },
			vi["status.running"],
		);
		await cho(800);
		await chupHinh(page, "E9-bat-dau.png");

		if (PHA === "khong-bam") {
			console.log("PHA=khong-bam: bo qua cu bam ket qua");
		} else {
			const bam = await ghiKetQua(page, 0, vi["outcome.answered"]);
			if (!bam) cun(`dong dau khong co nut "${vi["outcome.answered"]}"`);
			await cho(2000);
		}
		await chupHinh(page, "E9-ghi.png");

		await di(page, `${duongCd(cdId)}?record=contact:${nguoiDau.id}&tab=activity`);
		await page.waitForSelector('[data-slot="sheet-content"]', { timeout: CHO_VE });
		await cho(1500);
		const n1 = await page.evaluate(DEM_GOI, kho.goi.vi);
		const muMoi = await page.evaluate(DOC_MUC_MOI);
		await chupHinh(page, "E9-dong-thoi-gian.png");

		console.log(`E9 CALL n0=${n0} n1=${n1} nonce=${tenCd}`);

		if (n1 - n0 !== 1) {
			console.log(
				`E9 DO: n1 - n0 = ${n1 - n0}, phai bang 1 sau khi tai lai trang.`,
			);
			process.exit(1);
		}
		const mucKhop = muMoi.some(
			(t) => t.includes(vi["outcome.answered"]) && t.includes(tenCd),
		);
		if (!mucKhop) {
			console.log(
				`E9 DO: muc moi nhat khong mang ca "${vi["outcome.answered"]}" lan ten chien dich "${tenCd}". Muc doc duoc: ${JSON.stringify(muMoi.slice(0, 3))}`,
			);
			process.exit(1);
		}

		await di(page, duongCd(cdId));
		await choBang(page);
		const lai = await ghiKetQua(page, 0, vi["outcome.noAnswer"]);
		if (!lai) cun(`dong dau khong co nut "${vi["outcome.noAnswer"]}"`);
		await cho(2000);
		const hai = await ghiKetQua(page, 1, vi["outcome.meeting"]);
		if (!hai) cun(`dong hai khong co nut "${vi["outcome.meeting"]}"`);
		await cho(2000);

		await di(page, duongCd(cdId));
		await choBang(page);
		await cho(600);
		await chupHinh(page, "E12-so-do.png");
		const soDo = await page.evaluate(DOC_SO_DO);
		if (soDo.length < 2) {
			console.log(
				`E12 DO: chi doc duoc ${soDo.length} dai so do — cot toan tap khong hien canh cot chien dich.`,
			);
			process.exit(1);
		}
		const daGoi = soTu(soDo[0][1]?.so ?? "");
		const traLoi = soTu(soDo[0][2]?.mo ?? "");
		const hen = soTu(soDo[0][3]?.mo ?? "");
		const toanTap = soTu(soDo[1][1]?.so ?? "");
		console.log(
			`E12 SO DO da_goi=${daGoi} tra_loi=${traLoi} hen=${hen} toan_tap_da_goi=${toanTap}`,
		);

		const tuApi = await hoi(cookie, "campaigns.byId", { id: cdId });
		const lech = [];
		if (daGoi !== tuApi.stats.called) lech.push(`da_goi man=${daGoi} api=${tuApi.stats.called}`);
		if (traLoi !== tuApi.stats.answered) lech.push(`tra_loi man=${traLoi} api=${tuApi.stats.answered}`);
		if (hen !== tuApi.stats.meetings) lech.push(`hen man=${hen} api=${tuApi.stats.meetings}`);
		if (toanTap !== (tuApi.control?.called ?? null)) {
			lech.push(`toan_tap man=${toanTap} api=${tuApi.control?.called ?? null}`);
		}
		if (daGoi !== 2) lech.push(`da_goi=${daGoi} nhung ba luot goi chi cham hai ca nhan`);
		if (lech.length > 0) {
			console.log(`E12 DO: ${lech.join(" · ")}`);
			process.exit(1);
		}

		console.log(
			`luong: xong — goc nhin "Sản lượng cao ${RUN}", chien dich "${tenCd}", ${trenMan} thanh vien, 3 luot goi tren 2 ca nhan.`,
		);
		process.exit(0);
	} finally {
		await browser.close();
	}
}

if (chan === "trang-thai") {
	const d = await gieo(cookie);
	const cd = await bao(cookie, "campaigns.create", {
		name: `Chiến dịch trạng thái ${RUN}`,
		savedViewId: d.gocNhin.id,
	});
	const browser = await moTrinhDuyet(1440, 1000);
	try {
		const page = await moTrang(browser, cookie, "vi", 1440, 1000);
		const nhanKetQua = KHOA_KET_QUA.map((k) => vi[k]);

		await di(page, duongCd(cd.id));
		await choBang(page);
		await cho(600);
		await chupHinh(page, "E23-nhap.png");
		let nhap = await page.evaluate(DOC_NUT_KET_QUA, nhanKetQua);

		const nutBatDau = await nutTheoChu(page, vi["detail.start"], '[data-slot="page-shell-actions"]');
		if (!nutBatDau) cun(`trang chien dich nhap khong co nut "${vi["detail.start"]}"`);
		await nutBatDau.click();
		await page.waitForFunction(
			(want) =>
				[
					...document.querySelectorAll(
						'[data-slot="page-shell-actions"] [data-slot="badge"]',
					),
				].some((b) => (b.textContent ?? "").trim() === want),
			{ timeout: CHO_VE },
			vi["status.running"],
		);
		await cho(900);
		const chay = await page.evaluate(DOC_NUT_KET_QUA, nhanKetQua);

		if (PHA === "dem-nhap-sau-bat-dau") {
			console.log("PHA=dem-nhap-sau-bat-dau: doc lai so nut cua trang nhap SAU khi da bam Bat dau");
			nhap = await page.evaluate(DOC_NUT_KET_QUA, nhanKetQua);
		}

		const nutKetThuc = await nutTheoChu(page, vi["detail.finish"], '[data-slot="page-shell-actions"]');
		if (!nutKetThuc) cun(`trang chien dich dang chay khong co nut "${vi["detail.finish"]}"`);
		await nutKetThuc.click();
		await cho(1500);
		await chupHinh(page, "E23-ket-thuc-bam.png");

		await di(page, duongCd(cd.id));
		await choBang(page);
		await cho(800);
		await chupHinh(page, "E23-ket-thuc.png");
		const ketThuc = await page.evaluate(DOC_NUT_KET_QUA, nhanKetQua);
		const dauTrang = await page.evaluate(DOC_DAU_TRANG);
		const batDauAn = !dauTrang.nut.includes(vi["detail.start"]);

		console.log(
			`E23 TRANG THAI nhap=${nhap.tren1}nut chay=${chay.tren1}nut ketthuc=${ketThuc.tren1}nut batdau=${batDauAn ? "an" : "hien"}`,
		);

		const hong = [];
		if (nhap.tren1 !== 0) hong.push(`trang nhap co ${nhap.tren1} nut ket qua tren mot dong`);
		if (chay.tren1 !== 5) hong.push(`trang dang chay co ${chay.tren1} nut ket qua tren mot dong, khong phai 5`);
		if (ketThuc.tren1 !== 0) hong.push(`trang da ket thuc con ${ketThuc.tren1} nut ket qua tren mot dong`);
		if (!batDauAn) hong.push(`trang da ket thuc van con nut "${vi["detail.start"]}"`);
		if (!dauTrang.huyHieu.includes(vi["status.finished"])) {
			hong.push(`trang da ket thuc khong mang huy hieu "${vi["status.finished"]}"`);
		}
		if (!dauTrang.mo.includes(vi["detail.finishedAt"])) {
			hong.push(`trang da ket thuc khong ghi moc "${vi["detail.finishedAt"]}"`);
		}
		if (hong.length > 0) {
			console.log(`E23 DO: ${hong.join(" · ")}`);
			process.exit(1);
		}
		process.exit(0);
	} finally {
		await browser.close();
	}
}

if (chan === "be-rong") {
	const d = await gieo(cookie);
	const cd = await bao(cookie, "campaigns.create", {
		name: `Chiến dịch bề rộng ${RUN}`,
		savedViewId: d.gocNhin.id,
	});
	await bao(cookie, "campaigns.start", { id: cd.id });

	console.log("-- cot bang thanh vien da khai truoc:");
	for (const cot of COT_THANH_VIEN) {
		console.log(
			`   ${cot.id.padEnd(16)} "${vi[cot.khoa]}"${cot.an ? ` (an duoi ${cot.an})` : ""}`,
		);
	}

	let hong = 0;
	for (const rong of [1024, 768]) {
		const browser = await moTrinhDuyet(rong, 900);
		try {
			const page = await moTrang(browser, cookie, "vi", rong, 900);
			await di(page, duongCd(cd.id));
			await choBang(page);
			await cho(700);
			await chupHinh(page, `E21-${rong}.png`);
			const tieuDe = await page.evaluate(DOC_TIEU_DE);
			if (tieuDe.length === 0) cun(`o ${rong}px khong doc duoc tieu de cot nao`);

			console.log(`-- ${rong}px`);
			for (const h of tieuDe) {
				const trangThai = h.bicat
					? h.coBaCham && h.title === h.text
						? "cat + ba cham + tro nang"
						: h.coBaCham
							? "cat + ba cham + THIEU CHU DAY DU"
							: "CAT TRAN"
					: "du";
				console.log(
					`   ${String(h.text).padEnd(22)} o=${String(h.boxWidth).padStart(8)}px chu=${String(h.textWidth).padStart(8)}px  ${trangThai}`,
				);
				if (rong >= 1024 && h.bicat) hong += 1;
				if (rong < 1024 && h.bicat && !(h.coBaCham && h.title === h.text)) hong += 1;
			}
		} finally {
			await browser.close();
		}
	}

	if (hong > 0) {
		console.log(
			`E21 DO: ${hong} tieu de cot hong — o 1024px khong tieu de nao duoc phep bi cat; o 768px cho bi cat phai co ba cham va chu day du toi cay tro nang.`,
		);
		process.exit(1);
	}
	console.log("E21 BE RONG 1024px=khong cot nao bi cat · 768px=moi cho cat co ba cham va chu day du");
	process.exit(0);
}

if (chan === "thiet-ke") {
	const d = await gieo(cookie);
	const cd = await bao(cookie, "campaigns.create", {
		name: `Chiến dịch thiết kế ${RUN}`,
		savedViewId: d.gocNhin.id,
	});
	await bao(cookie, "campaigns.start", { id: cd.id });

	let goc;
	try {
		goc = execFileSync(
			"node",
			[
				"scripts/resolve-plugin.mjs",
				"--plugin",
				"acceptance-gate",
				"--require",
				"scripts/design-gate.mjs",
			],
			{ encoding: "utf8" },
		).trim();
	} catch (error) {
		cun(`khong giai duoc duong toi design-gate.mjs — ${error.message}`);
	}
	const cong = `${goc}/scripts/design-gate.mjs`;

	const man = [
		{ ten: "E20-danh-sach.html", duong: DUONG_DS },
		{ ten: "E20-chien-dich.html", duong: duongCd(cd.id) },
	];

	const browser = await moTrinhDuyet(1440, 1000);
	const tep = [];
	try {
		const page = await moTrang(browser, cookie, "vi", 1440, 1000);
		for (const m of man) {
			await di(page, m.duong);
			await choBang(page);
			await cho(800);
			const nhung = await page.evaluate(async () => {
				for (const el of [...document.querySelectorAll("nextjs-portal")]) {
					el.remove();
				}
				const links = [...document.querySelectorAll('link[rel="stylesheet"]')];
				let so = 0;
				for (const link of links) {
					const res = await fetch(link.href);
					if (!res.ok) continue;
					const css = await res.text();
					const style = document.createElement("style");
					style.textContent = css;
					link.replaceWith(style);
					so += 1;
				}
				for (const el of document.querySelectorAll("*")) {
					const cs = getComputedStyle(el);
					el.style.color = cs.color;
					el.style.backgroundColor = cs.backgroundColor;
					el.style.fontSize = cs.fontSize;
					el.style.fontFamily = cs.fontFamily;
					el.style.fontWeight = cs.fontWeight;
				}
				return { links: links.length, nhung: so };
			});
			if (nhung.links > 0 && nhung.nhung !== nhung.links) {
				cun(
					`chi nhung duoc ${nhung.nhung}/${nhung.links} bang kieu vao ban chup — cong thiet ke se cham mot man khong co mau`,
				);
			}
			let html = await page.content();
			if (PHA === "nut-khong-nhan") {
				html = html.replace(
					"</body>",
					'<button><svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 2h12v12H2z"/></svg></button></body>',
				);
			}
			if (PHA === "chu-mo") {
				html = html.replace(
					"</body>",
					'<p style="color:#ffffff;background-color:#ffffff;font-size:16px">Chien dich cua luot nay</p></body>',
				);
			}
			mkdirSync(ANH, { recursive: true });
			writeFileSync(`${ANH}/${m.ten}`, html);
			tep.push(`${ANH}/${m.ten}`);
		}
	} finally {
		await browser.close();
	}

	let xau = 0;
	for (const t of tep) {
		let ra = "";
		let ma = 0;
		try {
			ra = execFileSync(
				"node",
				[cong, t, "--mode", "dom", "--fail-on", "P0", "--jsdom", process.cwd()],
				{ encoding: "utf8" },
			);
		} catch (error) {
			ra = error.stdout ?? "";
			ma = error.status ?? 1;
		}
		let verdict = "KHONG DOC DUOC";
		let phat = [];
		try {
			const j = JSON.parse(ra);
			verdict = j.verdict;
			phat = (j.findings ?? []).filter((f) => f.pTier === "P0");
		} catch {
			cun(`design-gate.mjs khong tra JSON cho ${t}: ${ra.slice(0, 400)}`);
		}
		console.log(`E20 THIET KE ${t} verdict=${verdict}`);
		if (verdict !== "PASS") {
			xau += 1;
			console.log(`   ${JSON.stringify(phat).slice(0, 900)}`);
		}
		if (ma === 3 || ma === 4) {
			cun(`design-gate.mjs khong chay duoc tren ${t} (ma ${ma})`);
		}
	}

	if (xau > 0) {
		console.log(`E20 DO: ${xau}/${tep.length} man khong dat PASS o --fail-on P0`);
		process.exit(1);
	}
	process.exit(0);
}

if (chan === "chu") {
	console.log("-- muoi hai ma trang thai da khai truoc:");
	for (const t of MA_TRANG_THAI) {
		console.log(
			`   ${t.ma.padEnd(28)} ${t.toanCuc ? "do o muc don vi — E25" : t.cach}`,
		);
	}
	const CAN = [
		"ST-danh-sach-loading",
		"ST-danh-sach-empty",
		"ST-tao-khong-goc-nhin",
		"ST-tao-dang-luu",
		"ST-chien-dich-nhap",
		"ST-chien-dich-dang-chay",
		"ST-chien-dich-ket-thuc",
		"ST-thanh-vien-rong",
		"ST-thanh-vien-chua-so",
		"ST-ghi-ket-qua-dang-luu",
		"ST-ghi-ket-qua-loi",
		"ST-so-do-chua-goi",
	];
	const daKhai = new Set(MA_TRANG_THAI.map((t) => t.ma));
	const thieu = CAN.filter((ma) => !daKhai.has(ma));
	if (thieu.length > 0) {
		cun(`danh sach in thieu ma: ${thieu.join(", ")}`);
	}
	if (MA_TRANG_THAI.length !== 12) {
		cun(`danh sach ma trang thai co ${MA_TRANG_THAI.length} muc, khong phai 12`);
	}

	const d = await gieo(cookie);
	const duLieu = new Set([
		...d.nguoi.map((n) => n.ten),
		...d.nguoi.map((n) => n.dienThoai).filter(Boolean),
		...d.nguoi.map((n) => n.diaBan),
		`Sản lượng cao ${RUN}`,
		`Sản lượng ngủ ${RUN}`,
		RUN,
		HO,
	]);
	const doi = await hoi(cookie, "users.list", undefined);
	for (const u of doi) {
		if (u.name) duLieu.add(u.name);
		if (u.email) duLieu.add(u.email);
	}
	const noiLam = await hoi(cookie, "workspace.get", undefined);
	if (noiLam?.name) duLieu.add(noiLam.name);

	const KHONG_DICH = [
		...d.nguoi.map((n) => n.ten),
		...d.nguoi.map((n) => n.dienThoai).filter(Boolean),
		...d.nguoi.map((n) => n.diaBan),
	];

	const chay = async (locale) => {
		const nhanKetQua = KHOA_KET_QUA.map((k) => kho[locale][k]);
		const cd = await bao(cookie, "campaigns.create", {
			name: `Chiến dịch chữ ${locale} ${RUN}`,
			savedViewId: d.gocNhin.id,
			script: `Lời chào ${RUN}`,
		});
		const cdLoi = await bao(cookie, "campaigns.create", {
			name: `Chiến dịch lỗi ${locale} ${RUN}`,
			savedViewId: d.gocNhin.id,
		});
		await bao(cookie, "campaigns.start", { id: cdLoi.id });
		const cdRong = await bao(cookie, "campaigns.create", {
			name: `Chiến dịch rỗng ${locale} ${RUN}`,
			savedViewId: d.gocRong.id,
		});
		duLieu.add(`Chiến dịch chữ ${locale} ${RUN}`);
		duLieu.add(`Chiến dịch lỗi ${locale} ${RUN}`);
		duLieu.add(`Chiến dịch rỗng ${locale} ${RUN}`);
		duLieu.add(`Lời chào ${RUN}`);

		const browser = await moTrinhDuyet(1440, 1000);
		const gom = [];
		const daDung = new Map();
		const khongDung = new Map();
		const khongDich = new Set();
		try {
			const page = await moTrang(browser, cookie, locale, 1440, 1000);
			await page.setRequestInterception(true);
			const cham = chanCham(page);
			const lang = async () => page.evaluate(() => document.documentElement.lang);

			const thu = async (ma) => {
				const chuoi = await page.evaluate(DOC_CHU, PHAM_VI);
				if (chuoi === null || chuoi.length === 0) {
					cun(`${ma}: khong doc duoc chuoi nao trong pham vi ${PHAM_VI.join(" ")}`);
				}
				gom.push(...chuoi);
				daDung.set(ma, chuoi.length);
				const hong = await page.evaluate(DOC_KHONG_DICH, KHONG_DICH);
				for (const v of hong) khongDich.add(`${ma}: ${v}`);
				if (locale === "vi") await chupHinh(page, `E15-${ma}.png`);
			};

			cham.khop = "campaigns.list";
			const chuaXong = di(page, DUONG_DS).catch(() => {});
			let thayLoading = true;
			try {
				await page.waitForFunction(
					(want) => (document.body.textContent ?? "").includes(want),
					{ timeout: 15000 },
					kho[locale]["loading.list"],
				);
			} catch {
				thayLoading = false;
			}
			if (thayLoading) {
				await thu("ST-danh-sach-loading");
			} else {
				khongDung.set(
					"ST-danh-sach-loading",
					`chan mang cham tren campaigns.list khong lam hien "${kho[locale]["loading.list"]}": trang /campaigns nap truoc campaigns.list o may chu (HydrateClient) va staleTime la 30s, nen truy van tren trinh duyet khong bao gio o trang thai pending.`,
				);
			}
			cham.khop = null;
			await chuaXong;
			await cho(600);

			cham.khop = "campaigns.create";
			await di(page, `${DUONG_DS}?new=true`);
			await page.waitForSelector('[data-slot="sheet-content"]', { timeout: CHO_VE });
			await cho(800);
			const oTen = await page.$('[data-slot="sheet-content"] input');
			if (!oTen) cun("hop tao chien dich khong co o nhap ten");
			await oTen.type(`Chiến dịch hộp ${locale} ${RUN}`);
			duLieu.add(`Chiến dịch hộp ${locale} ${RUN}`);
			const oChon = await page.$('[data-slot="sheet-content"] [data-slot="select-trigger"]');
			if (!oChon) cun("hop tao chien dich khong co o chon phan khuc");
			await oChon.click();
			await cho(700);
			const muc = await page.evaluateHandle(
				(ten) =>
					[...document.querySelectorAll('[data-slot="select-item"]')].find((el) =>
						(el.textContent ?? "").includes(ten),
					) ?? null,
				`Sản lượng cao ${RUN}`,
			);
			const mucEl = muc.asElement();
			if (!mucEl) cun(`o chon phan khuc khong co muc "Sản lượng cao ${RUN}"`);
			await mucEl.click();
			await cho(400);
			const nutTao = await nutTheoChu(
				page,
				kho[locale]["create.submit"],
				'[data-slot="sheet-content"]',
			);
			if (!nutTao) cun(`khong thay nut "${kho[locale]["create.submit"]}" trong hop tao`);
			await nutTao.click();
			await page.waitForFunction(
				(want) => (document.body.textContent ?? "").includes(want),
				{ timeout: CHO_VE },
				kho[locale]["create.submitting"],
			);
			await thu("ST-tao-dang-luu");
			cham.khop = null;
			await page.waitForFunction(
				() => /\/campaigns\/[^/?]+/.test(location.pathname),
				{ timeout: CHO_VE },
			);
			await cho(800);

			await di(page, duongCd(cd.id));
			await choBang(page);
			await cho(600);
			if ((await lang()) !== locale) cun(`lang lech: muon ${locale}, man tra ${await lang()}`);
			await thu("ST-chien-dich-nhap");
			await thu("ST-so-do-chua-goi");
			const coChuaSo = await page.evaluate(
				(chuoi) =>
					[
						...document.querySelectorAll(
							'[data-slot="table-body"] [data-slot="table-row"]',
						),
					].some((r) => (r.textContent ?? "").includes(chuoi)),
				kho[locale]["empty.noPhone"],
			);
			if (!coChuaSo) {
				cun(
					`ST-thanh-vien-chua-so: khong dong nao hien "${kho[locale]["empty.noPhone"]}" — du lieu gieo thieu mot ca nhan khong co so`,
				);
			}
			await thu("ST-thanh-vien-chua-so");

			const nutBatDau = await nutTheoChu(
				page,
				kho[locale]["detail.start"],
				'[data-slot="page-shell-actions"]',
			);
			if (!nutBatDau) cun(`trang chien dich khong co nut "${kho[locale]["detail.start"]}"`);
			await nutBatDau.click();
			await page.waitForFunction(
				(want) =>
					[
						...document.querySelectorAll(
							'[data-slot="page-shell-actions"] [data-slot="badge"]',
						),
					].some((b) => (b.textContent ?? "").trim() === want),
				{ timeout: CHO_VE },
				kho[locale]["status.running"],
			);
			await cho(900);
			await thu("ST-chien-dich-dang-chay");

			cham.khop = "campaigns.touch";
			await ghiKetQua(page, 0, nhanKetQua[1]);
			await page.waitForFunction(
				(want) => (document.body.textContent ?? "").includes(want),
				{ timeout: CHO_VE },
				kho[locale]["detail.saving"],
			);
			await thu("ST-ghi-ket-qua-dang-luu");
			cham.khop = null;
			await cho(2500);

			await di(page, duongCd(cdLoi.id));
			await choBang(page);
			await cho(600);
			await bao(cookie, "campaigns.finish", { id: cdLoi.id });
			await ghiKetQua(page, 0, nhanKetQua[0]);
			await page.waitForSelector("[data-sonner-toast]", { timeout: CHO_VE });
			await cho(500);
			await thu("ST-ghi-ket-qua-loi");

			await di(page, duongCd(cd.id));
			await choBang(page);
			const nutKetThuc = await nutTheoChu(
				page,
				kho[locale]["detail.finish"],
				'[data-slot="page-shell-actions"]',
			);
			if (!nutKetThuc) cun(`trang dang chay khong co nut "${kho[locale]["detail.finish"]}"`);
			await nutKetThuc.click();
			await cho(1500);
			await di(page, duongCd(cd.id));
			await choBang(page);
			await cho(700);
			await thu("ST-chien-dich-ket-thuc");

			await di(page, duongCd(cdRong.id));
			await page.waitForFunction(
				(want) => (document.body.textContent ?? "").includes(want),
				{ timeout: CHO_VE },
				kho[locale]["empty.members"],
			);
			await cho(500);
			await thu("ST-thanh-vien-rong");
		} finally {
			await browser.close();
		}
		return { gom, daDung, khongDung, khongDich };
	};

	const banVi = await chay("vi");
	const banEn = await chay("en");

	console.log("-- muoi ma dung tren trinh duyet, so chuoi thu duoc:");
	for (const [ma, so] of banVi.daDung) {
		console.log(`   ${ma.padEnd(28)} vi=${so} en=${banEn.daDung.get(ma) ?? 0}`);
	}
	const chuaDung = new Map([...banVi.khongDung, ...banEn.khongDung]);
	if (chuaDung.size > 0) {
		console.log("-- ma KHONG DUNG DUOC tren trinh duyet:");
		for (const [ma, vi_do] of chuaDung) console.log(`   ${ma}: ${vi_do}`);
	}
	const viDem = dem(banVi.gom);
	const enDem = dem(banEn.gom);
	const duList = [...duLieu];
	const laDuLieu = (s) =>
		duLieu.has(s) || duList.some((v) => v.length > 2 && s.includes(v));
	const dangXet = (s) => !laDuLieu(s) && !CHI_SO.test(s);

	const con = [...viDem.keys()].filter((s) => enDem.has(s) && dangXet(s)).sort();

	console.log(
		`-- chuoi nhin thay: vi=${viDem.size} en=${enDem.size} (${banVi.gom.length}/${banEn.gom.length} lan)`,
	);
	console.log(`-- CON LAI: giong het o ca hai thu tieng, khong phai du lieu (${con.length})`);
	for (const s of con) {
		const khoa = Object.keys(kho.en).filter((k) => kho.en[k] === s);
		console.log(
			`   * ${JSON.stringify(s)}${khoa.length > 0 ? ` ← khoa ${khoa.join(", ")}` : ""}`,
		);
	}
	const hongDich = [...banVi.khongDich, ...banEn.khongDich];
	console.log(`-- DU LIEU SAN KHONG DUOC DANH DAU translate="no" (${hongDich.length})`);
	for (const s of hongDich) console.log(`   * ${s}`);

	if (banVi.daDung.size !== 10) {
		cun(
			`chi dung duoc ${banVi.daDung.size}/10 ma tren trinh duyet — thieu: ${[...chuaDung.keys()].join(", ") || "(khong ro)"}`,
		);
	}

	if (con.length > 0 || hongDich.length > 0) {
		console.log(
			`E15 DO: con lai=${con.length} · thieu translate="no"=${hongDich.length}`,
		);
		process.exit(1);
	}
	console.log(
		`E15 CHU 12ma=khai truoc 10ma=dung tren trinh duyet 2ma=do o muc don vi — E25 trung=0 translate_no=du`,
	);
	process.exit(0);
}

cun(`chan "${chan}" khong co nhanh chay`);
