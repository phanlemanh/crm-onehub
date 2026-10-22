import { mkdirSync, readdirSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { db } from "../../../packages/db/src/index.ts";
import { isMeasureDatabase } from "../../../packages/db/src/measure-database.ts";
import { WORKSPACE_ID } from "../../../packages/db/src/workspace.ts";
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
	NGUOI,
	phien,
	suySlug,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const BANG_CHUNG = (() => {
	const dat =
		process.env.BANG_CHUNG ?? "_acceptance/nhap-truong-luc-tao/evidence";
	return isAbsolute(dat) ? dat : join(GOC, dat);
})();
const DO = {
	choHydrateMs: 1500,
	loiCachO: 24,
	soAnh: 20,
	kho: [
		{ rong: 1280, cao: 800 },
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
const quanTri = await db.user.findUniqueOrThrow({
	where: { email: NGUOI },
	select: { id: true },
});
await db.member.upsert({
	where: {
		organizationId_userId: { organizationId: WORKSPACE_ID, userId: quanTri.id },
	},
	create: {
		id: `member-${quanTri.id}`,
		organizationId: WORKSPACE_ID,
		userId: quanTri.id,
		role: "admin",
		createdAt: new Date(),
	},
	update: { role: "admin" },
});
const slug = await suySlug(cookie);

async function tao(duong, vao) {
	const kq = await goiApiTao(cookie, duong, vao);
	if (kq.loi) await khongDo(`KHONG DO DUOC: ${kq.loi}`);
	return kq.gia;
}

const nguoiRes = await fetch(`${API}/api/trpc/users.list`, {
	headers: mu(cookie),
});
if (!nguoiRes.ok)
	await khongDo(`KHONG DO DUOC: users.list tra ${nguoiRes.status}`);
const toi = (await nguoiRes.json()).result.data[0];
if (!toi) await khongDo("KHONG DO DUOC: khong co nguoi dung nao trong kho do");

const congTy = await tao("companies.create", {
	name: "Công ty ntl",
	domain: "congty-ntl.vn",
	ownerId: toi.id,
});

const NHAN = {
	TEXT: "Chữ ntl",
	DATE: "Ngày ntl",
	USER: "Người ntl",
	URL: "Liên kết ntl",
	NUMBER: "Số ntl",
};
const BAT_BUOC = "Bắt buộc ntl";

for (const entity of ["DEAL", "COMPANY", "CONTACT"]) {
	for (const [type, label] of Object.entries(NHAN)) {
		await tao("fields.create", {
			entity,
			label,
			type,
			agentFilled: false,
			showOnSheet: true,
		});
	}
	await tao("fields.create", {
		entity,
		label: BAT_BUOC,
		type: "TEXT",
		agentFilled: false,
		required: true,
		showOnSheet: true,
	});
}
console.log("gieo cong ty va muoi tam truong tu tao qua API that");

const CAP = {
	DEAL: [
		["Tên", NHAN.TEXT],
		["Ngày chốt", NHAN.DATE],
		["Phụ trách", NHAN.USER],
	],
	COMPANY: [
		["Tên", NHAN.TEXT],
		["Website", NHAN.URL],
		["Phụ trách", NHAN.USER],
	],
	CONTACT: [
		["Tên", NHAN.TEXT],
		["LinkedIn", NHAN.URL],
		["Phụ trách", NHAN.USER],
	],
};

const FORM = [
	{
		ten: "tao-thoa-thuan",
		loai: "DEAL",
		duong: `/${slug}/deals?new=true`,
		chon: "form#create-deal",
	},
	{
		ten: "tao-cong-ty",
		loai: "COMPANY",
		duong: `/${slug}/companies?new=true`,
		chon: "form#create-company",
	},
	{
		ten: "tao-ca-nhan",
		loai: "CONTACT",
		duong: `/${slug}/contacts?new=true`,
		chon: "form#create-contact",
	},
	{
		ten: "them-ca-nhan",
		loai: "CONTACT",
		duong: `/${slug}/companies?record=company:${congTy.id}`,
		mo: ["Cá nhân", "Thêm cá nhân"],
		chon: "[role=dialog] form:has([data-o-tao])",
	},
	{
		ten: "them-thoa-thuan",
		loai: "DEAL",
		duong: `/${slug}/companies?record=company:${congTy.id}`,
		mo: ["Thoả thuận", "Thoả thuận mới"],
		chon: "[role=dialog] form:has([data-o-tao])",
	},
];

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

async function bamChu(chu) {
	let nut = null;
	for (let lan = 0; lan < 20 && !nut; lan += 1) {
		const tay = await trang.evaluateHandle((c) => {
			const dong = (b) => (b.innerText ?? "").trim().split("\n")[0]?.trim();
			return (
				[
					...document.querySelectorAll(
						"[role=dialog] button, [role=dialog] [role=tab]",
					),
				].find((b) => dong(b) === c && b.getBoundingClientRect().width > 0) ??
				null
			);
		}, chu);
		nut = tay.asElement();
		if (!nut) await new Promise((r) => setTimeout(r, 250));
	}
	if (!nut) await khongDo(`KHONG DO DUOC: khong thay nut «${chu}»`);
	await nut.click();
	await new Promise((r) => setTimeout(r, 500));
}

async function moForm(f) {
	await trang.goto(`${APP}${f.duong}`, {
		waitUntil: "domcontentloaded",
		timeout: CHO_TAI,
	});
	const dich = new URL(trang.url()).pathname;
	if (dich.startsWith("/sign-in") || dich.includes("/onboarding"))
		await khongDo(`KHONG DO DUOC: ${f.duong} bi day ve ${dich}`);
	await new Promise((r) => setTimeout(r, DO.choHydrateMs));
	for (const chu of f.mo ?? []) await bamChu(chu);
	await trang
		.waitForFunction(
			(chon, nhan) => {
				const form = document.querySelector(chon);
				return (
					form &&
					!form.hasAttribute("aria-busy") &&
					form.innerText.includes(nhan)
				);
			},
			{ timeout: CHO_TAI },
			f.chon,
			NHAN.TEXT,
		)
		.catch(() => {});
	await new Promise((r) => setTimeout(r, 300));
}

function kiemNhom(form) {
	const o = [...form.querySelectorAll("[data-slot=field]")];
	if (o.length < 2) return false;
	const dau = o[0];
	const cuoi = o[o.length - 1];
	for (const n of form.querySelectorAll(
		"h1,h2,h3,h4,h5,h6,[role=heading],hr,[role=separator]",
	)) {
		const sauDau =
			dau.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING;
		const truocCuoi =
			cuoi.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_PRECEDING;
		if (sauDau && truocCuoi) return true;
	}
	return false;
}

async function docForm(f) {
	return trang.evaluate(
		(chon, cap, batBuoc, kiemNhomSrc) => {
			const kiem = new Function(`return ${kiemNhomSrc}`)();
			const form = document.querySelector(chon);
			if (!form) return { coForm: false };
			const oCua = (nhan) => {
				const l = [...form.querySelectorAll("label")].find(
					(x) => x.textContent?.trim() === nhan,
				);
				return l?.htmlFor ? document.getElementById(l.htmlFor) : null;
			};
			const cotChuan = () =>
				[...form.querySelectorAll("[data-slot=field]")]
					.filter(
						(o) =>
							!(o.querySelector("label")?.textContent ?? "").includes("ntl"),
					)
					.map((o) => o.getBoundingClientRect().left);
			const doLech = () => {
				const ra_ = [];
				const cot = cotChuan();
				for (const [chuan, tuTao] of cap) {
					const a = oCua(chuan);
					const b = oCua(tuTao);
					if (!a || !b) {
						ra_.push(`${chuan}|${tuTao} vang`);
						continue;
					}
					const ra = a.getBoundingClientRect();
					const rb = b.getBoundingClientRect();
					const trongLuoi = cot.some((x) => Math.abs(x - rb.left) <= 1);
					if (
						Math.abs(ra.width - rb.width) > 0.5 ||
						Math.abs(ra.height - rb.height) > 0.5 ||
						getComputedStyle(a).fontSize !== getComputedStyle(b).fontSize ||
						!trongLuoi
					)
						ra_.push(`${chuan}|${tuTao}`);
				}
				return ra_;
			};
			const lech = doLech();
			const thuDich = oCua(cap[0][1]);
			let thuocLechMu = true;
			if (thuDich) {
				const cu = thuDich.style.translate;
				thuDich.style.translate = "37px 0";
				thuocLechMu = doLech().length === 0;
				thuDich.style.translate = cu;
			}
			const oBb = oCua(batBuoc);
			const loiId = oBb?.getAttribute("aria-describedby");
			const loi = loiId ? document.getElementById(loiId) : null;
			let loiCach = null;
			if (oBb && loi) {
				const ro = oBb.getBoundingClientRect();
				const rl = loi.getBoundingClientRect();
				loiCach = rl.top - ro.bottom;
			}
			const doc_ = document.documentElement;
			const ban = form.cloneNode(true);
			const o = ban.querySelectorAll("[data-slot=field]");
			o[0]?.after(document.createElement("h3"));
			return {
				coForm: true,
				lech,
				nhom: kiem(form),
				thuocMu: !kiem(ban) || thuocLechMu,
				loiCach,
				tran: doc_.scrollWidth - doc_.clientWidth,
			};
		},
		f.chon,
		CAP[f.loai],
		BAT_BUOC,
		kiemNhom.toString(),
	);
}

async function bamGui(f) {
	await trang.evaluate((chon) => {
		const form = document.querySelector(chon);
		const nut =
			form?.querySelector("button[type=submit]") ??
			document.querySelector(`button[form="${form?.id}"]`);
		nut?.removeAttribute("disabled");
		form?.requestSubmit();
	}, f.chon);
	await new Promise((r) => setTimeout(r, 500));
}

let thuocMu = false;
for (const f of FORM) {
	for (const kho of DO.kho) {
		await trang.setViewport({ width: kho.rong, height: kho.cao });
		await moForm(f);
		const moi = await docForm(f);
		if (!moi.coForm) await khongDo(`KHONG DO DUOC: khong mo duoc ${f.ten}`);
		if (moi.thuocMu) thuocMu = true;
		await trang.screenshot({
			path: join(BANG_CHUNG, `ntl-${f.ten}-moi-${kho.rong}.png`),
		});
		const nhan = `${f.ten} ${kho.rong}`;
		if (kho.rong >= 768) {
			bao(
				moi.lech.length === 0,
				`DUNG AC-9 ${nhan}: o chuan va o tu tao cung cot, cung co chu`,
				`ntl man: lech ${f.ten} ${moi.lech.join(",")}`,
			);
		}
		bao(
			!moi.nhom,
			`DUNG AC-9 ${nhan}: khong tieu de hay duong phan cach giua cac o`,
			`ntl man: nhom rieng ${f.ten}`,
		);
		bao(
			moi.tran <= 0,
			`DUNG AC-9 ${nhan}: tran ngang 0`,
			`ntl man: 375 cuon ngang ${f.ten} ${moi.tran}px`,
		);

		await bamGui(f);
		const thieu = await docForm(f);
		await trang.screenshot({
			path: join(BANG_CHUNG, `ntl-${f.ten}-thieu-${kho.rong}.png`),
		});
		bao(
			thieu.loiCach !== null &&
				thieu.loiCach >= 0 &&
				thieu.loiCach <= DO.loiCachO,
			`DUNG AC-9 ${nhan}: cau loi ngay duoi o bat buoc (${thieu.loiCach}px)`,
			`ntl man: loi xa o ${f.ten} ${thieu.loiCach}`,
		);
	}
}

if (thuocMu) {
	sai.push("ntl man: thuoc mu");
	console.log("ntl man: thuoc mu");
}

const soAnh = readdirSync(BANG_CHUNG).filter(
	(t) => t.startsWith("ntl-") && t.endsWith(".png"),
).length;
bao(
	soAnh === DO.soAnh,
	`DUNG AC-9: ${soAnh} anh`,
	`ntl man: thieu anh ${soAnh}`,
);

console.log(`anh: ${BANG_CHUNG}`);
console.log(`KET LUAN AC-9: ${dung} DUNG, ${sai.length} SAI`);
console.log(sai.length === 0 ? "ntl man: dat" : sai[0]);
await ket(sai.length === 0 ? 0 : 1);
