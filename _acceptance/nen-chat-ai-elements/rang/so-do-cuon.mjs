#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const THU_MUC = dirname(fileURLToPath(import.meta.url));
const HO_SO = dirname(THU_MUC);
const GOC = dirname(dirname(HO_SO));

const DUONG_SCROLLER = join(
	GOC,
	"packages/ui/src/components/message-scroller.tsx",
);
const DUONG_CONVERSATION = join(
	GOC,
	"packages/ui/src/components/ai-elements/conversation.tsx",
);
const DUONG_BANG_CHUNG = join(HO_SO, "evidence/so-do-cuon.json");

const NGUONG_TI_SO = 1.2;
const NGUONG_PHAN_UNG = 1.5;
const CAC_CO = [50, 200, 500];
const SO_LUOT_DO = 15;
const VONG_TRONG = 10;
const CAO_KHUNG = 600;
const RONG_KHUNG = 760;

function thoat(ma, ...dong) {
	for (const d of dong) console.error(d);
	process.exit(ma);
}

function docNguon(duong, ten) {
	if (!existsSync(duong)) {
		thoat(
			2,
			`so-do-cuon: khong tim thay ${ten} tai ${relative(GOC, duong)}`,
			"so-do-cuon: khong do duoc mot vat khong co mat",
		);
	}
	return readFileSync(duong, "utf8").split("\n");
}

function timDong(dong, chuoi) {
	const i = dong.findIndex((d) => d.includes(chuoi));
	return i < 0 ? null : i + 1;
}

const dongScroller = docNguon(DUONG_SCROLLER, "message-scroller.tsx");
const dongConversation = docNguon(DUONG_CONVERSATION, "conversation.tsx");

const dongNhin = timDong(dongScroller, "[content-visibility:auto]");
const dongKichThuoc = timDong(
	dongScroller,
	"[contain-intrinsic-size:auto_10rem]",
);

if (!dongNhin || !dongKichThuoc) {
	thoat(
		2,
		"so-do-cuon: khong tim thay [content-visibility:auto] hoac [contain-intrinsic-size:auto_10rem] trong message-scroller.tsx",
		"so-do-cuon: trang thu duoc dung tu chinh hai thuoc tinh do — thieu chung thi phep do khong con vat de do",
	);
}

const conversationCoNhin =
	timDong(dongConversation, "content-visibility") !== null ||
	timDong(dongConversation, "contain-intrinsic-size") !== null;

const UNG_VIEN = [
	process.env.CHROME_PATH,
	"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	"/Applications/Chromium.app/Contents/MacOS/Chromium",
	"/usr/bin/google-chrome",
	"/usr/bin/chromium",
	"/usr/bin/chromium-browser",
].filter(Boolean);

const duongTrinhDuyet = UNG_VIEN.find((p) => {
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

const TRANG = `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font: 14px/1.5 system-ui, sans-serif; }
#khung { position: relative; width: ${RONG_KHUNG}px; height: ${CAO_KHUNG}px; overflow: hidden; }
.o-cuon { width: 100%; height: 100%; min-width: 0; min-height: 0; overflow-y: auto; overscroll-behavior: contain; }
.o-cuon.chua-noi-dung { contain: content; }
.noi-dung-ms { display: flex; height: max-content; min-height: 100%; flex-direction: column; gap: 1.5rem; }
.noi-dung-cv { display: flex; flex-direction: column; gap: 2rem; padding: 1rem; }
.luot { min-width: 0; flex-shrink: 0; display: flex; gap: 0.75rem; }
.luot.co-nhin { contain-intrinsic-size: auto 10rem; content-visibility: auto; }
.mat { width: 32px; height: 32px; flex-shrink: 0; border-radius: 5px; background: #e5e5e5; }
.bong { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.bong p { border-radius: 8px; background: #f4f4f4; padding: 0.75rem; }
.bong .nhan { display: flex; flex-wrap: wrap; gap: 0.25rem; }
.bong .nhan span { border-radius: 4px; border: 1px solid #ddd; padding: 0.125rem 0.375rem; font-size: 12px; }
</style></head><body><div id="khung"></div></body></html>`;

const trinhDuyet = await puppeteer
	.launch({
		executablePath: duongTrinhDuyet,
		headless: "new",
		args: ["--no-sandbox", "--disable-lcd-text"],
	})
	.catch((loi) => {
		thoat(
			2,
			`so-do-cuon: khong khoi dong duoc trinh duyet tai ${duongTrinhDuyet}`,
			`so-do-cuon: ${loi?.message ?? loi}`,
		);
	});

let ketQua;
let phienBan = "khong ro";
try {
	phienBan = await trinhDuyet.version();
	const trang = await trinhDuyet.newPage();
	await trang.setViewport({ width: RONG_KHUNG + 40, height: CAO_KHUNG + 40 });
	await trang.setContent(TRANG, { waitUntil: "load" });

	ketQua = await trang.evaluate(
		async (co, soLuotDo, vongTrong) => {
			const khung = document.getElementById("khung");
			const chu =
				"Khach hang hoi ve han muc va phi tra truoc; can doi chieu voi ho so moi gioi da nop tuan truoc roi tra loi trong ngay.";

			const dungLuot = (coNhin) => {
				const luot = document.createElement("div");
				luot.className = coNhin ? "luot co-nhin" : "luot";
				const mat = document.createElement("div");
				mat.className = "mat";
				const bong = document.createElement("div");
				bong.className = "bong";
				for (let i = 0; i < 3; i++) {
					const p = document.createElement("p");
					p.textContent = `${chu} ${chu}`;
					bong.appendChild(p);
				}
				const nhan = document.createElement("div");
				nhan.className = "nhan";
				for (let i = 0; i < 6; i++) {
					const s = document.createElement("span");
					s.textContent = `nguon-${i}`;
					nhan.appendChild(s);
				}
				bong.appendChild(nhan);
				luot.appendChild(mat);
				luot.appendChild(bong);
				return luot;
			};

			const dungCay = (kieu, soLuot, coNhin) => {
				const oCuon = document.createElement("div");
				oCuon.className = kieu === "ms" ? "o-cuon chua-noi-dung" : "o-cuon";
				const noiDung = document.createElement("div");
				noiDung.className = kieu === "ms" ? "noi-dung-ms" : "noi-dung-cv";
				const mau = dungLuot(coNhin);
				for (let i = 0; i < soLuot; i++) {
					noiDung.appendChild(mau.cloneNode(true));
				}
				oCuon.appendChild(noiDung);
				return { oCuon, noiDung };
			};

			const nghi = () => new Promise((r) => setTimeout(r, 25));

			const motMau = async (cauHinh) => {
				const cacCay = [];
				for (let k = 0; k < vongTrong; k++) {
					cacCay.push(dungCay(cauHinh.kieu, cauHinh.soLuot, cauHinh.coNhin));
				}
				khung.replaceChildren();
				void document.body.offsetHeight;
				await nghi();
				const t0 = performance.now();
				for (const { oCuon, noiDung } of cacCay) {
					khung.appendChild(oCuon);
					void oCuon.scrollHeight;
					void noiDung.getBoundingClientRect().height;
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
					kieu: "ms",
					soLuot: n,
					coNhin: true,
				});
				cacCauHinh.push({
					ten: `cv_${n}`,
					kieu: "cv",
					soLuot: n,
					coNhin: false,
				});
			}
			cacCauHinh.push({
				ten: "cv_sau_va",
				kieu: "cv",
				soLuot: lon,
				coNhin: true,
			});
			cacCauHinh.push({
				ten: "ms_go_nhin",
				kieu: "ms",
				soLuot: lon,
				coNhin: false,
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
				conversationSauVa: tong("cv_sau_va"),
				messageScrollerGoNhin: tong("ms_go_nhin"),
				thuTuDo:
					"vong tron xen ke: moi vong do mot mau cho tung cau hinh, vi tri xoay theo so vong de trieu tieu troi may",
			};
		},
		CAC_CO,
		SO_LUOT_DO,
		VONG_TRONG,
	);
} finally {
	await trinhDuyet.close();
}

const lon = CAC_CO[CAC_CO.length - 1];
const msLon = ketQua.messageScroller[lon].giua;
const cvTruoc = ketQua.conversation[lon].giua;
const cvSau = ketQua.conversationSauVa.giua;
const msGo = ketQua.messageScrollerGoNhin.giua;

const lamTron = (x) => Math.round(x * 100) / 100;
const tiSoTruocVa = lamTron(cvTruoc / msLon);
const tiSoSauVa = lamTron(cvSau / msLon);
const tiSoKhiGoNhin = lamTron(cvTruoc / msGo);
const boiPhanUng = lamTron(msGo / msLon);

const oDo = {};
for (const n of CAC_CO) {
	oDo[`messageScroller_${n}`] = ketQua.messageScroller[n].giua;
	oDo[`conversation_${n}`] = ketQua.conversation[n].giua;
}
const oThieu = Object.entries(oDo)
	.filter(([, v]) => v === null || v === undefined || Number.isNaN(v))
	.map(([k]) => k);

const thuocPhanUng =
	boiPhanUng >= NGUONG_PHAN_UNG && tiSoKhiGoNhin < tiSoTruocVa;
const datNguong = tiSoSauVa <= NGUONG_TI_SO;

const banGhi = {
	sinhLuc: new Date().toISOString(),
	donVi: "mili giay, thoi gian bo cuc dong bo cua lan gan cay vao trang",
	trinhDuyet: { duong: duongTrinhDuyet, phienBan },
	vat: {
		messageScroller: {
			tep: relative(GOC, DUONG_SCROLLER),
			dongContentVisibility: dongNhin,
			dongContainIntrinsicSize: dongKichThuoc,
		},
		conversation: {
			tep: relative(GOC, DUONG_CONVERSATION),
			coHaiThuocTinh: conversationCoNhin,
		},
	},
	cachDo: {
		soLuotDoMoiO: SO_LUOT_DO,
		vongTrongMoiMau: VONG_TRONG,
		lay: `trung vi cua ${SO_LUOT_DO} mau; moi mau la ${VONG_TRONG} lan gan cay do lien tiep roi chia deu, vi mot lan don o cau hinh nhanh nam duoi nhieu do dong ho`,
		khung: { rong: RONG_KHUNG, cao: CAO_KHUNG },
		nguon:
			"trang thu tai dung lai dung hai thuoc tinh CSS doc tu message-scroller.tsx; jsdom khong bo cuc nen khong do o do",
	},
	oDo,
	chiTiet: ketQua,
	ca500: {
		conversationTruocVa: cvTruoc,
		conversationSauVa: cvSau,
		messageScroller: msLon,
		tiSoTruocVa,
		tiSoSauVa,
		nguong: NGUONG_TI_SO,
		dat: datNguong,
	},
	chieuDo: {
		mo_ta:
			"go content-visibility khoi MessageScrollerItem ngay trong trang thu, khong sua tep nguon",
		messageScroller500CoNhin: msLon,
		messageScroller500GoNhin: msGo,
		boiPhanUng,
		nguongPhanUng: NGUONG_PHAN_UNG,
		tiSoTruocKhiGo: tiSoTruocVa,
		tiSoSauKhiGo: tiSoKhiGoNhin,
		thuocPhanUng,
	},
	banVaThat: {
		tep: relative(GOC, DUONG_CONVERSATION),
		daApDung: conversationCoNhin,
		haiDongCanThem: [
			"content-visibility: auto",
			"contain-intrinsic-size: auto 10rem",
		],
		ghiChu:
			"so 'sau va' do bang cach chen hai thuoc tinh vao con cua ConversationContent trong trang thu; ban va that phai vao conversation.tsx o viec sau",
	},
	ketLuan:
		oThieu.length === 0 && thuocPhanUng && datNguong ? "dat" : "khong-dat",
};

mkdirSync(dirname(DUONG_BANG_CHUNG), { recursive: true });
writeFileSync(DUONG_BANG_CHUNG, `${JSON.stringify(banGhi, null, 2)}\n`);

console.log(`so-do-cuon — trinh duyet that: ${phienBan}`);
console.log(`  tep chay: ${duongTrinhDuyet}`);
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
console.log(`    Conversation truoc va : ${cvTruoc} ms`);
console.log(`    Conversation sau va   : ${cvSau} ms`);
console.log(`    MessageScroller       : ${msLon} ms`);
console.log(
	`    ti so Conversation/MessageScroller — truoc va ${tiSoTruocVa}x, sau va ${tiSoSauVa}x (nguong ${NGUONG_TI_SO})`,
);
console.log("");
console.log(
	"  chieu do — go content-visibility khoi MessageScrollerItem trong trang thu:",
);
console.log(`    MessageScroller ${lon} co nhin: ${msLon} ms`);
console.log(`    MessageScroller ${lon} go nhin: ${msGo} ms  (${boiPhanUng}x)`);
console.log(`    ti so tut tu ${tiSoTruocVa}x xuong ${tiSoKhiGoNhin}x`);

if (oThieu.length > 0) {
	thoat(
		1,
		`so-do-cuon: thieu o do: ${oThieu.join(", ")} — sau o phai co so, khong o nao rong`,
	);
}

if (!thuocPhanUng) {
	thoat(
		1,
		"so-do-cuon: thuoc khong phan ung",
		`  go content-visibility khoi MessageScrollerItem chi lam ca ${lon} doi tu ${msLon} ms sang ${msGo} ms (${boiPhanUng}x, can >= ${NGUONG_PHAN_UNG}x)`,
		`  ti so di tu ${tiSoTruocVa}x sang ${tiSoKhiGoNhin}x`,
		"  go mot thuoc tinh bo cuc that ma so khong doi nghia la phep do dang do thu khac chu khong do bo cuc",
	);
}

if (!datNguong) {
	thoat(
		1,
		`so-do-cuon: ca ${lon} luot khong dat nguong ${NGUONG_TI_SO}`,
		`  Conversation truoc va ${cvTruoc} ms — Conversation sau va ${cvSau} ms — MessageScroller ${msLon} ms`,
		`  ti so Conversation/MessageScroller sau va = ${tiSoSauVa} > ${NGUONG_TI_SO}`,
		"  mot ban va CO MAT ma ti so van cao la khong dat: thuoc la quan he, khong phai co mat",
		`  ban va that: them 'content-visibility: auto' va 'contain-intrinsic-size: auto 10rem' cho con cua ConversationContent trong ${relative(GOC, DUONG_CONVERSATION)}`,
	);
}

console.log("");
console.log(
	`so-do-cuon: dat — ti so sau va ${tiSoSauVa} <= ${NGUONG_TI_SO}, thuoc phan ung ${boiPhanUng}x khi go content-visibility`,
);
if (!conversationCoNhin) {
	console.log(
		`so-do-cuon: LUU Y — ban va that CHUA co trong ${relative(GOC, DUONG_CONVERSATION)}; so 'sau va' o tren do tren trang thu. Viec sau phai them dung hai dong: 'content-visibility: auto' va 'contain-intrinsic-size: auto 10rem' len con cua ConversationContent.`,
	);
}
