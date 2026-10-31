import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import {
	APP,
	CHO_TAI,
	CHROME,
	datTrinhDuyet,
	ket,
	khongDo,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import {
	apDoiThu,
	CHO,
	CHU,
	DOI_THU,
	docCho,
	docNhapGoiY,
	matHex,
	soAnh,
} from "./man-cho.mjs";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const MOI_EVAL = ["E2", "E3", "E4", "E5", "E6"];
const CHON = new Set(
	(process.env.EVAL ?? "")
		.split(",")
		.map((s) => s.trim().toUpperCase())
		.filter(Boolean),
);
const la = [...CHON].filter((e) => !MOI_EVAL.includes(e));
if (la.length > 0) {
	console.log(
		`KHONG DO DUOC: EVAL ${la.join(", ")} khong thuoc thuoc nay (nhan ${MOI_EVAL.join(", ")})`,
	);
	process.exit(2);
}
const chay = (e) => CHON.size === 0 || CHON.has(e);
const XEM_SAU = process.env.HTG_XEM_SAU === "1";
const TIEN_TO =
	process.env.HTG_TRUOC === "1" ? "truoc" : XEM_SAU ? "nhap-sau" : "sau";
const ANH =
	process.env.HTG_CHEP_ANH === "1" || process.env.HTG_TRUOC === "1" || XEM_SAU
		? join(GOC, "_acceptance", "hex-trang-gioi-thieu", "evidence")
		: join(GOC, ".acceptance-runs", "hex-trang-gioi-thieu", "anh");
const BANG_CHUNG = join(GOC, "_acceptance", "hex-trang-gioi-thieu", "evidence");
const KHO = [1280, 375];
const CSS_NHAP_SAU = (() => {
	if (!XEM_SAU) return "";
	const css = readFileSync(
		join(GOC, "packages", "ui", "src", "styles", "globals.css"),
		"utf8",
	);
	const goc = /\n(?:\.dark,\n)?:root \{([^}]*)\}/.exec(css)?.[1];
	const toi = /\n\.dark \{([^}]*)\}/.exec(css)?.[1];
	if (!goc || !toi) {
		console.log(
			"KHONG DO DUOC: khong rut duoc khoi :root va .dark cua globals.css",
		);
		process.exit(2);
	}
	return `.dark{${goc}}.dark{${toi}}`;
})();
const CAO = 900;
const TAT_CHUYEN_DONG =
	"*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}";

let dung = 0;
let sai = 0;
const bao = (ok, dong) => {
	if (ok) dung += 1;
	else sai += 1;
	console.log(
		`${dong.split(" ")[0]} ${ok ? "DUNG" : "SAI"} ${dong.split(" ").slice(1).join(" ")}`,
	);
};

const cay = await canhCay();
if (cay.ket !== "dung-cay") await khongDo(...cay.dong);

const trinh = await puppeteer.launch({
	executablePath: CHROME,
	headless: true,
	args: ["--no-sandbox", "--force-color-profile=srgb"],
});
datTrinhDuyet(trinh);

async function moTrang(rong, nen) {
	const trang = await trinh.newPage();
	await trang.setViewport({ width: rong, height: CAO, deviceScaleFactor: 1 });
	await trang.emulateMediaFeatures([
		{ name: "prefers-color-scheme", value: nen },
		{ name: "prefers-reduced-motion", value: "reduce" },
	]);
	const res = await trang.goto(`${APP}/`, {
		waitUntil: "networkidle0",
		timeout: CHO_TAI,
	});
	if (!res || res.status() >= 400 || new URL(trang.url()).pathname !== "/")
		await khongDo(
			`KHONG DO DUOC: / tra ${res?.status() ?? "khong phan hoi"}, dung o ${trang.url()}`,
		);
	await trang.addStyleTag({ content: TAT_CHUYEN_DONG });
	if (XEM_SAU) {
		await trang.addStyleTag({ content: CSS_NHAP_SAU });
		await trang.evaluate(apDoiThu, DOI_THU);
	}
	await trang.evaluate(() => document.fonts.ready);
	return trang;
}

try {
	if (chay("E2") || chay("E3")) {
		const trang = await moTrang(1280, "dark");
		const ket2 = await trang.evaluate(docCho, CHO);
		for (const c of ket2) {
			if (chay("E2")) {
				if (c.loi) bao(false, `E2 ${c.so} ${c.ten} ${c.loi}`);
				else
					bao(
						c.that === c.token,
						`E2 ${c.so} ${c.ten} ${c.that} ${c.token} (${c.thuocTinh} = var(--${c.tenToken}))`,
					);
			}
			if (chay("E3") && CHU.includes(c.so)) {
				if (c.loi) bao(false, `E3 ${c.ten} ${c.loi}`);
				else bao(c.tuongPhan >= 4.5, `E3 ${c.ten} ${c.tuongPhan.toFixed(2)}:1`);
			}
		}
		await trang.close();
	}

	if (chay("E5")) {
		const trang = await moTrang(1280, "dark");
		const r = await trang.evaluate(docNhapGoiY, "truoc");
		await trang.evaluate(() => {
			const nhan = [...document.querySelectorAll("p")].find(
				(p) => p.textContent.trim() === "SUGGESTED",
			);
			nhan?.parentElement?.querySelector("button")?.click();
		});
		await trang.waitForFunction(
			() =>
				[...document.querySelectorAll("button[aria-pressed]")].some(
					(b) => b.getAttribute("aria-pressed") === "true",
				),
			{ timeout: 10000 },
		);
		const s = await trang.evaluate(docNhapGoiY, "sau");
		bao(
			!r.loi &&
				!s.loi &&
				r.mau === r.muted &&
				s.mau === s.foreground &&
				s.chu === s.cauBam,
			`E5 "${r.chu}" ${r.mau}(muted ${r.muted}) -> "${s.chu}" ${s.mau}(foreground ${s.foreground})${r.loi ?? ""}${s.loi ?? ""}`,
		);
		await trang.close();
	}

	if (chay("E4") || chay("E6")) {
		mkdirSync(ANH, { recursive: true });
		for (const rong of KHO) {
			const anh = {};
			for (const nen of ["light", "dark"]) {
				const trang = await moTrang(rong, nen);
				anh[nen] = Buffer.from(
					await trang.screenshot({ fullPage: true, type: "png" }),
				);
				await trang.close();
			}
			writeFileSync(join(ANH, `${TIEN_TO}-${rong}.png`), anh.dark);
			const banA = await trinh.newPage();
			const k = await banA.evaluate(
				soAnh,
				`data:image/png;base64,${anh.light.toString("base64")}`,
				`data:image/png;base64,${anh.dark.toString("base64")}`,
				[],
			);
			await banA.close();
			const giong = !k.loi && k.khac === 0;
			if (!giong)
				writeFileSync(
					join(
						GOC,
						".acceptance-runs",
						"hex-trang-gioi-thieu",
						`nen-sang-${TIEN_TO}-${rong}.png`,
					),
					anh.light,
				);
			bao(
				giong,
				`E4 nen-sang${giong ? "=" : "!="}nen-toi ${rong}: ${k.loi ?? `${k.khac} diem khac${k.hop ? ` trong ${k.hop}` : ""}`}`,
			);
			const tepMat = join(BANG_CHUNG, `truoc-mat-${rong}.json`);
			if (TIEN_TO === "truoc") {
				const tr = await moTrang(rong, "dark");
				const m = await tr.evaluate(matHex);
				await tr.close();
				writeFileSync(tepMat, `${JSON.stringify(m)}\n`);
				console.log(`mat na truoc ${rong}: ${m.length} hop`);
			}
			if (TIEN_TO === "truoc") continue;
			const trang = await moTrang(rong, "dark");
			const cho = await trang.evaluate(docCho, CHO);
			const thieu = cho.filter((c) => c.loi).map((c) => c.so);
			if (!existsSync(tepMat))
				await khongDo(
					`KHONG DO DUOC: thieu mat na ${tepMat} (chup bang HTG_TRUOC=1)`,
				);
			const mat = JSON.parse(readFileSync(tepMat, "utf8"));
			await trang.evaluate(() => {
				const h = document.querySelector("h1");
				if (h) h.style.color = "rgb(255, 0, 0)";
			});
			const hong = Buffer.from(
				await trang.screenshot({ fullPage: true, type: "png" }),
			);
			await trang.close();
			const tep = join(BANG_CHUNG, `truoc-${rong}.png`);
			if (!existsSync(tep))
				await khongDo(
					`KHONG DO DUOC: thieu anh truoc ${tep} (chup bang HTG_TRUOC=1 tu onehub truoc vong)`,
				);
			const truoc = `data:image/png;base64,${readFileSync(tep).toString("base64")}`;
			const sau = `data:image/png;base64,${anh.dark.toString("base64")}`;
			const ban = await trinh.newPage();
			const doiChung = await ban.evaluate(
				soAnh,
				sau,
				`data:image/png;base64,${hong.toString("base64")}`,
				mat,
			);
			if (doiChung.loi || doiChung.khac === 0)
				await khongDo(
					`KHONG DO DUOC: doi chung duong E6 khong bat doi mau h1 ngoai mat na o ${rong} (${doiChung.loi ?? "0 diem khac"})`,
				);
			const so = await ban.evaluate(soAnh, truoc, sau, mat);
			await ban.close();
			bao(
				!so.loi && so.khac === 0 && thieu.length === 0,
				`E6 truoc-vs-sau ${rong} ngoai 11 cho: ${so.loi ?? `${so.khac} diem khac${so.dau ? ` (dau tien ${so.dau})` : ""}`}${thieu.length ? `; khong thay cho ${thieu.join(",")}` : ""} (doi chung duong: ${doiChung.khac} diem)`,
			);
		}
		console.log(`anh: ${ANH}/${TIEN_TO}-{1280,375}.png`);
	}
} catch (loi) {
	console.log(`KHONG DO DUOC: thuoc vap loi: ${loi?.stack ?? loi}`);
	await ket(2);
}

console.log(`KET LUAN SN2: ${dung} DUNG, ${sai} SAI`);
await ket(sai === 0 ? 0 : 1);
