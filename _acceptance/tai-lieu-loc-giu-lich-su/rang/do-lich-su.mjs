import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const HERE = dirname(TEP_NAY);
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "tai-lieu-loc-giu-lich-su";
const CHI_DO = process.argv.includes("--chi-do");

const RONG = 1280;
const CHO_MS = 30_000;
const TRE_MS = 3_000;
const DUONG_CHAN = "taiLieu.list";
const MA = `tlg${Date.now().toString(36).slice(-5)}`;

const TEP_THAM_SO =
	"apps/app/app/(app)/[slug]/tai-lieu/tai-lieu-search-params.ts";
const TEP_TRANG = "apps/app/app/(app)/[slug]/tai-lieu/danh-sach-trang.tsx";
const TEP_RANG = `_acceptance/${HO_SO}/rang/do-lich-su.mjs`;

const CAY_DO = {
	1: {
		nhan: "ban sao bo history push khoi taiLieuParsers",
		tenCay: "tlg-do-lich-su-chieu-do-1",
		chiBuoc: "1",
		tep: TEP_THAM_SO,
		cam: (s) =>
			s.replace(
				'const PUSH = { history: "push" } as const;',
				'const PUSH = { history: "replace" } as const;',
			),
		dauVet: 'const PUSH = { history: "replace" } as const;',
		ghim: /tlg-man: lui lan 1 roi tai lieu/,
	},
	2: {
		nhan: "ban sao danh sach trang bo placeholderData",
		tenCay: "tlg-do-lich-su-chieu-do-2",
		chiBuoc: "2",
		tep: TEP_TRANG,
		cam: (s) =>
			s.replace(
				"placeholderData: (truoc) => truoc,",
				"placeholderData: undefined,",
			),
		dauVet: "placeholderData: undefined,",
		ghim: /tlg-man: thanh loc bi go khi cho/,
	},
	3: {
		nhan: "ban sao bang do bo do tre",
		tenCay: "tlg-do-lich-su-chieu-do-3",
		chiBuoc: "2",
		tep: TEP_RANG,
		cam: (s) =>
			s.replace(
				'const DUONG_CHAN = "taiLieu.list";',
				'const DUONG_CHAN = "taiLieu.khong-co";',
			),
		dauVet: 'const DUONG_CHAN = "taiLieu.khong-co";',
		ghim: /tlg-man: khong chan duoc taiLieu\.list/,
	},
};

if (CHI_DO) {
	const ket = [];
	for (const so of Object.keys(CAY_DO)) {
		const r = spawnSync("bun", [relative(GOC, TEP_NAY), `--chieu-do=${so}`], {
			cwd: GOC,
			stdio: "inherit",
		});
		ket.push({ so, ma: r.status });
		console.log(`chieu do ${so}: ma ${r.status}`);
	}
	const lot = ket.filter((k) => k.ma !== 0);
	if (lot.length > 0) {
		console.log(
			`tlg-man-do: ${lot.length}/${ket.length} chieu do khong ra dung ghim`,
		);
		process.exit(1);
	}
	console.log(`tlg-man-do: ${ket.length}/${ket.length} chieu do ra dung ghim`);
	process.exit(0);
}

const coChieuDo = process.argv.find((a) => a.startsWith("--chieu-do"));
if (coChieuDo) {
	const so = coChieuDo.split("=")[1] ?? "1";
	const cay = CAY_DO[so];
	if (!cay) {
		console.log(`KHONG DO DUOC: do-lich-su khong co chieu do ${so}`);
		process.exit(2);
	}
	const { chieuDo } = await import("../../kho-tai-lieu/rang/man-lib.mjs");
	await chieuDo(TEP_NAY, cay);
}

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun ${TEP_RANG}"`,
	);
	process.exit(2);
}

process.env.BANG_CHUNG ??= join(GOC, ".acceptance-runs", HO_SO, "evidence");
mkdirSync(process.env.BANG_CHUNG, { recursive: true });

const { cho, chay, moDo } = await import("../../kho-tai-lieu/rang/man-lib.mjs");

const d = await moDo();
const BANG = process.env.BANG_CHUNG;

async function trangMoi(nguoi) {
	const t = await d.trangCuoi().browser().newPage();
	await t.setViewport({ width: RONG, height: 900, deviceScaleFactor: 1 });
	const host = new URL(d.APP).hostname;
	await t.setCookie(
		{
			name: nguoi.cookie.ten,
			value: nguoi.cookie.gia,
			domain: host,
			path: "/",
		},
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	return t;
}

async function choDieu(t, ham, moTa, ...thamSo) {
	try {
		await t.waitForFunction(ham, { timeout: CHO_MS, polling: 100 }, ...thamSo);
		return true;
	} catch {
		console.log(`  het ${CHO_MS} ms cho: ${moTa}`);
		return false;
	}
}

const trangThai = (t) =>
	t.evaluate(() => {
		const on = document.querySelector(
			'[data-bo-loc] [data-slot="toggle-group-item"][data-state="on"]',
		);
		const q = new URLSearchParams(location.search);
		return {
			duong: location.pathname,
			loai: q.get("loai"),
			donVi: q.get("donVi"),
			chip: on ? (on.getAttribute("data-loai") ?? "tat-ca") : null,
		};
	});

const viet = (s) => `${s.duong} loai=${s.loai} donVi=${s.donVi} chip=${s.chip}`;
const bang = (a, b) =>
	a.loai === b.loai && a.donVi === b.donVi && a.chip === b.chip;

async function lui(t, mong) {
	await t.goBack({ timeout: CHO_MS }).catch(() => null);
	await choDieu(
		t,
		(m) => {
			const on = document.querySelector(
				'[data-bo-loc] [data-slot="toggle-group-item"][data-state="on"]',
			);
			const q = new URLSearchParams(location.search);
			return (
				q.get("loai") === m.loai &&
				q.get("donVi") === m.donVi &&
				(on ? (on.getAttribute("data-loai") ?? "tat-ca") : null) === m.chip
			);
		},
		`lui ve ${viet(mong)}`,
		mong,
	);
	return trangThai(t);
}

const doCho = (t) =>
	t.evaluate(() => {
		const vung = document.querySelector(
			'[data-danh-sach-trang] [data-slot="vung-dang-tai"]',
		);
		return {
			goThanhLoc: window.__goThanhLoc ?? -1,
			tieuDiem: document.activeElement?.getAttribute("data-loai") ?? null,
			ariaBusy: vung?.getAttribute("aria-busy") ?? null,
			doMo: vung ? Number(getComputedStyle(vung).opacity) : -1,
			coThanhLoc: document.querySelector("[data-bo-loc]") !== null,
		};
	});

try {
	const quanTri = await d.nguoiMoi(MA, "owner", "Lan Tlg");
	await d.batTrinhDuyet(quanTri.cookie);
	await d.moTrang(quanTri.cookie, RONG, "/tai-lieu");

	const khoi = await d.lam(quanTri.cookie, "org.createDivision", {
		name: `Khối mẫu ${MA}`,
	});
	const pbA = await d.lam(quanTri.cookie, "org.createDepartment", {
		name: `Phòng A ${MA}`,
		divisionId: khoi.id,
	});
	const pbB = await d.lam(quanTri.cookie, "org.createDepartment", {
		name: `Phòng B ${MA}`,
		divisionId: khoi.id,
	});
	for (const [ten, loai, pb] of [
		[`Quy định mẫu ${MA}`, "quy-dinh", pbA],
		[`Chính sách mẫu ${MA}`, "chinh-sach", pbA],
		[`Quy trình mẫu ${MA}`, "quy-trinh", pbB],
	]) {
		await d.taoTrangDangDung(quanTri, {
			ten,
			loai,
			departmentId: pb.id,
			noiDung: `${ten}.\n`,
		});
	}

	const moMan = async () => {
		const t = await trangMoi(quanTri);
		await t.goto(`${d.APP}/${d.slug()}/tai-lieu`, {
			waitUntil: "load",
			timeout: 120_000,
		});
		await t
			.waitForNetworkIdle({ idleTime: 500, timeout: CHO_MS })
			.catch(() => null);
		await choDieu(
			t,
			() => document.querySelector('[data-loai="chinh-sach"]') !== null,
			"co chip loai",
		);
		return t;
	};

	if (chay(1)) {
		await d.chayBuoc(1, async () => {
			const loi = [];
			const t = await moMan();
			const dau = await trangThai(t);
			await t.click('[data-loai="chinh-sach"]');
			await choDieu(
				t,
				() => new URLSearchParams(location.search).get("loai") === "chinh-sach",
				"duong dan co loai",
			);
			await t
				.waitForNetworkIdle({ idleTime: 500, timeout: CHO_MS })
				.catch(() => null);
			const sauLoai = await trangThai(t);
			await t.click("[data-loc-don-vi]");
			await choDieu(
				t,
				() => document.querySelector("[cmdk-item]") !== null,
				"mo o chon don vi",
			);
			const muc = await t.evaluateHandle(
				(ten) =>
					[...document.querySelectorAll("[cmdk-item]")].find((e) =>
						e.textContent.includes(ten),
					) ?? null,
				pbA.name ?? `Phòng A ${MA}`,
			);
			const mucEl = muc.asElement();
			if (!mucEl) throw new Error("khong thay don vi trong o chon");
			await mucEl.click();
			const coDonVi = await choDieu(
				t,
				() => new URLSearchParams(location.search).get("donVi") !== null,
				"duong dan co donVi",
			);
			if (!coDonVi) loi.push("tlg-man: chon don vi khong doi duong dan");
			await t
				.waitForNetworkIdle({ idleTime: 500, timeout: CHO_MS })
				.catch(() => null);
			const sauDonVi = await trangThai(t);
			const lui1 = await lui(t, sauLoai);
			const lui2 = await lui(t, dau);
			console.log(`  do buoc 1: dau ${viet(dau)}`);
			console.log(`  do buoc 1: sau loai ${viet(sauLoai)}`);
			console.log(`  do buoc 1: sau don vi ${viet(sauDonVi)}`);
			console.log(`  do buoc 1: lui 1 ${viet(lui1)}`);
			console.log(`  do buoc 1: lui 2 ${viet(lui2)}`);
			const oTaiLieu = (s) => s.duong.endsWith("/tai-lieu");
			if (!oTaiLieu(lui1)) loi.push("tlg-man: lui lan 1 roi tai lieu");
			else if (!bang(lui1, sauLoai))
				loi.push(
					`tlg-man: lui lan 1 khong ve trang thai sau khi chon loai (${viet(lui1)})`,
				);
			if (oTaiLieu(lui1) && !oTaiLieu(lui2))
				loi.push("tlg-man: lui lan 2 roi tai lieu");
			else if (oTaiLieu(lui1) && !bang(lui2, dau))
				loi.push(
					`tlg-man: lui lan 2 khong ve trang thai ban dau (${viet(lui2)})`,
				);
			if (sauLoai.chip !== "chinh-sach")
				loi.push(
					`tlg-man: chip khong bat sau khi chon loai (${viet(sauLoai)})`,
				);
			await t.close();
			for (const l of loi) console.log(`  ${l}`);
			d.dat(1, loi.length === 0, loi.join(" · "));
		});
	}

	if (chay(2)) {
		await d.chayBuoc(2, async () => {
			const loi = [];
			const t = await moMan();
			await choDieu(
				t,
				() =>
					document.querySelector(
						'[data-danh-sach-trang] [data-slot="vung-dang-tai"]',
					) !== null,
				"co vung danh sach",
			);
			let tre = false;
			let soChan = 0;
			let soChanRsc = 0;
			await t.setRequestInterception(true);
			t.on("request", (r) => {
				const laDanhSach = r.url().includes(DUONG_CHAN);
				const laRsc = r.headers().rsc === "1";
				if (tre && (laDanhSach || laRsc)) {
					if (laDanhSach) soChan += 1;
					if (laRsc) soChanRsc += 1;
					setTimeout(() => r.continue().catch(() => null), TRE_MS);
					return;
				}
				r.continue().catch(() => null);
			});
			await t.evaluate(() => {
				window.__goThanhLoc = 0;
				new MutationObserver((ds) => {
					for (const m of ds) {
						for (const n of m.removedNodes) {
							if (
								n instanceof Element &&
								(n.matches("[data-bo-loc]") || n.querySelector("[data-bo-loc]"))
							)
								window.__goThanhLoc += 1;
						}
					}
				}).observe(document.body, { childList: true, subtree: true });
			});
			const truoc = await doCho(t);
			console.log(
				`  do buoc 2 truoc: aria-busy ${truoc.ariaBusy} · do mo ${truoc.doMo} · go ${truoc.goThanhLoc}`,
			);
			if (truoc.ariaBusy === "true" || truoc.doMo !== 1)
				loi.push(
					`tlg-man: dang cho truoc khi bam (aria-busy ${truoc.ariaBusy}, do mo ${truoc.doMo})`,
				);
			tre = true;
			await t.click('[data-loai="quy-trinh"]');
			await cho(600);
			const trong = await doCho(t);
			await t.screenshot({
				path: join(BANG, "tlg-cho-loc-1280.png"),
				fullPage: false,
			});
			console.log("  anh tlg-cho-loc-1280.png");
			console.log(
				`  do buoc 2 trong luc cho: chan ${soChan} · chan rsc ${soChanRsc} · go ${trong.goThanhLoc} · co thanh loc ${trong.coThanhLoc} · tieu diem ${trong.tieuDiem} · aria-busy ${trong.ariaBusy} · do mo ${trong.doMo}`,
			);
			if (soChan < 1) loi.push("tlg-man: khong chan duoc taiLieu.list");
			else {
				if (trong.goThanhLoc !== 0 || !trong.coThanhLoc)
					loi.push("tlg-man: thanh loc bi go khi cho");
				if (trong.tieuDiem !== "quy-trinh")
					loi.push(`tlg-man: mat tieu diem khi cho (${trong.tieuDiem})`);
				if (trong.ariaBusy !== "true")
					loi.push(
						`tlg-man: vung danh sach khong bao dang tai (${trong.ariaBusy})`,
					);
				if (!(trong.doMo < 1))
					loi.push(`tlg-man: vung danh sach khong mo khi cho (${trong.doMo})`);
			}
			tre = false;
			await choDieu(
				t,
				() => {
					const v = document.querySelector(
						'[data-danh-sach-trang] [data-slot="vung-dang-tai"]',
					);
					return v !== null && v.getAttribute("aria-busy") !== "true";
				},
				"danh sach moi ve",
			);
			await cho(600);
			const sau = await doCho(t);
			console.log(
				`  do buoc 2 sau: go ${sau.goThanhLoc} · aria-busy ${sau.ariaBusy} · do mo ${sau.doMo}`,
			);
			if (soChan >= 1) {
				if (
					sau.goThanhLoc !== 0 &&
					!loi.includes("tlg-man: thanh loc bi go khi cho")
				)
					loi.push("tlg-man: thanh loc bi go khi cho");
				if (sau.ariaBusy === "true" || sau.doMo !== 1)
					loi.push(
						`tlg-man: van dang cho sau khi ve (aria-busy ${sau.ariaBusy}, do mo ${sau.doMo})`,
					);
			}
			await t.setRequestInterception(false).catch(() => null);
			await t.close();
			for (const l of loi) console.log(`  ${l}`);
			d.dat(2, loi.length === 0, loi.join(" · "));
		});
	}

	await d.ket("do-lich-su");
} catch (e) {
	await d.khongDoDuoc(e);
}
