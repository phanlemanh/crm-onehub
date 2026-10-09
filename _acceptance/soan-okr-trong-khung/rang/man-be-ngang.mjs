import { tre } from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import { choBanNhap, datCss, lanThan, so } from "./do-khung.mjs";
import {
	anh,
	CHON,
	chungTrang,
	duongKhung,
	dungYen,
	ghi,
	hopKhung,
	KHUNG,
	khongDo,
	kiem,
	MAN,
	mo,
	moCuocMoi,
	nop1,
	saiThem,
	tranVaCuon,
	trang,
} from "./man-chung.mjs";

const KHO = [
	[1024, 768],
	[1280, 900],
	[1440, 1000],
	[1920, 1080],
];
const R_HOP_LE = { tu: 372, den: 388 };
const LE_PX = 1;
const KHE_REM = 2;

const DOT_BIEN = {
	"kara-co-gian": {
		css: '[data-o="hoi-thoai"]{flex:1 1 0%!important;width:auto!important;max-width:none!important}',
		moTa: "cot Kara flex-1 thay be ngang token",
	},
	"kara-w96": { css: '[data-o="hoi-thoai"]{width:24rem!important}', moTa: "khung cot Kara dat w-96" },
	"token-420": { css: ":root{--container-assist-rail:420px!important}", moTa: "globals.css dat --container-assist-rail 420px" },
	"khung-cuon": {
		css: '[data-slot="sheet-content"]{overflow-y:auto!important}[data-slot="sheet-content"] [data-slot="kara-dock-body"],[data-slot="sheet-content"] [data-slot="kara-dock-body"] *,[data-slot="sheet-content"] [data-o],[data-slot="sheet-content"] [data-slot="kara-artifact"],[data-slot="sheet-content"] [data-khung]{overflow:visible!important}',
		moTa: "sheet-content overflow-y-auto, than o overflow visible",
	},
};

const lech = (a, b) => Math.abs(a - b);

function loiCotKara(truoc, sau, R) {
	if (!truoc.hoi || !sau.hoi) return "khong thay cot Kara";
	if (lech(truoc.hoi.rong, sau.hoi.rong) > LE_PX || lech(truoc.hoi.phai, sau.hoi.phai) > LE_PX)
		return `cot kara doi be ngang (${so(truoc.hoi.rong)} → ${so(sau.hoi.rong)} px, mep phai ${so(truoc.hoi.phai)} → ${so(sau.hoi.phai)})`;
	if (lech(truoc.hoi.rong, R) > LE_PX || lech(sau.hoi.rong, R) > LE_PX)
		return `cot kara khong theo token (${so(sau.hoi.rong)} px, R ${so(R)})`;
	return null;
}

async function motO(rong, cao, doDo, ra) {
	const cuoc = await moCuocMoi();
	const t = await trang({ rong, cao });
	try {
		if (DOT_BIEN[doDo]) await datCss(t.p, DOT_BIEN[doDo].css, DOT_BIEN[doDo].moTa);
		if (!(await mo(t, cuoc.id))) await khongDo(`${rong}: khong mo duoc cuoc ${cuoc.id}`);
		await dungYen(t.p);
		const truoc = await hopKhung(t.p);
		await chungTrang(t.p, `${rong} truoc nop`);
		if (!(await nop1(t))) await khongDo(`${rong}: Kara khong nop ban nhap dau`);
		const coNhap = await choBanNhap(t.p);
		const sau = await hopKhung(t.p);
		const thanh = await t.p.evaluate((chon) => document.querySelectorAll(chon).length, CHON.thanh);
		const tran = await tranVaCuon(t.p);
		const lan = await lanThan(t.p, CHON.banNhap);
		const tranThan = lan ? `${lan.truoc}→${lan.sau} (than tran ${so(lan.tran)} px, cuon rieng ${lan.coCuon})` : "khong co than";
		await anh(t, `E3-${rong}`, doDo);
		const R = sau.R;
		const A = sau.A;
		const tranKhung = sau.iw - KHE_REM * sau.rem;
		const cot = loiCotKara(truoc, sau, R);
		ghi(
			`   o ${rong}x${cao}: R ${so(R)} · A ${so(A)} · truoc nop: hoi ${so(truoc.hoi?.rong)} (mep phai ${so(truoc.hoi?.phai)}), ban nhap ${truoc.nhap ? so(truoc.nhap.rong) : "khong"} · sau nop: hoi ${so(sau.hoi?.rong)} (mep phai ${so(sau.hoi?.phai)}), ban nhap ${sau.nhap ? so(sau.nhap.rong) : "khong"}, khung ${so(sau.khung?.rong)}/${so(tranKhung)} · cao khung ${so(sau.khung?.cao)}/${sau.ih} · scrollWidth ${tran.sw}/${tran.iw} · thanh keo ${thanh} · lan than ${tranThan}, khung ${lan?.khung ?? "?"}, cua so ${lan?.cuaSo ?? "?"}`,
		);
		ghi(`   o ${rong}x${cao} cot kara: ${so(sau.hoi?.rong)} / R ${so(R)} → ${cot ?? "dat"}`);
		const loi = [
			cot,
			R < R_HOP_LE.tu || R > R_HOP_LE.den ? `R ${so(R)} ngoai [${R_HOP_LE.tu}, ${R_HOP_LE.den}]` : null,
			truoc.nhap ? "truoc nop da co o ban nhap" : null,
			!coNhap || !sau.nhap ? "ban nhap khong hien sau nop (khong tai lai)" : null,
			sau.nhap && sau.nhap.rong > A + LE_PX ? `ban nhap ${so(sau.nhap.rong)} > A ${so(A)}` : null,
			sau.khung && sau.khung.rong > tranKhung + LE_PX ? `khung ${so(sau.khung.rong)} > ${so(tranKhung)}` : null,
			thanh > 0 ? `con ${thanh} thanh keo` : null,
			sau.khung && lech(sau.khung.cao, sau.ih) > LE_PX ? `khung cao ${so(sau.khung.cao)} != ${sau.ih}` : null,
			tran.sw !== tran.iw ? `tran ngang ${tran.sw}/${tran.iw}` : null,
			!lan || lan.khung > 0 || lan.cuaSo > 0 || !(lan.sau > lan.truoc) ? "khung cuon thay o" : null,
		].filter((x) => x !== null);
		ra.push({ rong, cuoc, loi });
		if (loi.length === 0) ghi(`   o ${rong}x${cao}: dat`);
		else saiThem(`   o ${rong}x${cao}: ${loi.join(" · ")}`);
	} finally {
		await t.dong();
	}
}

const THEO_DOI = `(() => {
	window.__chiKara = false;
	const xem = () => {
		const k = [...document.querySelectorAll('[data-slot="sheet-content"]')].find((x) => x.checkVisibility());
		if (k && k.querySelector('[data-o="hoi-thoai"]') && !k.querySelector('[data-o="ban-nhap"]')) window.__chiKara = true;
	};
	const bat = () => new MutationObserver(xem).observe(document.documentElement, { subtree: true, childList: true, attributes: true });
	if (document.documentElement) bat();
	else document.addEventListener("DOMContentLoaded", bat);
})()`;

async function coNhapNgay(cuocId, doDo) {
	const t = await trang(MAN.kho[1440]);
	try {
		await t.p.evaluateOnNewDocument(THEO_DOI);
		await t.p.goto(duongKhung(cuocId), { waitUntil: "networkidle2", timeout: MAN.cho.manMs });
		const luc = await t.p.evaluate(
			(khung, chon) => ({
				nhap: [...document.querySelectorAll(`:is(${khung}) ${chon}`)].some((o) => o.checkVisibility()),
				chiKara: window.__chiKara,
				dang: document.querySelector("[data-trang-soan]")?.getAttribute("data-trang-soan") ?? null,
			}),
			KHUNG,
			CHON.banNhap,
		);
		await anh(t, "E3-co-nhap-1440", doDo);
		await tre(MAN.cho.yenMs);
		await chungTrang(t.p, "co nhap");
		ghi(`   cuoc da co nhap o 1440: luc networkidle dau tien ban nhap ${luc.nhap} (trang soan ${luc.dang}) · tung qua trang thai chi Kara ${luc.chiKara}`);
		kiem("cuoc da co nhap: o ban nhap co ngay o lan dung dau", luc.nhap && !luc.chiKara);
	} finally {
		await t.dong();
	}
}

export async function phanBeNgang({ doDo }) {
	const ra = [];
	for (const [rong, cao] of KHO) await motO(rong, cao, doDo, ra);
	ghi(`   so dong o: ${ra.length}`);
	kiem(`so o ${ra.length} == ${KHO.length}`, ra.length === KHO.length);
	const cuocDang = ra.at(-1)?.cuoc;
	if (cuocDang && !DOT_BIEN[doDo]) await coNhapNgay(cuocDang.id, doDo);
}
