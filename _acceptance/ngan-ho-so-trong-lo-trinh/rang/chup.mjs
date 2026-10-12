import { spawn } from "node:child_process";
import { mkdirSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const hoSo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const goc = resolve(hoSo, "../..");
const slug = "ngan-ho-so-trong-lo-trinh";
const thietKe = process.argv.includes("--thiet-ke");
const ra = join(hoSo, thietKe ? "evidence/design-pass" : "evidence");
mkdirSync(ra, { recursive: true });

const KHO = {
	1280: { ten: thietKe ? "desktop-1280" : "1280", w: 1280, h: 900 },
	375: { ten: thietKe ? "mobile-375" : "375", w: 375, h: 812 },
};

const MA_TRAN = thietKe
	? ["light", "dark"].flatMap((nen) =>
			["1280", "375"].flatMap((kho) =>
				[
					"ST-ngan-day-du",
					"ST-ngan-chu-kho",
					"ST-ngan-o-vang",
					"ST-ngan-chua-co-tom-tat",
					"ST-ngan-khuon-cu",
					"ST-ngan-doan-dai",
				].map((state) => ({
					state,
					kho,
					nen: nen === "light" ? "sang" : "toi",
				})),
			),
		)
	: [
			{ state: "ST-ngan-day-du", kho: "1280", nen: "sang" },
			{ state: "ST-ngan-day-du", kho: "375", nen: "sang" },
			{ state: "ST-ngan-chu-kho", kho: "1280", nen: "sang" },
			{ state: "ST-ngan-chu-kho", kho: "375", nen: "sang" },
			{ state: "ST-ngan-doan-dai", kho: "375", nen: "sang" },
			{ state: "ST-ngan-o-vang", kho: "1280", nen: "sang" },
			{ state: "ST-ngan-day-du", kho: "1280", nen: "toi" },
			{ state: "ST-ngan-chu-kho", kho: "375", nen: "toi" },
		];

function congTrong() {
	return new Promise((ok, hong) => {
		const s = createServer();
		s.once("error", hong);
		s.listen(0, "127.0.0.1", () => {
			const cong = s.address().port;
			s.close(() => ok(cong));
		});
	});
}

async function choMo(url, giay) {
	const het = Date.now() + giay * 1000;
	while (Date.now() < het) {
		try {
			const r = await fetch(url);
			if (r.ok) return true;
		} catch {}
		await new Promise((ok) => setTimeout(ok, 1500));
	}
	return false;
}

function ketLuan(ma, cau) {
	console.log(`KET LUAN ma ${ma}${cau ? ` — ${cau}` : ""}`);
	process.exit(ma);
}

const bun = join(goc, "node_modules/.bun");
const thuMuc = readdirSync(bun).find((t) => t.startsWith("puppeteer-core@"));
if (!thuMuc) ketLuan(2, "khong tim thay puppeteer-core trong node_modules");
const goi = join(bun, thuMuc, "node_modules/puppeteer-core");
const puppeteer = createRequire(join(goi, "package.json"))(goi);

let may = null;
let coSo = process.env.PROTO_URL ?? null;
if (coSo === null) {
	const cong = await congTrong();
	coSo = `http://localhost:${cong}`;
	may = spawn("bun", ["run", "dev"], {
		cwd: join(goc, "apps/app"),
		env: {
			...process.env,
			PROTO_ROUTE: "1",
			PORT: String(cong),
			APP_URL: coSo,
			PROTO_DIST_DIR: ".next-proto-do",
		},
		stdio: "ignore",
		detached: true,
	});
}
const tat = () => {
	if (may?.pid) {
		try {
			process.kill(-may.pid, "SIGTERM");
		} catch {}
	}
};
process.on("exit", tat);
for (const tin of ["SIGINT", "SIGTERM"])
	process.on(tin, () => {
		tat();
		process.exit(130);
	});

if (!(await choMo(`${coSo}/proto/${slug}?state=ST-ngan-day-du`, 240)))
	ketLuan(2, `khong mo duoc ${coSo}/proto/${slug} — ban mau chua chay`);

const trinh = await puppeteer.launch({
	executablePath:
		"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	headless: true,
});
const trang = await trinh.newPage();
await trang.setCookie({ name: "lang", value: "vi", url: coSo });
let sai = 0;
const bang = [];

for (const o of MA_TRAN) {
	const k = KHO[o.kho];
	await trang.emulateMediaFeatures([
		{
			name: "prefers-color-scheme",
			value: o.nen === "sang" ? "light" : "dark",
		},
	]);
	await trang.setViewport({ width: k.w, height: k.h });
	const r = await trang.goto(`${coSo}/proto/${slug}?state=${o.state}`, {
		waitUntil: "networkidle0",
	});
	if (!r?.ok()) {
		sai++;
		console.log(`SAI ${o.state} ${k.ten} ${o.nen} — trang tra ${r?.status()}`);
		continue;
	}
	await trang
		.waitForSelector("[data-lo-trinh-chi-tiet-viec]", { timeout: 20000 })
		.catch(() => null);
	await trang.evaluate(() => {
		for (const s of [
			"nextjs-portal",
			".tsqd-parent-container",
			".tsqd-open-btn-container",
		])
			for (const el of document.querySelectorAll(s)) el.remove();
	});
	await new Promise((ok) => setTimeout(ok, 500));
	if (o.state === "ST-ngan-chu-kho") {
		const the = await trang.$$('[data-lo-trinh-chi-tiet-viec] [role="tab"]');
		for (const t of the)
			if ((await t.evaluate((e) => e.textContent?.trim())) === "Số liệu")
				await t.click();
		await new Promise((ok) => setTimeout(ok, 400));
	}
	const cao = await trang.evaluate(() => {
		const ngan = document.querySelector("[data-lo-trinh-chi-tiet-viec]");
		const than = ngan
			?.querySelector("[data-lo-trinh-tom-tat]")
			?.closest(".overflow-y-auto");
		const them = than ? than.scrollHeight - than.clientHeight : 0;
		return Math.max(
			document.documentElement.scrollHeight,
			window.innerHeight + them,
		);
	});
	await trang.setViewport({ width: k.w, height: Math.max(k.h, cao) });
	await new Promise((ok) => setTimeout(ok, 400));
	const kq = await trang.evaluate((state) => {
		const loi = [];
		const ngan = document.querySelector("[data-lo-trinh-chi-tiet-viec]");
		if (!ngan) return { loi: ["khong thay ngan viec"], sw: 0, cw: 0 };
		const tomTat = ngan.querySelector("[data-lo-trinh-tom-tat]");
		const chiTiet = ngan.querySelector("[data-lo-trinh-chi-tiet]");
		const soLieu = ngan.querySelector("[data-lo-trinh-so-lieu]");
		if (!tomTat && state !== "ST-ngan-chu-kho")
			loi.push("khong thay phan tom tat ho so");
		else if (
			chiTiet &&
			!(
				tomTat.compareDocumentPosition(chiTiet) &
				Node.DOCUMENT_POSITION_FOLLOWING
			)
		)
			loi.push("tom tat khong dung truoc chi tiet");
		const the = [...ngan.querySelectorAll('[role="tab"]')].map((e) =>
			e.textContent?.trim(),
		);
		if (state === "ST-ngan-chu-kho") {
			if (the.join("|") !== "Tổng quan|Số liệu")
				loi.push(`vai owner thanh the sai: ${the.join("|")}`);
			if (!soLieu) loi.push("vai owner khong thay so lieu lam viec");
		} else {
			if (soLieu || the.includes("Số liệu"))
				loi.push("vai khac owner thay so lieu lam viec");
			if (the[0] !== "Tổng quan") loi.push("ngan khong co the Tong quan");
		}
		if (
			state === "ST-ngan-o-vang" &&
			!ngan.querySelector('[data-o-tom-tat="do_gi"][data-o-vang]')
		)
			loi.push("hang do_gi cua 4n khong hien chua co");
		for (const el of ngan.querySelectorAll(
			"[data-o-tom-tat]:not([data-o-vang]), [data-so-lieu='ma'] .font-mono",
		))
			if (!el.closest('[translate="no"]'))
				loi.push(
					`chu cua dai thieu dau khong dich (${el.getAttribute("data-o-tom-tat") ?? "ma"})`,
				);
		const sw = Math.max(document.documentElement.scrollWidth, ngan.scrollWidth);
		const cw = Math.min(
			document.documentElement.clientWidth,
			ngan.clientWidth || document.documentElement.clientWidth,
		);
		if (
			document.documentElement.scrollWidth >
			document.documentElement.clientWidth
		)
			loi.push("trang cuon ngang");
		if (ngan.scrollWidth > ngan.clientWidth) loi.push("ngan cuon ngang");
		return { loi, sw, cw };
	}, o.state);
	const tep = `${o.state}--${k.ten}--${thietKe ? (o.nen === "sang" ? "light" : "dark") : o.nen}.png`;
	await trang.screenshot({ path: join(ra, tep) });
	const dung = kq.loi.length === 0;
	if (!dung) sai++;
	console.log(
		`${dung ? "DUNG" : "SAI"} ${o.state} ${k.ten} ${o.nen}${dung ? "" : ` — ${kq.loi.join("; ")}`} (${tep})`,
	);
	bang.push({ ...o, tep, sw: kq.sw, cw: kq.cw });
}
await trinh.close();
console.log(`${bang.length} anh vao ${ra.slice(goc.length + 1)}`);
ketLuan(sai === 0 ? 0 : 1);
