#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";

const THU_MUC = dirname(fileURLToPath(import.meta.url));
const HO_SO = dirname(THU_MUC);
const GOC = dirname(dirname(HO_SO));

const DUONG_UI = join(GOC, "packages/ui");
const DUONG_VAT = join(DUONG_UI, "test/vat-do-cuon.tsx");
const DUONG_GLOBALS = join(DUONG_UI, "src/styles/globals.css");
const DUONG_TAILWIND = join(DUONG_UI, "node_modules/tailwindcss");
const DUONG_CONVERSATION = join(
	DUONG_UI,
	"src/components/ai-elements/conversation.tsx",
);
const DUONG_SCROLLER = join(DUONG_UI, "src/components/message-scroller.tsx");
const DUONG_BANG_CHUNG = join(HO_SO, "evidence/so-do-cuon.json");

const NGUONG_TI_SO = 1.2;
const NGUONG_PHAN_UNG = 1.5;
const CAC_CO = [50, 200, 500];
const SO_LUOT_DO = 15;
const VONG_TRONG = 10;
const CAO_KHUNG = 600;
const RONG_KHUNG = 760;
const LOP_BAN_VA = ["content-visibility", "contain-intrinsic-size"];

const loi = [];

function ghiLoi(...dong) {
	loi.push(dong);
}

function thoat(ma, ...dong) {
	for (const d of dong) console.error(d);
	process.exit(ma);
}

function docGoi(duong) {
	return JSON.parse(readFileSync(join(duong, "package.json"), "utf8"));
}

function thuMucGoi(ten, tu) {
	let noi = tu;
	for (;;) {
		const ung = join(noi, "node_modules", ten);
		if (existsSync(join(ung, "package.json"))) return ung;
		const cha = dirname(noi);
		if (cha === noi) return null;
		noi = cha;
	}
}

function duongTuCua(cua) {
	const bang = Object(cua);
	if (bang !== cua) return cua ?? null;
	return bang.style ?? bang.default ?? null;
}

function giaiQuyetCss(id, neo) {
	if (id.startsWith(".") || isAbsolute(id)) return join(neo, id);

	const doan = id.split("/");
	const ten = id.startsWith("@") ? doan.slice(0, 2).join("/") : doan[0];
	const nhanh = id.slice(ten.length);
	const goi = thuMucGoi(ten, neo) ?? thuMucGoi(ten, DUONG_UI);

	if (!goi) throw new Error(`so-do-cuon: khong tim thay goi ${ten}`);

	const meta = docGoi(goi);
	const cua = meta.exports?.[nhanh === "" ? "." : `.${nhanh}`];
	const duong =
		duongTuCua(cua) ?? meta.style ?? (nhanh === "" ? "index.css" : nhanh);

	return join(goi, duong);
}

function dungGoiVat() {
	const noi = mkdtempSync(join(tmpdir(), "so-do-cuon-"));
	const dich = join(noi, "vat.js");

	try {
		const chay = spawnSync(
			"bun",
			[
				"build",
				DUONG_VAT,
				`--outfile=${dich}`,
				"--format=iife",
				"--target=browser",
				"--production",
			],
			{ cwd: DUONG_UI, encoding: "utf8" },
		);

		if (chay.status !== 0) {
			thoat(
				2,
				`so-do-cuon: khong dung duoc goi tu ${relative(GOC, DUONG_VAT)}`,
				chay.stderr || chay.stdout || "",
				"so-do-cuon: khong co goi thi khong co component that de do",
			);
		}

		return readFileSync(dich, "utf8");
	} finally {
		rmSync(noi, { recursive: true, force: true });
	}
}

async function dungCss(ungVien) {
	const { compile } = await import(
		pathToFileURL(join(DUONG_TAILWIND, "dist/lib.mjs")).href
	);

	const bo = await compile(readFileSync(DUONG_GLOBALS, "utf8"), {
		base: dirname(DUONG_GLOBALS),
		loadStylesheet: async (id, neo) => {
			const duong = giaiQuyetCss(id, neo);
			return {
				path: duong,
				base: dirname(duong),
				content: readFileSync(duong, "utf8"),
			};
		},
	});

	return bo.build(ungVien);
}

const UNG_VIEN_TRINH_DUYET = [
	process.env.CHROME_PATH,
	"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	"/Applications/Chromium.app/Contents/MacOS/Chromium",
	"/usr/bin/google-chrome",
	"/usr/bin/chromium",
	"/usr/bin/chromium-browser",
].filter(Boolean);

const duongTrinhDuyet = UNG_VIEN_TRINH_DUYET.find((p) => {
	try {
		return existsSync(p);
	} catch {
		return false;
	}
});

if (!duongTrinhDuyet) {
	thoat(
		2,
		"so-do-cuon: khong tim thay Chrome/Chromium — dat CHROME_PATH tro toi tep chay",
		"so-do-cuon: jsdom khong bo cuc nen khong duoc phep do o do; khong co trinh duyet thi khong co so",
	);
}

const goiVat = dungGoiVat();

const TRANG = `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><style>
html, body { margin: 0; padding: 0; }
body { font: 14px/1.5 system-ui, sans-serif; }
#khung { position: relative; width: ${RONG_KHUNG}px; height: ${CAO_KHUNG}px; overflow: hidden; }
#khung > * { width: 100%; height: 100%; }
</style></head><body><div id="khung"></div></body></html>`;

const trinhDuyet = await puppeteer
	.launch({
		executablePath: duongTrinhDuyet,
		headless: "new",
		args: ["--no-sandbox", "--disable-lcd-text"],
	})
	.catch((e) => {
		thoat(
			2,
			`so-do-cuon: khong khoi dong duoc trinh duyet tai ${duongTrinhDuyet}`,
			`so-do-cuon: ${e?.message ?? e}`,
		);
	});

let ketQua;
let hieuUng;
let soLopThat = 0;
let phienBan = "khong ro";

try {
	phienBan = await trinhDuyet.version();
	const trang = await trinhDuyet.newPage();
	const loiTrang = [];
	trang.on("pageerror", (e) => loiTrang.push(e.message));

	await trang.setViewport({
		width: RONG_KHUNG + 40,
		height: CAO_KHUNG + 40,
	});
	await trang.setContent(TRANG, { waitUntil: "load" });
	await trang.addScriptTag({ content: goiVat });

	if (loiTrang.length > 0) {
		thoat(
			2,
			"so-do-cuon: goi component that no khi nap",
			...loiTrang.map((d) => `  ${d}`),
		);
	}

	const lopThat = await trang.evaluate(() => {
		const tap = new Set();
		for (const kieu of ["conversation", "message-scroller"]) {
			const mau = window.VAT_DO_CUON.mauThat(kieu, 3);
			for (const el of [mau, ...mau.querySelectorAll("*")]) {
				for (const t of el.classList) tap.add(t);
			}
		}
		return [...tap];
	});

	soLopThat = lopThat.length;

	if (soLopThat === 0) {
		thoat(
			2,
			"so-do-cuon: component that dung ra cay khong mang lop nao",
			"so-do-cuon: khong co lop that thi khong co gi de dung CSS that tu do",
		);
	}

	await trang.addStyleTag({ content: await dungCss(lopThat) });

	hieuUng = await trang.evaluate((lopVa) => {
		const doHieuUng = (kieu, sau) => {
			const mau = window.VAT_DO_CUON.mauThat(kieu, 5);
			document.body.appendChild(mau);
			const luot = [...mau.querySelectorAll("[data-luot]")];
			const mang = luot.map((el) => (sau ? el.parentElement : el));
			const doc = mang.map((el) => {
				const kieuTinh = getComputedStyle(el);
				return {
					contentVisibility: kieuTinh.contentVisibility,
					containIntrinsicSize: kieuTinh.containIntrinsicSize,
				};
			});
			mau.remove();

			const bo = (ten) => [...new Set(doc.map((d) => d[ten]))];

			return {
				soPhanTu: doc.length,
				contentVisibility: bo("contentVisibility"),
				containIntrinsicSize: bo("containIntrinsicSize"),
				boQuaBoCucNgoaiKhung: doc.every(
					(d) => d.contentVisibility === "auto",
				),
				coKichThuocDuDoan: doc.every(
					(d) =>
						d.containIntrinsicSize !== "" &&
						d.containIntrinsicSize !== "none" &&
						d.containIntrinsicSize !== "normal",
				),
			};
		};

		return {
			lopVa,
			conversation: doHieuUng("conversation", false),
			messageScroller: doHieuUng("message-scroller", true),
		};
	}, LOP_BAN_VA);

	ketQua = await trang.evaluate(
		async (co, soLuotDo, vongTrong, lopVa) => {
			const khung = document.getElementById("khung");

			const goBanVa = (el) => {
				for (const n of [el, ...el.querySelectorAll("*")]) {
					const giu = [...n.classList].filter(
						(t) => !lopVa.some((k) => t.includes(k)),
					);
					if (giu.length !== n.classList.length) n.className = giu.join(" ");
				}
				return el;
			};

			const kho = new Map();
			const layMau = (kieu, soLuot, goVa) => {
				const khoa = `${kieu}|${soLuot}|${goVa}`;
				let mau = kho.get(khoa);
				if (!mau) {
					mau = window.VAT_DO_CUON.mauThat(kieu, soLuot);
					if (goVa) goBanVa(mau);
					kho.set(khoa, mau);
				}
				return mau;
			};

			const nghi = () => new Promise((r) => setTimeout(r, 25));

			const motMau = async (c) => {
				const mau = layMau(c.kieu, c.soLuot, c.goVa);
				const cacBan = [];
				for (let k = 0; k < vongTrong; k++) {
					cacBan.push(mau.cloneNode(true));
				}
				khung.replaceChildren();
				void document.body.offsetHeight;
				await nghi();

				const t0 = performance.now();
				for (const ban of cacBan) {
					khung.appendChild(ban);
					void ban.scrollHeight;
					void ban.getBoundingClientRect().height;
					khung.replaceChildren();
				}
				const t1 = performance.now();

				await nghi();
				return (t1 - t0) / vongTrong;
			};

			const lon = co[co.length - 1];
			const cacCauHinh = [];

			for (const n of co) {
				cacCauHinh.push({
					ten: `ms_${n}`,
					kieu: "message-scroller",
					soLuot: n,
					goVa: false,
				});
				cacCauHinh.push({
					ten: `cv_${n}`,
					kieu: "conversation",
					soLuot: n,
					goVa: false,
				});
			}

			cacCauHinh.push({
				ten: "cv_go_va",
				kieu: "conversation",
				soLuot: lon,
				goVa: true,
			});
			cacCauHinh.push({
				ten: "ms_go_nhin",
				kieu: "message-scroller",
				soLuot: lon,
				goVa: true,
			});

			const gom = {};
			for (const c of cacCauHinh) gom[c.ten] = [];

			for (let vong = 0; vong < soLuotDo; vong++) {
				for (let i = 0; i < cacCauHinh.length; i++) {
					const c = cacCauHinh[(i + vong) % cacCauHinh.length];
					gom[c.ten].push(await motMau(c));
				}
			}

			const tong = (ten) => {
				const mau = gom[ten].slice().sort((a, b) => a - b);
				return {
					giua: Math.round(mau[Math.floor(mau.length / 2)] * 1000) / 1000,
					nhoNhat: Math.round(mau[0] * 1000) / 1000,
					lonNhat: Math.round(mau[mau.length - 1] * 1000) / 1000,
					soMau: mau.length,
					vongMoiMau: vongTrong,
				};
			};

			const messageScroller = {};
			const conversation = {};
			for (const n of co) {
				messageScroller[n] = tong(`ms_${n}`);
				conversation[n] = tong(`cv_${n}`);
			}

			return {
				messageScroller,
				conversation,
				conversationGoBanVa: tong("cv_go_va"),
				messageScrollerGoNhin: tong("ms_go_nhin"),
				thuTuDo:
					"vong tron xen ke: moi vong do mot mau cho tung cau hinh, vi tri xoay theo so vong de trieu tieu troi may",
			};
		},
		CAC_CO,
		SO_LUOT_DO,
		VONG_TRONG,
		LOP_BAN_VA,
	);

	if (loiTrang.length > 0) {
		thoat(
			2,
			"so-do-cuon: component that no trong luc do",
			...loiTrang.map((d) => `  ${d}`),
		);
	}
} finally {
	await trinhDuyet.close();
}

const lon = CAC_CO[CAC_CO.length - 1];
const msLon = ketQua.messageScroller[lon].giua;
const cvSauVa = ketQua.conversation[lon].giua;
const cvTruocVa = ketQua.conversationGoBanVa.giua;
const msGo = ketQua.messageScrollerGoNhin.giua;

const lamTron = (x) => Math.round(x * 100) / 100;
const tiSoTruocVa = lamTron(cvTruocVa / msLon);
const tiSoSauVa = lamTron(cvSauVa / msLon);
const tiSoKhiGoNhin = lamTron(cvSauVa / msGo);
const boiPhanUng = lamTron(msGo / msLon);
const boiBanVa = lamTron(cvTruocVa / cvSauVa);

const oDo = {};
for (const n of CAC_CO) {
	oDo[`messageScroller_${n}`] = ketQua.messageScroller[n].giua;
	oDo[`conversation_${n}`] = ketQua.conversation[n].giua;
}

const oThieu = Object.entries(oDo)
	.filter(([, v]) => v === null || v === undefined || Number.isNaN(v))
	.map(([k]) => k);

const banVaCoHieuUng =
	hieuUng.conversation.boQuaBoCucNgoaiKhung &&
	hieuUng.conversation.coKichThuocDuDoan;
const banVaCoTacDung = boiBanVa >= NGUONG_PHAN_UNG;
const thuocPhanUng = boiPhanUng >= NGUONG_PHAN_UNG && tiSoKhiGoNhin < tiSoSauVa;
const datNguong = tiSoSauVa <= NGUONG_TI_SO;

const banGhi = {
	sinhLuc: new Date().toISOString(),
	donVi: "mili giay, thoi gian bo cuc dong bo cua lan gan cay vao trang",
	trinhDuyet: { duong: duongTrinhDuyet, phienBan },
	vat: {
		cachDung:
			"bun build dong goi chinh Conversation/ConversationContent va MessageScroller* that; React dung cay that trong trinh duyet roi cloneNode lay ban DOM that lam mau do",
		diemVao: relative(GOC, DUONG_VAT),
		conversation: relative(GOC, DUONG_CONVERSATION),
		messageScroller: relative(GOC, DUONG_SCROLLER),
		css: {
			nguon: relative(GOC, DUONG_GLOBALS),
			cachDung:
				"tailwindcss dich chinh globals.css cua kho, ung vien la cac lop doc tu DOM that do component sinh ra — khong hang CSS nao chep tay",
			soLopThat,
		},
	},
	banVaThat: {
		tep: relative(GOC, DUONG_CONVERSATION),
		doBang: "kieu tinh toan cua tung luot trong cay Conversation that",
		daApDung: banVaCoHieuUng,
		hieuUng,
		coTacDung: banVaCoTacDung,
		boiBanVa,
		nguongTacDung: NGUONG_PHAN_UNG,
		cachGoDeThu:
			"go lop mang content-visibility / contain-intrinsic-size khoi DOM that da dung — cung cay, cung CSS, chi thieu ban va",
	},
	cachDo: {
		soLuotDoMoiO: SO_LUOT_DO,
		vongTrongMoiMau: VONG_TRONG,
		lay: `trung vi cua ${SO_LUOT_DO} mau; moi mau la ${VONG_TRONG} lan gan cay do lien tiep roi chia deu, vi mot lan don o cau hinh nhanh nam duoi nhieu do dong ho`,
		khung: { rong: RONG_KHUNG, cao: CAO_KHUNG },
	},
	oDo,
	chiTiet: ketQua,
	ca500: {
		conversationTruocVa: cvTruocVa,
		conversationSauVa: cvSauVa,
		messageScroller: msLon,
		tiSoTruocVa,
		tiSoSauVa,
		nguong: NGUONG_TI_SO,
		dat: datNguong,
	},
	chieuDo: {
		moTa:
			"go content-visibility khoi MessageScrollerItem that trong DOM da dung, khong sua tep nguon",
		messageScroller500CoNhin: msLon,
		messageScroller500GoNhin: msGo,
		boiPhanUng,
		nguongPhanUng: NGUONG_PHAN_UNG,
		tiSoKhiCoNhin: tiSoSauVa,
		tiSoKhiGoNhin,
		thuocPhanUng,
	},
	ketLuan:
		oThieu.length === 0 &&
		banVaCoHieuUng &&
		banVaCoTacDung &&
		thuocPhanUng &&
		datNguong
			? "dat"
			: "khong-dat",
};

mkdirSync(dirname(DUONG_BANG_CHUNG), { recursive: true });
writeFileSync(DUONG_BANG_CHUNG, `${JSON.stringify(banGhi, null, 2)}\n`);

console.log(`so-do-cuon — trinh duyet that: ${phienBan}`);
console.log(`  tep chay: ${duongTrinhDuyet}`);
console.log(`  vat do  : ${relative(GOC, DUONG_VAT)} (component that, ${soLopThat} lop that)`);
console.log(`  css     : ${relative(GOC, DUONG_GLOBALS)} qua tailwindcss`);
console.log(`  bang chung: ${relative(GOC, DUONG_BANG_CHUNG)}`);
console.log("");
console.log("  sau o do (ms, trung vi):");
for (const n of CAC_CO) {
	console.log(
		`    ${String(n).padStart(3)} luot — MessageScroller ${String(ketQua.messageScroller[n].giua).padStart(8)}   Conversation ${String(ketQua.conversation[n].giua).padStart(8)}`,
	);
}
console.log("");
console.log(`  ca ${lon} luot:`);
console.log(`    Conversation truoc va : ${cvTruocVa} ms`);
console.log(`    Conversation sau va   : ${cvSauVa} ms`);
console.log(`    MessageScroller       : ${msLon} ms`);
console.log(
	`    ti so Conversation/MessageScroller — truoc va ${tiSoTruocVa}x, sau va ${tiSoSauVa}x (nguong ${NGUONG_TI_SO})`,
);
console.log("");
console.log("  ban va that trong conversation.tsx:");
console.log(
	`    kieu tinh toan cua luot: content-visibility ${hieuUng.conversation.contentVisibility.join(", ")} · contain-intrinsic-size ${hieuUng.conversation.containIntrinsicSize.join(", ")}`,
);
console.log(`    go ban va khoi cay that: ${cvTruocVa} ms so voi ${cvSauVa} ms (${boiBanVa}x)`);
console.log("");
console.log("  chieu do — go content-visibility khoi MessageScrollerItem that:");
console.log(`    MessageScroller ${lon} co nhin: ${msLon} ms`);
console.log(`    MessageScroller ${lon} go nhin: ${msGo} ms  (${boiPhanUng}x)`);

if (oThieu.length > 0) {
	ghiLoi(
		`so-do-cuon: thieu o do: ${oThieu.join(", ")} — sau o phai co so, khong o nao rong`,
	);
}

if (!banVaCoHieuUng) {
	ghiLoi(
		`so-do-cuon: ban va KHONG co hieu ung trong ${relative(GOC, DUONG_CONVERSATION)}`,
		`  luot trong cay Conversation that co content-visibility = ${hieuUng.conversation.contentVisibility.join(", ")} (can auto)`,
		`  va contain-intrinsic-size = ${hieuUng.conversation.containIntrinsicSize.join(", ")} (can mot kich thuoc du doan)`,
		"  do bang kieu tinh toan cua trinh duyet tren cay that, khong bang chuoi co mat trong tep nguon",
		"  ban va that: '[&>*]:[content-visibility:auto]' va '[&>*]:[contain-intrinsic-size:auto_10rem]' tren ConversationContent",
	);
}

if (!banVaCoTacDung) {
	ghiLoi(
		`so-do-cuon: ban va co mat nhung KHONG doi so — go no khoi cay that chi lam ca ${lon} doi tu ${cvSauVa} ms sang ${cvTruocVa} ms (${boiBanVa}x, can >= ${NGUONG_PHAN_UNG}x)`,
		`  mot ban va khong doi so do la mot ban va khong con lam gi trong ${relative(GOC, DUONG_CONVERSATION)}`,
	);
}

if (!thuocPhanUng) {
	ghiLoi(
		"so-do-cuon: thuoc khong phan ung",
		`  go content-visibility khoi MessageScrollerItem chi lam ca ${lon} doi tu ${msLon} ms sang ${msGo} ms (${boiPhanUng}x, can >= ${NGUONG_PHAN_UNG}x)`,
		`  ti so di tu ${tiSoSauVa}x sang ${tiSoKhiGoNhin}x`,
		"  go mot thuoc tinh bo cuc that ma so khong doi nghia la phep do dang do thu khac chu khong do bo cuc",
	);
}

if (!datNguong) {
	ghiLoi(
		`so-do-cuon: ca ${lon} luot khong dat nguong ${NGUONG_TI_SO}`,
		`  Conversation truoc va ${cvTruocVa} ms — Conversation sau va ${cvSauVa} ms — MessageScroller ${msLon} ms`,
		`  ti so Conversation/MessageScroller sau va = ${tiSoSauVa} > ${NGUONG_TI_SO}`,
	);
}

if (loi.length > 0) {
	thoat(1, "", ...loi.flat());
}

console.log("");
console.log(
	`so-do-cuon: dat — ti so sau va ${tiSoSauVa} <= ${NGUONG_TI_SO}; ban va do duoc hieu ung tren cay that va go no ra lam cham ${boiBanVa}x; thuoc phan ung ${boiPhanUng}x`,
);
