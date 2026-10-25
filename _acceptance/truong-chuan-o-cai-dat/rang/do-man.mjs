import { mkdirSync } from "node:fs";
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
		process.env.BANG_CHUNG ?? "_acceptance/truong-chuan-o-cai-dat/evidence";
	return isAbsolute(dat) ? dat : join(GOC, dat);
})();
const DO = {
	choHydrateMs: 1500,
	choLuuMs: 1500,
	buocKeo: 12,
	kho: [
		{ rong: 1280, cao: 900 },
		{ rong: 375, cao: 812 },
	],
};
const HANG = "Hạng đối tác";
const NHAN = {
	ngayChot: "Ngày chốt",
	thanhPho: "Thành phố",
	reorder: (nhan) => `Đổi thứ tự ${nhan}`,
	congTac: (nhan) => `Hiện ${nhan} trên hồ sơ`,
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
await db.standardFieldLayout.deleteMany({});
const slug = await suySlug(cookie);

async function tao(duong, vao) {
	const kq = await goiApiTao(cookie, duong, vao);
	if (kq.loi) await khongDo(`KHONG DO DUOC: ${kq.loi}`);
	return kq.gia;
}

async function boTri(entity) {
	const res = await fetch(
		`${API}/api/trpc/fields.layout?input=${encodeURIComponent(JSON.stringify({ entity }))}`,
		{ headers: mu(cookie) },
	);
	if (!res.ok) await khongDo(`KHONG DO DUOC: fields.layout tra ${res.status}`);
	return (await res.json()).result.data;
}

const congTy = await tao("companies.create", {
	name: "Công ty tcc",
	domain: "congty-tcc.vn",
});
await tao("companies.update", {
	id: congTy.id,
	data: { city: "Đà Nẵng", phone: "0912345678", email: "hello@congty-tcc.vn" },
});
const thoaThuan = await tao("deals.create", {
	name: "Thoả thuận tcc",
	companyId: congTy.id,
	ownerId: quanTri.id,
	amountCents: 1500000000,
	currency: "VND",
	expectedCloseDate: "2026-12-01",
});
const hang = await tao("fields.create", {
	entity: "DEAL",
	label: HANG,
	type: "TEXT",
	agentFilled: false,
	showOnSheet: true,
});
await tao("deals.update", {
	id: thoaThuan.id,
	data: { fields: { [hang.key]: "Vàng" } },
});
console.log("gieo cong ty, thoa thuan va truong Hang doi tac qua API that");

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

const caiDat = (kind) => `/${slug}/settings/fields?thucThe=${kind}`;

async function hopCua(nhanAn) {
	return trang.evaluate((chu) => {
		const nut = [...document.querySelectorAll("button")].find(
			(b) => b.querySelector(".sr-only")?.textContent === chu,
		);
		const r = nut?.getBoundingClientRect();
		return r ? { x: r.x + r.width / 2, y: r.y + r.height / 2 } : null;
	}, nhanAn);
}

await trang.setViewport({ width: 1280, height: 900 });
await mo(caiDat("deal"), HANG);
const tay = await hopCua(NHAN.reorder(HANG));
const dich = await hopCua(NHAN.reorder(NHAN.ngayChot));
if (!tay || !dich) await khongDo("KHONG DO DUOC: khong thay tay keo");
await trang.mouse.move(tay.x, tay.y);
await trang.mouse.down();
for (let i = 1; i <= DO.buocKeo; i += 1) {
	await trang.mouse.move(
		tay.x,
		tay.y + ((dich.y - 6 - tay.y) * i) / DO.buocKeo,
	);
	await new Promise((r) => setTimeout(r, 40));
}
await trang.mouse.up();
await new Promise((r) => setTimeout(r, DO.choLuuMs));

const boTriThoaThuan = await boTri("DEAL");
const iHang = boTriThoaThuan.findIndex((m) => m.key === hang.key);
bao(
	boTriThoaThuan[iHang + 1]?.key === "expectedCloseDate",
	"DUNG AC-2 chuot: Hang doi tac dung ngay tren Ngay chot",
	"tcc man: chuot khong luu thu tu",
);

await mo(caiDat("company"), NHAN.thanhPho);
await trang.evaluate((ten) => {
	const ct = [...document.querySelectorAll("[role=switch]")].find(
		(s) => s.getAttribute("aria-label") === ten,
	);
	ct?.scrollIntoView({ block: "center" });
}, NHAN.congTac(NHAN.thanhPho));
const ctHop = await trang.evaluate((ten) => {
	const ct = [...document.querySelectorAll("[role=switch]")].find(
		(s) => s.getAttribute("aria-label") === ten,
	);
	const r = ct?.getBoundingClientRect();
	return r ? { x: r.x + r.width / 2, y: r.y + r.height / 2 } : null;
}, NHAN.congTac(NHAN.thanhPho));
if (!ctHop) await khongDo("KHONG DO DUOC: khong thay cong tac Thanh pho");
await trang.mouse.click(ctHop.x, ctHop.y);
await new Promise((r) => setTimeout(r, DO.choLuuMs));
const city = (await boTri("COMPANY")).find((m) => m.key === "city");
bao(
	city?.hidden === true,
	"DUNG AC-3 chuot: Thanh pho da an",
	"tcc man: chuot khong luu an",
);

async function docCaiDat() {
	return trang.evaluate((ten) => {
		const ds = document.querySelectorAll("[data-muc-keo]");
		const cha = new Set([...ds].map((x) => x.parentElement?.parentElement));
		const gap = [...document.querySelectorAll("[data-state]")].some(
			(x) => x.textContent?.includes("Trường chuẩn") && x.matches("button"),
		);
		const ct = [...document.querySelectorAll("[role=switch]")].find(
			(s) => s.getAttribute("aria-label") === ten,
		);
		const goc_ = document.documentElement;
		return {
			soDanhSach: cha.size,
			gap,
			anThanhPho: ct?.getAttribute("aria-checked") ?? null,
			tran: goc_.scrollWidth - goc_.clientWidth,
		};
	}, NHAN.congTac(NHAN.thanhPho));
}

for (const [kind, ten] of [
	["deal", "thoa-thuan"],
	["company", "cong-ty"],
]) {
	for (const kho of DO.kho) {
		await trang.setViewport({ width: kho.rong, height: kho.cao });
		await mo(caiDat(kind), kind === "deal" ? HANG : NHAN.thanhPho);
		const d = await docCaiDat();
		await trang.screenshot({
			path: join(BANG_CHUNG, `tcc-cai-dat-${ten}-${kho.rong}.png`),
		});
		if (kho.rong >= 768) {
			bao(
				d.soDanhSach === 1,
				`DUNG AC-9 cai dat ${ten}: mot danh sach`,
				`tcc man: so danh sach ${d.soDanhSach}`,
			);
			bao(
				!d.gap,
				`DUNG AC-9 cai dat ${ten}: khong khoi gap`,
				"tcc man: khoi gap",
			);
			if (kind === "company")
				bao(
					d.anThanhPho === "false",
					"DUNG AC-3 cai dat: cong tac Thanh pho tat",
					"tcc man: an khong luu",
				);
		} else {
			bao(
				d.tran <= 0,
				`DUNG AC-9 cai dat ${ten} 375: tran ngang 0`,
				`tcc man: 375 cuon ngang ${ten}`,
			);
		}
	}
}

const PHIEU = [
	{
		ten: "thoa-thuan",
		duong: `/${slug}/deals?record=deal:${thoaThuan.id}`,
		cho: HANG,
	},
	{
		ten: "cong-ty",
		duong: `/${slug}/companies?record=company:${congTy.id}`,
		cho: "Công ty tcc",
	},
];

async function nhanPhieu() {
	return trang.evaluate(() => {
		const dung = (x) => x.parentElement?.firstElementChild === x;
		return [...document.querySelectorAll("[role=dialog] label")]
			.filter(dung)
			.map((x) => x.textContent?.trim() ?? "");
	});
}

for (const p of PHIEU) {
	for (const kho of DO.kho) {
		await trang.setViewport({ width: kho.rong, height: kho.cao });
		await mo(p.duong, p.cho);
		const nhan = await nhanPhieu();
		await trang.screenshot({
			path: join(BANG_CHUNG, `tcc-phieu-${p.ten}-${kho.rong}.png`),
		});
		const tran = await trang.evaluate(
			() =>
				document.documentElement.scrollWidth -
				document.documentElement.clientWidth,
		);
		if (kho.rong < 768) {
			bao(
				tran <= 0,
				`DUNG AC-9 phieu ${p.ten} 375: tran ngang 0`,
				`tcc man: 375 cuon ngang phieu ${p.ten}`,
			);
			continue;
		}
		if (p.ten === "thoa-thuan") {
			const i = nhan.indexOf(HANG);
			bao(
				i >= 0 && nhan[i + 1] === NHAN.ngayChot,
				"DUNG AC-2 phieu: Hang doi tac ngay tren Ngay chot",
				`tcc man: thu tu ${JSON.stringify(nhan)}`,
			);
		} else {
			bao(
				!nhan.includes(NHAN.thanhPho),
				"DUNG AC-3 phieu: khong con hang Thanh pho",
				"tcc man: phieu con thanh pho",
			);
		}
	}
}

await db.standardFieldLayout.deleteMany({});
console.log(`anh: ${BANG_CHUNG}`);
console.log(`KET LUAN AC-9: ${dung} DUNG, ${sai.length} SAI`);
console.log(sai.length === 0 ? "tcc man: dat" : sai[0]);
await ket(sai.length === 0 ? 0 : 1);
