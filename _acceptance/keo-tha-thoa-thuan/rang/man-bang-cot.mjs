import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import {
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

const API = process.env.API_URL ?? "http://localhost:3001";

const HERE = dirname(fileURLToPath(import.meta.url));
const BANG_CHUNG = join(HERE, "..", "evidence");
const KHO = [320, 375, 768, 1024, 1440];
const TIENG = ["vi", "en"];
const CAO = 900;
const O_MONG = 10;
const KY_MONG = 34;
const MA = `ktt${Date.now().toString(36)}`;
const GIAI_DOAN = [
	"DEMO_BOOKED",
	"QUALIFIED_TO_BUY",
	"DECISION_MAKER_BOUGHT_IN",
	"CONTRACT_SENT",
	"CLOSED_WON",
	"CLOSED_LOST",
	"UNQUALIFIED_TO_BUY",
];
const GIEO = [
	...Array.from({ length: 4 }, () => "DEMO_BOOKED"),
	...Array.from({ length: 4 }, () => "QUALIFIED_TO_BUY"),
	...Array.from({ length: 4 }, () => "DECISION_MAKER_BOUGHT_IN"),
];
const LOI_HYDRATE = /hydrat/i;
const CHO_HYDRATE_MS = 1000;

mkdirSync(BANG_CHUNG, { recursive: true });

const cay = await canhCay();
if (cay.ket !== "dung-cay") await khongDo(...cay.dong);

const cookie = phien();
const slug = await suySlug(cookie);

async function doc(duong, vao) {
	const q =
		vao === undefined
			? ""
			: `?input=${encodeURIComponent(JSON.stringify(vao))}`;
	const res = await fetch(`${API}/api/trpc/${duong}${q}`, {
		headers: mu(cookie),
	});
	const chu = await res.text();
	if (!res.ok)
		return { loi: `${duong} tra ${res.status}: ${chu.slice(0, 160)}` };
	return { gia: JSON.parse(chu).result.data };
}

const toiDoc = await doc("users.me");
if (toiDoc.loi) await khongDo(`KHONG DO DUOC: tien de thieu — ${toiDoc.loi}`);
const toi = toiDoc.gia;
const congTy = await goiApiTao(cookie, "companies.create", {
	name: `Cong ty do ${MA}`,
});
if (congTy.loi) await khongDo(`KHONG DO DUOC: tien de thieu — ${congTy.loi}`);

const daGieo = [];
async function donDep() {
	if (daGieo.length > 0) {
		await goiApiTao(cookie, "deals.bulkArchive", { ids: daGieo });
		await goiApiTao(cookie, "deals.bulkPurge", { ids: daGieo });
	}
	await goiApiTao(cookie, "companies.bulkArchive", { ids: [congTy.gia.id] });
	await goiApiTao(cookie, "companies.bulkPurge", { ids: [congTy.gia.id] });
}

async function dung(...dong) {
	await donDep();
	await khongDo(...dong);
}

for (const [i, stage] of GIEO.entries()) {
	const tao = await goiApiTao(cookie, "deals.create", {
		name: `${MA} ${String(i).padStart(2, "0")}`,
		companyId: congTy.gia.id,
		ownerId: toi.id,
		stage,
		amountCents: (i + 1) * 100_000,
	});
	if (tao.loi) await dung(`KHONG DO DUOC: tien de thieu — ${tao.loi}`);
	daGieo.push(tao.gia.id);
}

const trinhDuyet = await puppeteer.launch({
	executablePath: CHROME,
	headless: true,
});
datTrinhDuyet(trinhDuyet);

async function moTrang(tieng, rong) {
	const trang = await trinhDuyet.newPage();
	const loi = [];
	trang.on("pageerror", (e) => {
		if (LOI_HYDRATE.test(String(e))) loi.push(String(e));
	});
	trang.on("console", (m) => {
		if (m.type() === "error" && LOI_HYDRATE.test(m.text())) loi.push(m.text());
	});
	await trang.setViewport({ width: rong, height: CAO });
	const host = new URL(APP).hostname;
	await trang.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: tieng, domain: host, path: "/" },
	);
	await trang.goto(`${APP}/${slug}/deals?view=board&q=${MA}`, {
		waitUntil: "load",
		timeout: CHO_TAI,
	});
	const hien = await trang
		.waitForSelector('[data-board-column="DEMO_BOOKED"] [data-board-card]', {
			timeout: CHO_TAI,
			visible: true,
		})
		.catch(() => null);
	if (!hien) {
		await dung(
			`KHONG DO DUOC: ${rong}/${tieng} bang cot khong hien ra trong ${CHO_TAI}ms (con nam trong khoi Suspense an)`,
		);
	}
	await trang
		.waitForNetworkIdle({ idleTime: 500, timeout: CHO_TAI })
		.catch(() => null);
	await new Promise((r) => setTimeout(r, CHO_HYDRATE_MS));
	return { trang, loi };
}

function docBang() {
	const cot = [...document.querySelectorAll("[data-board-column]")];
	return {
		tran: document.documentElement.scrollWidth > innerWidth + 1,
		cuonDuoc: (() => {
			const khung = document.querySelector("section[aria-label]");
			if (!khung) return false;
			if (khung.scrollWidth <= khung.clientWidth + 1) return true;
			return ["auto", "scroll"].includes(getComputedStyle(khung).overflowX);
		})(),
		motHang:
			new Set(cot.map((c) => Math.round(c.getBoundingClientRect().top)))
				.size === 1,
		cot: cot.map((c) => {
			const h3 = c.querySelector("h3");
			const dong = h3
				? [...h3.children].map((x) => x.textContent?.trim() ?? "")
				: [];
			return {
				id: c.getAttribute("data-board-column"),
				the: [...c.querySelectorAll("[data-board-card]")].map((x) =>
					x.getAttribute("data-board-card"),
				),
				dong,
			};
		}),
	};
}

async function keo(trang, theId, denCot) {
	const tay = await trang.$(
		`[data-board-card="${theId}"] [data-slot="kanban-item-handle"]`,
	);
	const dich = await trang.$(`[data-board-column="${denCot}"]`);
	if (!tay || !dich) return false;
	await dich.evaluate((el) => el.scrollIntoView({ inline: "center" }));
	await tay.evaluate((el) =>
		el.scrollIntoView({ inline: "nearest", block: "center" }),
	);
	const a = await tay.boundingBox();
	const b = await dich.boundingBox();
	if (!a || !b) return false;
	await trang.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
	await trang.mouse.down();
	await trang.mouse.move(b.x + b.width / 2, b.y + Math.min(b.height / 2, 160), {
		steps: 30,
	});
	await new Promise((r) => setTimeout(r, 200));
	await trang.mouse.up();
	await new Promise((r) => setTimeout(r, 1500));
	return true;
}

let khang = 0;
let o = 0;
const hong = [];

for (const tieng of TIENG) {
	for (const rong of KHO) {
		const { trang, loi } = await moTrang(tieng, rong);
		const d = await trang.evaluate(docBang);
		o += 1;
		if (d.cot.length !== GIAI_DOAN.length) {
			await dung(
				`KHONG DO DUOC: ${rong}/${tieng} chi thay ${d.cot.length} cot — bang cot chua dung`,
			);
		}
		if (d.tran || !d.cuonDuoc) {
			hong.push(`bang khong cuon duoc hoac tran trang ${rong}/${tieng}`);
		}
		khang += 1;
		const thieuDau = d.cot.filter(
			(c) =>
				c.dong.length !== 2 ||
				c.dong[0].length === 0 ||
				!/\d/.test(c.dong[0]) ||
				!/\d/.test(c.dong[1]),
		);
		if (thieuDau.length > 0) {
			hong.push(
				`dau cot thieu ten/dem/tong ${rong}/${tieng}: ${thieuDau.map((c) => c.id).join(",")}`,
			);
		}
		khang += 1;
		if (!d.motHang) hong.push(`bay cot khong cung mot hang ${rong}/${tieng}`);
		khang += 1;
		if (loi.length > 0) hong.push(`loi hydrate ${rong}/${tieng}`);
		await trang.screenshot({
			path: join(BANG_CHUNG, `E14-bang-cot-${rong}-${tieng}.png`),
		});
		await trang.close();
	}
}

const { trang } = await moTrang("vi", 1440);
const truoc = await trang.evaluate(docBang);
const theDoi = truoc.cot.find((c) => c.id === "DEMO_BOOKED")?.the[0];
if (!theDoi) {
	await dung("KHONG DO DUOC: cot DEMO_BOOKED khong co the de keo");
}
await keo(trang, theDoi, "QUALIFIED_TO_BUY");
const sauTha = await trang.evaluate(docBang);
khang += 1;
if (
	!sauTha.cot.find((c) => c.id === "QUALIFIED_TO_BUY")?.the.includes(theDoi)
) {
	hong.push("keo chuot: the khong o cot Qualified to buy sau khi tha");
}
await trang.reload({ waitUntil: "load" });
await trang
	.waitForSelector("[data-board-card]", { timeout: CHO_TAI, visible: true })
	.catch(() => null);
const sauTai = await trang.evaluate(docBang);
khang += 1;
const byId1 = (await doc("deals.byId", { id: theDoi })).gia ?? {};
if (
	!sauTai.cot.find((c) => c.id === "QUALIFIED_TO_BUY")?.the.includes(theDoi) ||
	byId1.stage !== "QUALIFIED_TO_BUY"
) {
	hong.push(`tai lai: the khong o cot moi (may chu: ${byId1.stage})`);
}
await trang.screenshot({ path: join(BANG_CHUNG, "E14-sau-khi-keo.png") });

const theRong = sauTai.cot.find((c) => c.id === "DECISION_MAKER_BOUGHT_IN")
	?.the[0];
await keo(trang, theRong, "CONTRACT_SENT");
const sauRong = await trang.evaluate(docBang);
khang += 1;
if (!sauRong.cot.find((c) => c.id === "CONTRACT_SENT")?.the.includes(theRong)) {
	hong.push("cot rong khong nhan tha");
}
khang += 1;
const byId2 = (await doc("deals.byId", { id: theRong })).gia ?? {};
if (byId2.stage !== "CONTRACT_SENT") {
	hong.push(`cot rong: may chu ghi ${byId2.stage} thay vi CONTRACT_SENT`);
}
await trang.screenshot({ path: join(BANG_CHUNG, "E14-tha-cot-rong.png") });
await trang.close();

await donDep();

console.log(`o=${o}/${O_MONG} khang-dinh=${khang}/${KY_MONG}`);
if (o !== O_MONG || khang !== KY_MONG) {
	await khongDo(
		`KHONG DO DUOC: ma tran lech ban khai — o=${o} khang-dinh=${khang}`,
	);
}
for (const h of hong) console.log(`HONG ${h}`);
await ket(hong.length === 0 ? 0 : 1);
