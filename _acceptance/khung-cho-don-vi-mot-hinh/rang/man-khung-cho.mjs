#!/usr/bin/env bun
/**
 * Khung chờ trang Theo đơn vị một hình, đo trên trình duyệt thật (hồ sơ khung-cho-don-vi-mot-hinh, DH12).
 *
 *   bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/khung-cho-don-vi-mot-hinh/rang/man-khung-cho.mjs"
 *
 * Phiên đo riêng của cây đang xét, bộ OKR mẫu, quản trị mẫu qua dev:session. Bộ lấy mẫu chạy trong trang mỗi 50 ms
 * (khuôn E4 của trang-don-vi-mot-bang). Chữ ký khung của một mẫu: chiều cao hàng công cụ · khoảng từ đỉnh vùng nội
 * dung tới đỉnh đầu bảng · chiều cao đầu bảng · số dòng · chiều cao từng dòng. Mẫu lạ: vạch hay aria-busy trong vùng
 * nội dung ngoài khung [data-khung-xuong=bang-hai-dong].
 * Ba đường, mỗi khổ 1440 và 390: tải cứng (AC-1, AC-4), điều hướng mềm từ Toàn cảnh (AC-2), đổi đơn vị với
 * okr.danhSach của trình duyệt bị giữ (AC-3). Ảnh E9 vào evidence/.
 * Mã thoát: 0 đạt · 1 có dòng SAI · 2 không đo được.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const HO_SO = "khung-cho-don-vi-mot-hinh";
const daThongCong = ["signed-off", "machine-cleared"].includes(
	/^status:\s*(\S+)/m.exec(
		readFileSync(join(GOC, "_acceptance", HO_SO, "contract.md"), "utf8"),
	)?.[1] ?? "",
);
process.env.BANG_CHUNG ??= daThongCong
	? join(GOC, ".acceptance-runs", HO_SO, "evidence")
	: join(GOC, "_acceptance", HO_SO, "evidence");
const BANG_CHUNG = process.env.BANG_CHUNG;

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/man-khung-cho.mjs"`,
	);
	process.exit(2);
}

const lib = await import("../../kho-tai-lieu/rang/man-lib.mjs");
const { chiaCookie } = await import(
	"../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs"
);

const MAU = JSON.parse(
	readFileSync(join(GOC, "apps/api/scripts/okr-mau/cong-ty.json"), "utf8"),
);
const MIEN = "mau.onehub.test";
const idMau = (loai, ma) => `mau-okr-${loai}-${ma}`;
const KY = idMau("chu-ky", "quy4");
const KHO = [1440, 390];
const TRE_MS = 800;
const BANG_THONG = Number(process.env.KCD_BANG_THONG ?? 40_000);
const d = await lib.moDo();
const sai = [];
const dong = (dung, cau) => {
	console.log(dung ? cau : `SAI ${cau}`);
	if (!dung) sai.push(cau);
	return dung;
};
const khongDo = async (cau) => {
	console.log(`KHONG DO DUOC: ${cau}`);
	await d.khongDoDuoc(cau).catch(() => process.exit(2));
};
const choMs = (ms) => new Promise((r) => setTimeout(r, ms));
const duongDon = (don) =>
	`/okr/theo-don-vi?kyOkr=${KY}${don ? `&donOkr=${don}` : ""}`;
const phienCua = (email) =>
	chiaCookie(
		execFileSync("bun", ["run", "dev:session", email], {
			cwd: join(GOC, "apps", "api"),
			encoding: "utf8",
		})
			.trim()
			.split("\n")
			.pop()
			.trim(),
	);

async function napBoMau() {
	if ((await d.db.okrCycle.count()) > 0) return;
	const nap = spawnSync("bun", ["scripts/okr-mau.ts"], {
		cwd: join(GOC, "apps", "api"),
		env: process.env,
		encoding: "utf8",
	});
	if (nap.status !== 0) await khongDo(`nap bo OKR mau thoat ${nap.status}`);
}

const lapMau = (idDich) => {
	window.__mau = [];
	const dich = idDich ? new Set(idDich) : null;
	const hien = (e) =>
		e.getClientRects().length > 0 &&
		e.closest("[hidden]") === null &&
		getComputedStyle(e).visibility !== "hidden";
	const tat = (s, goc = document) => [...goc.querySelectorAll(s)].filter(hien);
	const cao = (e) => Math.round(e.getBoundingClientRect().height);
	const lay = () => {
		const vung = tat("[data-slot=page-shell-content]")[0] ?? null;
		const nd = vung ? Math.round(vung.getBoundingClientRect().top) : null;
		const khung = vung ? (tat("[data-khung-xuong]", vung)[0] ?? null) : null;
		let ky = null;
		if (khung) {
			const cc = tat("[data-khung-hang=thanh-cong-cu]", khung)[0];
			const db = tat("[data-khung-hang=dau-bang]", khung)[0];
			const hang = tat("[data-khung-hang=hang]", khung);
			ky = [
				khung.getAttribute("data-khung-xuong"),
				`cong cu ${cc ? cao(cc) : "-"}`,
				`dau bang ${db && nd !== null ? Math.round(db.getBoundingClientRect().top - nd) : "-"}/${db ? cao(db) : "-"}`,
				`${hang.length} dong ${hang.map(cao).join(",")}`,
			].join(" · ");
		}
		const la = vung
			? tat("[data-slot=skeleton], [aria-busy=true]", vung).some(
					(e) => !(khung && (khung.contains(e) || e.contains(khung))),
				)
			: false;
		const oThat = tat("[data-chon-don-vi]");
		const oKhung = tat("[data-hang-cong-cu-don-vi-khung]");
		const dau = oThat[0] ?? oKhung[0]?.firstElementChild ?? null;
		const hangMt = tat("[data-hang-muc-tieu]").filter(
			(e) => !dich || dich.has(e.getAttribute("data-hang-muc-tieu")),
		);
		const trang = /\/okr\/(theo-don-vi|bo-okr)(\/|$)/.test(location.pathname);
		window.__mau.push({
			trang,
			xong:
				trang &&
				(hangMt.length > 0 ||
					(!dich &&
						tat("[data-trang-thai^='ST-donvi-']").some(
							(e) => e.getAttribute("data-trang-thai") !== "ST-donvi-dangtai",
						))),
			luc: Math.round(performance.now()),
			ky,
			la,
			khungDich: khung?.getAttribute("data-khung-xuong") === "bang-hai-dong",
			oThat: oThat.length > 0,
			cay: tat("[data-nut-cay]").length + tat("[role=tree]").length,
			o: oThat.length + oKhung.length,
			dinh: dau ? Math.round(dau.getBoundingClientRect().top) : null,
			quay: vung ? tat("[data-slot=spinner], .animate-spin", vung).length : 0,
			hang: hangMt.length > 0,
		});
	};
	lay();
	const id = setInterval(() => {
		lay();
		const cuoi = window.__mau.at(-1);
		if (cuoi?.hang || cuoi?.xong) clearInterval(id);
	}, 50);
};

const datChan = async (t) => {
	await t.setRequestInterception(true);
	const c = { tha: false, giu: [], so: 0 };
	t.on("request", (r) => {
		if (r.isInterceptResolutionHandled()) return;
		if (!c.tha && /\/api\/trpc\/[^?]*okr\.danhSach/.test(r.url())) {
			c.so += 1;
			c.giu.push(r);
			return;
		}
		r.continue().catch(() => null);
	});
	c.thaRa = () => {
		c.tha = true;
		for (const r of c.giu.splice(0)) r.continue().catch(() => null);
	};
	return c;
};

const tre = async (t, ms, bangThong = -1) => {
	const cdp = await t.createCDPSession();
	await cdp.send("Network.enable");
	await cdp.send("Network.emulateNetworkConditions", {
		offline: false,
		latency: ms,
		downloadThroughput: bangThong,
		uploadThroughput: -1,
	});
	return cdp;
};

const choBang = (t) =>
	d.doi(
		t,
		() =>
			document.querySelector("[data-hang-muc-tieu]") !== null &&
			document.querySelector("[data-slot=page-shell-content] thead") !== null,
	);

const doThat = (t) =>
	t.evaluate(() => {
		const hien = (e) => e && e.getClientRects().length > 0;
		const cao = (e) => Math.round(e.getBoundingClientRect().height);
		const vung = document.querySelector("[data-slot=page-shell-content]");
		const hop = [
			...document.querySelectorAll("[data-hang-cong-cu-don-vi]"),
		].find(hien);
		const tr = [...document.querySelectorAll("[data-hang-muc-tieu]")]
			.map((e) => e.closest("tr"))
			.filter(hien);
		const dau = vung?.querySelector("thead tr");
		const o = [...document.querySelectorAll("[data-chon-don-vi]")].find(hien);
		return {
			congCu: hop?.parentElement ? cao(hop.parentElement) : null,
			dauBang: dau ? cao(dau) : null,
			dong: [...new Set(tr)].map(cao),
			dinh: o ? Math.round(o.getBoundingClientRect().top) : null,
			tran:
				document.documentElement.scrollWidth >
				document.documentElement.clientWidth + 1,
		};
	});

const docMau = (t) => t.evaluate(() => window.__mau ?? []);
const coKhung = (t) =>
	t
		.evaluate(() => (window.__mau ?? []).some((x) => x.ky !== null && !x.hang))
		.catch(() => false);
const coHang = (t) =>
	t
		.evaluate(() => (window.__mau ?? []).some((x) => x.hang || x.xong))
		.catch(() => false);

async function choToiHang(t, han, khiKhung) {
	let daGoi = false;
	while (Date.now() < han) {
		if (!daGoi && (await coKhung(t))) {
			daGoi = true;
			await khiKhung?.();
		}
		if (await coHang(t)) return true;
		await choMs(25);
	}
	return coHang(t);
}

function tomTat(tatCa) {
	const mau = tatCa.filter((x) => x.trang);
	const iHang = mau.findIndex((x) => x.hang || x.xong);
	const tai = iHang < 0 ? mau : mau.slice(0, iHang);
	const khung = tai.filter((x) => x.ky !== null || x.la);
	const hinh = new Set(khung.map((x) => (x.la ? "la" : x.ky)));
	return {
		tai,
		khung,
		hinh,
		cay: Math.max(0, ...tai.map((x) => x.cay)),
		o: Math.max(0, ...tai.map((x) => x.o)),
		quay: Math.max(0, ...tai.map((x) => x.quay)),
	};
}

const lechDauBang = (khung) => {
	const dau = khung
		.filter((x) => x.ky)
		.map((x) => Number(/dau bang (-?\d+)\//.exec(x.ky)?.[1] ?? Number.NaN));
	return dau.length > 1 ? Math.max(...dau) - Math.min(...dau) : 0;
};

const boCongCu = (ky) => ky?.replace(/^[^·]+· cong cu [^·]+· /, "") ?? null;

try {
	await napBoMau();
	const quanTriMa = MAU.nguoi.find((n) => n.vai === "admin")?.ma;
	const pb = (ma) => MAU.phongBan.find((p) => p.ma === ma);
	const P_DS = pb("phap-che");
	const P_MEM = pb("kd-bac");
	if (!quanTriMa || !P_DS || !P_MEM)
		await khongDo("bo mau thieu quan tri, phong phap-che hoac kd-bac");
	const QT = phienCua(`${quanTriMa}@${MIEN}`);
	await d.batTrinhDuyet(QT);
	const DON_DS = `pb:${idMau("pb", P_DS.ma)}`;
	const idDich = (
		await d.db.okrObjective.findMany({
			where: {
				cycleId: KY,
				level: "phong-ban",
				departmentId: idMau("pb", P_MEM.ma),
				status: { not: "da-bo" },
			},
			select: { id: true },
		})
	).map((x) => x.id);
	if (idDich.length === 0)
		await khongDo(`${P_MEM.ten} khong co muc tieu trong kho do`);
	const kyCung = {};

	for (const w of KHO) {
		console.log(`== tai cung ${w}`);
		const t = await d.moTrang(QT, w, duongDon(DON_DS));
		await choBang(t);
		await t.evaluateOnNewDocument(lapMau, null);
		const cdp = await tre(t, TRE_MS, BANG_THONG);
		const chan = await datChan(t);
		const di = t
			.goto(`${d.APP}/${d.slug()}${duongDon(DON_DS)}`, {
				waitUntil: "load",
				timeout: 180_000,
			})
			.catch((e) => e);
		const coBang = await choToiHang(t, Date.now() + 120_000, async () => {
			await t.screenshot({ path: join(BANG_CHUNG, `E9-khung-${w}.png`) });
			await choMs(600);
			chan.thaRa();
		});
		chan.thaRa();
		const ketDi = await di;
		if (ketDi instanceof Error) throw ketDi;
		await t
			.waitForNetworkIdle({ idleTime: 500, timeout: 60_000 })
			.catch(() => null);
		await choMs(1200);
		await cdp
			.send("Network.emulateNetworkConditions", {
				offline: false,
				latency: 0,
				downloadThroughput: -1,
				uploadThroughput: -1,
			})
			.catch(() => null);
		const mau = await docMau(t);
		const that = await doThat(t);
		await t.screenshot({ path: join(BANG_CHUNG, `E9-bang-${w}.png`) });
		await t.close();
		if (!coBang) await khongDo(`tai cung ${w}: khong thay dong muc tieu`);
		const s = tomTat(mau);
		for (const x of s.khung)
			if (x.la || x.ky)
				console.log(`  ${x.luc}ms: ${x.la ? "LA · " : ""}${x.ky ?? "-"}`);
		if (s.khung.length === 0) {
			let truoc = "";
			for (const x of mau) {
				const k = `ky ${x.ky ?? "-"} · la ${x.la} · o ${x.o} · hang ${x.hang}`;
				if (k !== truoc) console.log(`  ${x.luc}ms: ${k}`);
				truoc = k;
			}
			await khongDo(
				`khong bat duoc mau khung o ${w} (${mau.length} mau, ${chan.so} yeu cau okr.danhSach bi giu)`,
			);
		}
		const lech = lechDauBang(s.khung);
		dong(
			s.hinh.size === 1 &&
				s.cay === 0 &&
				s.o <= 1 &&
				s.quay === 0 &&
				lech === 0,
			`AC-1 ${w}: ${mau.length} mau · ${s.khung.length} mau khung · ${s.hinh.size} hinh khung · cay toi da ${s.cay} · o chon toi da ${s.o} · vong quay ${s.quay}`,
		);
		if (s.hinh.size > 1)
			dong(false, `AC-1: ${s.hinh.size} hinh khung cho o ${w}`);
		if (lech > 0)
			dong(false, `AC-1: dinh dau bang lech ${lech}px giua cac mau o ${w}`);
		kyCung[w] = [...s.hinh][0];

		const khung = s.khung.filter((x) => x.ky);
		const caoDong = khung.flatMap((x) =>
			(/ dong ([\d,]+)$/.exec(x.ky)?.[1] ?? "")
				.split(",")
				.filter(Boolean)
				.map(Number),
		);
		const soDong = Math.max(
			0,
			...khung.map((x) => Number(/(\d+) dong /.exec(x.ky)?.[1] ?? 0)),
		);
		const congCu = khung.map((x) =>
			Number(/cong cu (\d+)/.exec(x.ky)?.[1] ?? Number.NaN),
		);
		const dauBang = khung.map((x) =>
			Number(/dau bang -?\d+\/(\d+)/.exec(x.ky)?.[1] ?? Number.NaN),
		);
		if (that.dong.length < 2 || that.congCu === null || that.dauBang === null)
			await khongDo(`bang mau o ${w} co ${that.dong.length} dong muc tieu`);
		const min = Math.min(...that.dong);
		const max = Math.max(...that.dong);
		const ngoai = caoDong.filter((c) => c < min || c > max);
		const lechDau = Math.max(...dauBang.map((c) => Math.abs(c - that.dauBang)));
		const lechCc = Math.max(...congCu.map((c) => Math.abs(c - that.congCu)));
		const dung4 =
			soDong <= 5 && ngoai.length === 0 && lechDau <= 1 && lechCc <= 1;
		dong(
			dung4,
			`AC-4 ${w}: dong khung ${soDong}/5 · cao dong khung ${[...new Set(caoDong)].join(",")} · dong that ${min}-${max} · dau bang lech ${lechDau} · hang cong cu lech ${lechCc}`,
		);
		if (ngoai.length > 0)
			dong(
				false,
				`AC-4: dong khung cao ${ngoai[0]}px ngoai ${min}-${max} o ${w}`,
			);
		if (that.tran) dong(false, `AC-4: trang tran ngang o ${w}`);
	}

	for (const w of KHO) {
		console.log(`== dieu huong mem ${w}`);
		const t = await d.moTrang(QT, w, `/okr/toan-canh?kyOkr=${KY}`);
		await t.evaluate(lapMau, null);
		const cdp = await tre(t, TRE_MS);
		const the = await t.evaluateHandle(
			() =>
				[
					...document.querySelectorAll(
						"[data-slot=nav-item][href*='/okr/bo-okr'], [data-slot=nav-item] a[href*='/okr/bo-okr'], [role=tablist] a[href*='/okr/theo-don-vi']",
					),
				].find((e) => e.getClientRects().length > 0) ?? null,
		);
		if (!(await the.evaluate((e) => e !== null)))
			await khongDo(`khong thay the Theo don vi o ${w}`);
		await the.click();
		const coBang = await choToiHang(t, Date.now() + 60_000);
		await cdp
			.send("Network.emulateNetworkConditions", {
				offline: false,
				latency: 0,
				downloadThroughput: -1,
				uploadThroughput: -1,
			})
			.catch(() => null);
		const mau = await docMau(t);
		console.log(`  url sau khi bam: ${t.url()}`);
		await t.close();
		if (!coBang)
			await khongDo(
				`dieu huong mem ${w}: khong thay dong muc tieu (${mau.length} mau, dich ${await the.evaluate((e) => e.getAttribute("href")).catch(() => "?")})`,
			);
		const s = tomTat(mau);
		for (const x of s.khung)
			console.log(`  ${x.luc}ms: ${x.la ? "LA · " : ""}${x.ky ?? "-"}`);
		if (s.khung.length === 0) {
			dong(true, `AC-2 ${w}: khong co pha khung`);
			continue;
		}
		const la = s.khung.some((x) => x.la);
		const khac = [...s.hinh].filter((h) => h !== kyCung[w]);
		dong(
			!la && khac.length === 0,
			`AC-2 ${w}: ${s.khung.length} mau khung · chu ky ${[...s.hinh].join(" | ")} · chu ky tai cung ${kyCung[w]}`,
		);
		if (la) dong(false, `AC-2: mau khung la o ${w}`);
		else if (khac.length > 0)
			dong(false, `AC-2: chu ky ${khac[0]} khac tai cung ${kyCung[w]} o ${w}`);
	}

	for (const w of KHO) {
		console.log(`== doi don vi ${w}`);
		const t = await d.moTrang(QT, w, duongDon(DON_DS));
		await choBang(t);
		const chan = await datChan(t);
		await d.bamSel(t, "[data-chon-don-vi]");
		await d.doi(t, () => document.querySelector("[cmdk-input]") !== null);
		await t.click("[cmdk-input]");
		await t.keyboard.type("mien bac");
		await choMs(500);
		await t.evaluate(lapMau, idDich);
		const chon = await t.evaluateHandle(
			(ten) =>
				[...document.querySelectorAll("[cmdk-item]")].find(
					(e) =>
						(e.querySelector(":scope > span")?.textContent ?? "").trim() ===
						ten,
				) ?? null,
			P_MEM.ten,
		);
		if (!(await chon.evaluate((e) => e !== null)))
			await khongDo(`o chon khong co «${P_MEM.ten}» o ${w}`);
		await chon.click();
		let bam = { nhan: false, mo: false };
		const han = Date.now() + 15_000;
		while (Date.now() < han && !(await coKhung(t))) await choMs(25);
		if (await coKhung(t)) {
			if (w === 1440)
				await t.screenshot({ path: join(BANG_CHUNG, "E9-doi-don-1440.png") });
			const tam = await t.evaluate(() => {
				const o = [...document.querySelectorAll("[data-chon-don-vi]")].find(
					(e) => e.getClientRects().length > 0,
				);
				if (!o) return null;
				const r = o.getBoundingClientRect();
				const x = r.left + r.width / 2;
				const y = r.top + r.height / 2;
				const e = document.elementFromPoint(x, y);
				return { x, y, nhan: Boolean(e && (e === o || o.contains(e))) };
			});
			if (tam) {
				await t.mouse.click(tam.x, tam.y);
				const mo = await t
					.waitForFunction(
						() =>
							document.querySelector("[cmdk-list], [role=listbox]") !== null,
						{ timeout: 3000 },
					)
					.then(() => true)
					.catch(() => false);
				bam = { nhan: tam.nhan, mo };
				await t.keyboard.press("Escape");
			}
		}
		const so = chan.so;
		chan.thaRa();
		const coBang = await choToiHang(t, Date.now() + 30_000);
		await t
			.waitForNetworkIdle({ idleTime: 500, timeout: 30_000 })
			.catch(() => null);
		await choMs(800);
		const mau = await docMau(t);
		const that = await doThat(t);
		await t.close();
		if (so === 0 || !coBang || that.dinh === null)
			await khongDo(
				`doi don vi ${w}: ${so === 0 ? "trinh duyet khong goi okr.danhSach" : "khong thay bang cua don vi moi"}`,
			);
		const s = tomTat(mau);
		for (const x of s.khung)
			console.log(
				`  ${x.luc}ms: ${x.la ? "LA · " : ""}${x.oThat ? "o that · " : ""}${x.ky ?? "-"}`,
			);
		if (s.khung.length === 0)
			await khongDo(`doi don vi ${w}: khong bat duoc mau khung`);
		const oThat = s.khung.every((x) => x.oThat);
		const kyThan = new Set(s.khung.map((x) => (x.la ? "la" : boCongCu(x.ky))));
		const kyThanCung = boCongCu(kyCung[w]);
		const trung = kyThan.size === 1 && kyThan.has(kyThanCung);
		const dinh = s.khung.filter((x) => x.dinh !== null).map((x) => x.dinh);
		const lech =
			dinh.length > 0
				? Math.max(...dinh.map((x) => Math.abs(x - that.dinh)))
				: null;
		dong(
			oThat && bam.nhan && bam.mo && trung && lech !== null && lech <= 1,
			`AC-3 ${w}: ${s.khung.length} mau khung · o chon that ${oThat ? "co" : "khong"} · nhan bam ${bam.nhan ? "co" : "khong"} · mo danh sach ${bam.mo ? "co" : "khong"} · chu ky ${[...kyThan].join(" | ")} · dinh o chon lech ${lech ?? "?"}`,
		);
		if (!oThat) dong(false, `AC-3: khong co o chon that luc dang tai o ${w}`);
		else if (!bam.nhan || !bam.mo)
			dong(false, `AC-3: o chon khong nhan bam o ${w}`);
		if (!trung)
			dong(
				false,
				`AC-3: chu ky than bang ${[...kyThan].join(" | ")} khac tai cung ${kyThanCung} o ${w}`,
			);
	}
} catch (e) {
	await d.khongDoDuoc(e);
}
console.log(
	sai.length === 0 ? "KET LUAN: dat" : `KET LUAN: ${sai.length} dong SAI`,
);
if (sai.length > 0) d.dat("ket", false, `${sai.length} dong SAI`);
await d.ket("man-khung-cho");
