import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { isMeasureDatabase } from "../../../packages/db/src/measure-database.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import {
	API,
	APP,
	CHO_TAI,
	CHROME,
	datTrinhDuyet,
	goiApiTao,
	ket,
	khongDo,
	mu,
	phien,
	suySlug,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const BANG_CHUNG = (() => {
	const dat = process.env.BANG_CHUNG ?? "_acceptance/truong-mot-cach-cu-xu/evidence";
	return isAbsolute(dat) ? dat : join(GOC, dat);
})();
const DO = {
	choHydrateMs: 1500,
	kho: [
		{ rong: 1280, cao: 900 },
		{ rong: 375, cao: 812 },
	],
};

const tenKho = (() => {
	try {
		return new URL(process.env.DATABASE_URL ?? "").pathname.replace(/^\//, "");
	} catch {
		return "";
	}
})();
if (!isMeasureDatabase(tenKho))
	await khongDo(
		`KHONG DO DUOC: can mot phien do (kho _do) — kho "${tenKho}". Chay qua scripts/lan-do/tien-de.mjs`,
	);

const cay = await canhCay();
if (cay.ket !== "dung-cay") await khongDo(...cay.dong);

const cookie = phien();
const slug = await suySlug(cookie);

async function tao(duong, vao) {
	const kq = await goiApiTao(cookie, duong, vao);
	if (kq.loi) await khongDo(`KHONG DO DUOC: ${kq.loi}`);
	return kq.gia;
}

async function nguoiDung() {
	const res = await fetch(`${API}/api/trpc/users.list`, {
		headers: mu(cookie),
	});
	if (!res.ok) await khongDo(`KHONG DO DUOC: users.list tra ${res.status}`);
	return (await res.json()).result.data;
}

const NHAN = {
	TEXT: "Chữ tmc",
	LONG_TEXT: "Ghi chú tmc",
	NUMBER: "Số tmc",
	DATE: "Ngày tmc",
	CHECKBOX: "Ô tích tmc",
	SELECT: "Chọn tmc",
	URL: "Liên kết tmc",
	EMAIL: "Email tmc",
	PHONE: "Điện thoại tmc",
	USER: "Người tmc",
};

const nguoi = await nguoiDung();
const toi = nguoi[0];
if (!toi) await khongDo("KHONG DO DUOC: khong co nguoi dung nao trong kho do");

async function gieoTruong(entity) {
	const truong = {};
	for (const [type, label] of Object.entries(NHAN)) {
		truong[type] = await tao("fields.create", {
			entity,
			label,
			type,
			options: type === "SELECT" ? [{ label: "Vàng" }, { label: "Bạc" }] : [],
			agentFilled: false,
			showOnSheet: true,
			showOnTable: true,
		});
	}
	return {
		[truong.TEXT.key]: "Hợp đồng khung",
		[truong.LONG_TEXT.key]: "Khách cần báo giá trước ngày ký.",
		[truong.NUMBER.key]: 1234.5,
		[truong.DATE.key]: "2026-11-15",
		[truong.CHECKBOX.key]: true,
		[truong.SELECT.key]: truong.SELECT.options[0].id,
		[truong.URL.key]: "onehub.vn",
		[truong.EMAIL.key]: "lienhe@onehub.vn",
		[truong.PHONE.key]: "0901234567",
		[truong.USER.key]: toi.id,
	};
}

const congTy = await tao("companies.create", {
	name: "Công ty tmc",
	domain: "congty-tmc.vn",
});
await tao("companies.update", {
	id: congTy.id,
	data: {
		website: "congty-tmc.vn",
		phone: "0912345678",
		email: "hello@congty-tmc.vn",
		city: "Hà Nội",
		ownerId: toi.id,
		fields: await gieoTruong("COMPANY"),
	},
});
const lienHe = await tao("contacts.create", {
	firstName: "Lan",
	lastName: "Phạm",
	email: "lan@congty-tmc.vn",
	phone: "0987654321",
	title: "Giám đốc",
	companyId: congTy.id,
	ownerId: toi.id,
});
await tao("contacts.update", {
	id: lienHe.id,
	data: {
		linkedinUrl: "linkedin.com/in/lan-tmc",
		fields: await gieoTruong("CONTACT"),
	},
});
const thoaThuan = await tao("deals.create", {
	name: "Thoả thuận tmc",
	companyId: congTy.id,
	ownerId: toi.id,
	amountCents: 1500000000,
	currency: "VND",
	expectedCloseDate: "2026-12-01",
});
await tao("deals.update", {
	id: thoaThuan.id,
	data: {
		description: "Thoả thuận đo một trường một cách cư xử.",
		fields: await gieoTruong("DEAL"),
	},
});
console.log("gieo ba ban ghi va ba muoi truong tu tao qua API that");

mkdirSync(BANG_CHUNG, { recursive: true });

const trinhDuyet = await puppeteer.launch({
	executablePath: CHROME,
	headless: true,
});
datTrinhDuyet(trinhDuyet);
const host = new URL(APP).hostname;
const trang = await trinhDuyet.newPage();
await trang.setCookie(
	{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
	{ name: "lang", value: "vi", domain: host, path: "/" },
);

const sai = [];
let dung = 0;
function bao(dat, dongDung, dongSai) {
	if (dat) {
		dung += 1;
		console.log(dongDung);
	} else {
		sai.push(dongSai);
		console.log(dongSai);
	}
}

async function mo(duong, cho) {
	await trang.goto(`${APP}${duong}`, {
		waitUntil: "domcontentloaded",
		timeout: CHO_TAI,
	});
	const dich = new URL(trang.url()).pathname;
	if (dich.startsWith("/sign-in") || dich.includes("/onboarding"))
		await khongDo(`KHONG DO DUOC: ${duong} bi day ve ${dich}`);
	await trang
		.waitForFunction(
			(chu) => document.body.innerText.includes(chu),
			{ timeout: CHO_TAI },
			cho,
		)
		.catch(() => {});
	await new Promise((r) => setTimeout(r, DO.choHydrateMs));
}

const PHIEU = [
	{
		ten: "thoa-thuan",
		duong: `/${slug}/deals?record=deal:${thoaThuan.id}`,
	},
	{
		ten: "cong-ty",
		duong: `/${slug}/companies?record=company:${congTy.id}`,
	},
	{
		ten: "lien-he",
		duong: `/${slug}/contacts?record=contact:${lienHe.id}`,
	},
];

async function docPhieu(nhan) {
	return trang.evaluate((N) => {
		const hang = (chu) => {
			const l = [...document.querySelectorAll("label")].find(
				(x) => x.textContent?.trim() === chu,
			);
			return l?.parentElement ?? null;
		};
		const so = hang(N.NUMBER);
		const lienKet = [N.URL, N.EMAIL, N.PHONE].map(
			(c) => hang(c)?.querySelectorAll("a[href]").length ?? 0,
		);
		const tuTao = Object.values(N).map(hang).filter(Boolean);
		const chaTuTao = new Set(tuTao.map((h) => h.parentElement));
		const nhanChuan = [...document.querySelectorAll("label")].filter(
			(l) => !Object.values(N).includes(l.textContent?.trim() ?? ""),
		);
		const chaChuan = nhanChuan
			.map((l) => l.parentElement?.parentElement)
			.find((p) => p && chaTuTao.has(p));
		let ngan = false;
		if (chaChuan) {
			for (const con of chaChuan.children) {
				if (
					con.matches("h1,h2,h3,h4,h5,h6,[role=heading],hr,[role=separator]")
				)
					ngan = true;
			}
		}
		const doc_ = document.documentElement;
		return {
			so: so?.innerText ?? null,
			lienKet,
			soTuTao: tuTao.length,
			cungCha: chaTuTao.size === 1 && Boolean(chaChuan),
			ngan,
			tran: doc_.scrollWidth - doc_.clientWidth,
		};
	}, nhan);
}

for (const p of PHIEU) {
	for (const kho of DO.kho) {
		await trang.setViewport({ width: kho.rong, height: kho.cao });
		await mo(p.duong, NHAN.NUMBER);
		const d = await docPhieu(NHAN);
		const anh = `tmc-phieu-${p.ten}-${kho.rong}.png`;
		await trang.screenshot({ path: join(BANG_CHUNG, anh), fullPage: false });
		const nhan = `${p.ten} ${kho.rong}`;
		if (kho.rong >= 768) {
			bao(
				d.so?.includes("1.234,5") === true,
				`DUNG AC-9 ${nhan}: Số tmc hien 1.234,5`,
				`tmc man: so ${d.so}`,
			);
			bao(
				d.lienKet.reduce((a, b) => a + b, 0) === 3,
				`DUNG AC-9 ${nhan}: ba hang lien ket co the a`,
				`tmc man: lien ket ${d.lienKet.join("+")}`,
			);
			bao(
				d.soTuTao === Object.keys(NHAN).length && d.cungCha && !d.ngan,
				`DUNG AC-9 ${nhan}: ${d.soTuTao} hang tu tao cung luoi voi truong chuan`,
				`tmc man: khoi rieng ${p.ten} (${d.soTuTao} hang, cung cha ${d.cungCha}, ngan ${d.ngan})`,
			);
		} else {
			bao(
				d.tran <= 0,
				`DUNG AC-9 ${nhan}: tran ngang 0`,
				`tmc man: 375 cuon ngang ${p.ten} ${d.tran}px`,
			);
		}
	}
}

const BANG = [
	{ ten: "thoa-thuan", duong: `/${slug}/deals` },
	{ ten: "cong-ty", duong: `/${slug}/companies` },
	{ ten: "lien-he", duong: `/${slug}/contacts` },
];
await trang.setViewport({ width: 1280, height: 900 });
for (const b of BANG) {
	await mo(b.duong, NHAN.NUMBER);
	const coSo = await trang.evaluate(() =>
		[...document.querySelectorAll("td .tabular-nums")].some(
			(o) => o.textContent === "1.234,5",
		),
	);
	await trang.screenshot({ path: join(BANG_CHUNG, `tmc-bang-${b.ten}-1280.png`) });
	bao(
		coSo,
		`DUNG AC-9 bang ${b.ten}: cot Số tmc hien 1.234,5`,
		`tmc man: bang ${b.ten} khong hien 1.234,5`,
	);
}

console.log(`anh: ${BANG_CHUNG}`);
console.log(`KET LUAN AC-9: ${dung} DUNG, ${sai.length} SAI`);
console.log(sai.length === 0 ? "tmc man: dat" : sai[0]);
await ket(sai.length === 0 ? 0 : 1);
