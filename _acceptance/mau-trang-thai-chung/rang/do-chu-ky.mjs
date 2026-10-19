import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const HERE = dirname(TEP_NAY);
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "mau-trang-thai-chung";
const CHI_DO = process.argv.includes("--chi-do");

const RONG = 1280;
const CHO_MS = 30_000;
const MA = `mtc${Date.now().toString(36).slice(-5)}`;

const PHA_DUNG = ["lap-ke-hoach", "dang-chay", "da-dong"];
const MONG = { "lap-ke-hoach": "neutral", "dang-chay": "info", "da-dong": "neutral" };
const CHU_KY = {
	"lap-ke-hoach": { startsOn: "2027-01-01", endsOn: "2027-12-31", buoc: [] },
	"dang-chay": { startsOn: "2026-01-01", endsOn: "2026-12-31", buoc: ["dang-chay"] },
	"da-dong": {
		startsOn: "2025-01-01",
		endsOn: "2025-12-31",
		buoc: ["dang-chay", "cham-diem", "da-dong"],
	},
};

const TEP_CHU_KY = "apps/app/app/(app)/[slug]/settings/okr/bang-chu-ky.tsx";
const TEP_RANG = `_acceptance/${HO_SO}/rang/do-chu-ky.mjs`;

const CAY_DO = {
	1: {
		nhan: "ban sao bang-chu-ky cho pha dang-chay nghia xong",
		tenCay: "mtc-do-chu-ky-chieu-do-1",
		chiBuoc: "1",
		tep: TEP_CHU_KY,
		cam: (s) => s.replace('"dang-chay": "dangChay",', '"dang-chay": "xong",'),
		dauVet: '"dang-chay": "xong",',
		ghim: /mtc-man: pha dang-chay data-tone success, ky vong info/,
	},
	2: {
		nhan: "ban sao bang do khong dung chu ky lap ke hoach",
		tenCay: "mtc-do-chu-ky-chieu-do-2",
		chiBuoc: "1",
		tep: TEP_RANG,
		cam: (s) =>
			s.replace(
				'const PHA_DUNG = ["lap-ke-hoach", "dang-chay", "da-dong"];',
				'const PHA_DUNG = ["dang-chay", "da-dong"];',
			),
		dauVet: 'const PHA_DUNG = ["dang-chay", "da-dong"];',
		ghim: /mtc-man: thieu pha lap-ke-hoach/,
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
		console.log(`mtc-man-do: ${lot.length}/${ket.length} chieu do khong ra dung ghim`);
		process.exit(1);
	}
	console.log(`mtc-man-do: ${ket.length}/${ket.length} chieu do ra dung ghim`);
	process.exit(0);
}

const coChieuDo = process.argv.find((a) => a.startsWith("--chieu-do"));
if (coChieuDo) {
	const so = coChieuDo.split("=")[1] ?? "1";
	const cay = CAY_DO[so];
	if (!cay) {
		console.log(`KHONG DO DUOC: do-chu-ky khong co chieu do ${so}`);
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
		{ name: nguoi.cookie.ten, value: nguoi.cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	return t;
}

const tenKy = (pha) => `Chu kỳ đo ${MA} ${pha}`;

try {
	const quanTri = await d.nguoiMoi(MA, "owner", "Lan Mtc");
	await d.batTrinhDuyet(quanTri.cookie);
	await d.moTrang(quanTri.cookie, RONG, "/settings/okr");

	for (const pha of PHA_DUNG) {
		const k = CHU_KY[pha];
		const { id } = await d.lam(quanTri.cookie, "okr.createCycle", {
			kind: "nam",
			name: tenKy(pha),
			parentId: null,
			startsOn: k.startsOn,
			endsOn: k.endsOn,
			breakStartsOn: null,
			breakEndsOn: null,
			updateWeekday: 1,
		});
		for (const buoc of k.buoc)
			await d.lam(quanTri.cookie, "okr.setCyclePhase", { id, phase: buoc });
	}

	if (chay(1)) {
		await d.chayBuoc(1, async () => {
			const loi = [];
			const t = await trangMoi(quanTri);
			await t.goto(`${d.APP}/${d.slug()}/settings/okr`, {
				waitUntil: "load",
				timeout: 120_000,
			});
			await t.waitForNetworkIdle({ idleTime: 500, timeout: CHO_MS }).catch(() => null);
			const doc = await t.evaluate((ten) => {
				const ra = {};
				for (const [pha, chu] of Object.entries(ten)) {
					const hang = [...document.querySelectorAll("tr")].find((tr) =>
						tr.textContent?.includes(chu),
					);
					ra[pha] = hang
						? (hang
								.querySelector('[data-slot="status-indicator"], [data-slot="indicator-dot"]')
								?.getAttribute("data-tone") ?? null)
						: undefined;
				}
				return ra;
			}, Object.fromEntries(Object.keys(MONG).map((p) => [p, tenKy(p)])));
			let dem = 0;
			for (const [pha, mong] of Object.entries(MONG)) {
				const that = doc[pha];
				console.log(`  do buoc 1: pha ${pha} data-tone ${that ?? "khong co hang"} ky vong ${mong}`);
				if (that === undefined) loi.push(`mtc-man: thieu pha ${pha}`);
				else if (that !== mong) loi.push(`mtc-man: pha ${pha} data-tone ${that}, ky vong ${mong}`);
				else dem += 1;
			}
			await t.screenshot({ path: join(BANG, "mtc-chu-ky-1280.png"), fullPage: true });
			console.log(`  anh mtc-chu-ky-1280.png · dat ${dem}/3`);
			await t.close();
			for (const l of loi) console.log(`  ${l}`);
			d.dat(1, loi.length === 0, loi.join(" · "));
		});
	}

	await cho(0);
	await d.ket("do-chu-ky");
} catch (e) {
	await d.khongDoDuoc(e);
}
