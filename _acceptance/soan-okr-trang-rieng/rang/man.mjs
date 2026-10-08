import { tre } from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import { DEM, LENH, TEN } from "./kich-ban.mjs";
import {
	bamTrongDong,
	buoc,
	CHON,
	chuanBi,
	choBienNhan,
	choSoDong,
	choThay,
	choYen,
	duongDonVi,
	duongSoan,
	ghi,
	guiTin,
	ket,
	khongDo,
	kiem,
	m,
	MAN,
	mo,
	moCuoc,
	moPhien,
	moTrang,
	mui,
	the,
	tranVaCuon,
	trang,
	vao,
} from "./man-chung.mjs";
import { phanDuong, phanKhung, phanMoc } from "./man-duong.mjs";
import { phanMaTran } from "./man-ma-tran.mjs";
import { phanDuaVao, phanSo } from "./man-so.mjs";

const PHAN = ["duong", "khung", "moc", "hoi-dong", "he-thong", "so", "dua-vao", "ma-tran"];
const arg = (ten) => {
	const i = process.argv.indexOf(ten);
	return i < 0 ? null : (process.argv[i + 1] ?? null);
};
const phan = arg("--phan");
const doDo = arg("--kiem-do-do");
if (!PHAN.includes(phan ?? "")) {
	console.log(`KHONG DO DUOC: --phan phai la mot trong ${PHAN.join(", ")}`);
	process.exit(2);
}
const lenh = `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/soan-okr-trang-rieng/rang/man.mjs --phan ${phan}${doDo ? ` --kiem-do-do ${doDo}` : ""}"`;

async function nop1(t) {
	if (!(await guiTin(t, LENH.nop1))) return false;
	return choSoDong(t.p, DEM.nop1.mucTieu + DEM.nop1.kr);
}

function catKhoi(than, cat) {
	return than.replace(/⟦ngữ cảnh từ trang soạn⟧[\s\S]*?⟦hết ngữ cảnh⟧(\\n|\n)?/g, cat ? "" : "$&");
}

async function chanKhoi(t, kieu) {
	await t.p.setRequestInterception(true);
	t.p.on("request", (r) => {
		const than = r.postData();
		if (r.method() !== "POST" || !than || !than.includes("⟦")) return r.continue();
		ghi(`   (chieu do ${kieu}: bo khoi ngu canh khoi tin gui)`);
		return r.continue({ postData: catKhoi(than, true) });
	});
}

async function phanHoiDong() {
	const cuoc = await moCuoc();
	const t = await trang({ rong: 1440, cao: 900 });
	try {
		if (!(await mo(t, cuoc.id)) || !(await nop1(t))) await khongDo("khong dung duoc ban nhap dau");
		if (doDo === "bo-khoi") await chanKhoi(t, "bo-khoi");
		const hoi = await bamTrongDong(t.p, TEN.k22, m.dong.hoiKara);
		const chip = await t.p.evaluate((chon, o) => ({
			chu: document.querySelector(chon)?.textContent?.trim() ?? "",
			go: !!document.querySelector(chon)?.querySelector("button"),
			focus: document.activeElement === document.querySelector(o),
		}), CHON.chip, CHON.oSoan);
		ghi(`   chip «${chip.chu}» · nut go ${chip.go} · focus o soan ${chip.focus}`);
		buoc(1, !hoi ? "khong co nut Hoi Kara tren dong" : chip.chu !== m.dong.nguCanh(m.heThong.loai.kr, TEN.k22) || !chip.go ? "chip sai chu hay thieu nut go" : !chip.focus ? "focus khong o o soan" : null);
		await guiTin(t, "ngắn hơn");
		const tin = vao().at(-1) ?? "";
		ghi(`   mo hinh nhan: ${tin.replace(/\n/g, " ⏎ ").slice(0, 400)}`);
		buoc(2, !tin.includes(TEN.k22) ? "mo hinh khong thay dong" : !tin.includes("ngắn hơn") ? "mo hinh khong thay cau hoi" : null);
		const bong = await t.p.evaluate((chon) => {
			const ds = document.querySelectorAll(chon);
			const o = ds[ds.length - 1];
			return { chu: o?.textContent ?? "", chip: o?.querySelector("[data-chip-dong]")?.textContent?.trim() ?? "" };
		}, CHON.nguoi);
		ghi(`   bong bong: «${bong.chu}»`);
		buoc(3, bong.chip !== m.dong.nguCanh(m.heThong.loai.kr, TEN.k22) || !bong.chu.includes("ngắn hơn") ? "bong bong thieu chip hay cau hoi" : bong.chu.includes("⟦") ? "bong bong lo dau khoi may" : null);
		await bamTrongDong(t.p, TEN.k22, m.dong.hoiKara);
		await t.p.evaluate((chon) => document.querySelector(chon)?.querySelector("button")?.click(), CHON.chip);
		await tre(MAN.cho.yenMs);
		await guiTin(t, "câu hỏi khác");
		const tin2 = vao().at(-1) ?? "";
		ghi(`   mo hinh nhan (go chip): ${tin2.replace(/\n/g, " ⏎ ").slice(0, 200)}`);
		buoc(4, tin2.includes(TEN.k22) ? "go chip ma tin van mang chu dong" : null);
		await t.p.setViewport({ width: 375, height: MAN.kho[375].cao });
		await moTrang(t, cuoc.id, "?tabSoan=ban-nhap");
		await choThay(t.p, () => [...document.querySelectorAll("[data-dong]")].some((o) => o.checkVisibility()), "tab ban nhap", 15000);
		await bamTrongDong(t.p, TEN.k22, m.dong.hoiKara);
		const hep = await choThay(
			t.p,
			(o) => document.querySelectorAll('[data-khung="hep"] [role="tab"]')[0]?.getAttribute("aria-selected") === "true" && document.activeElement === document.querySelector(o),
			"hep mo tab tro chuyen",
			10000,
			CHON.oSoan,
		);
		buoc(5, hep ? null : "kho hep: bam Hoi Kara khong mo tab Tro chuyen hay khong dat focus");
		if (doDo !== "bo-khoi") kiem(`console khong loi (${t.loi.length})`, t.loi.length === 0);
	} finally {
		await t.dong();
	}
}

async function phanHeThong() {
	const cuoc = await moCuoc();
	const t = await trang({ rong: 1440, cao: 900 });
	try {
		if (!(await mo(t, cuoc.id)) || !(await nop1(t))) await khongDo("khong dung duoc ban nhap dau");
		if (doDo === "bo-quyet") await chanKhoi(t, "bo-quyet");
		const nhanKr = await bamTrongDong(t.p, TEN.k12, m.dong.themKr);
		await choBienNhan(t.p, TEN.k12);
		const boMt = await bamTrongDong(t.p, TEN.m2, m.dong.boQua);
		await choBienNhan(t.p, TEN.m2);
		const nhan13 = await bamTrongDong(t.p, TEN.k13, m.dong.themKr);
		await choBienNhan(t.p, TEN.k13);
		const hoan13 = await bamTrongDong(t.p, TEN.k13, mui.proposedChange.undo);
		await choThay(t.p, (ten) => [...document.querySelectorAll("[data-the-cho]")].some((d) => d.textContent?.includes(ten)), "k13 ve cho", 15000, TEN.k13);
		buoc(1, nhanKr && boMt && nhan13 && hoan13 ? null : "khong quyet duoc tren bang");
		const dongHt = await t.p.evaluate((chon) => {
			const ds = document.querySelectorAll(chon);
			return ds[ds.length - 1]?.textContent?.trim() ?? "";
		}, CHON.heThong);
		ghi(`   dong he thong: «${dongHt}»`);
		const quyet = [
			m.heThong.cach.nhan(m.heThong.loai.kr, TEN.k12),
			m.heThong.cach.bac(m.heThong.loai["muc-tieu"], TEN.m2),
		].join(" · ");
		buoc(2, dongHt !== m.heThong.seGui(quyet) ? `dong he thong sai, can «${m.heThong.seGui(quyet)}»` : dongHt.includes(TEN.k13) ? "dong he thong nhac KR da hoan tac" : null);
		await guiTin(t, LENH.tiep);
		const tin = vao().at(-1) ?? "";
		ghi(`   mo hinh nhan: ${tin.replace(/\n/g, " ⏎ ").slice(0, 400)}`);
		buoc(3, !tin.includes(TEN.k12) || !tin.includes(TEN.m2) ? "mo hinh khong thay quyet" : tin.includes(TEN.k13) ? "mo hinh thay quyet da hoan tac" : null);
		await t.p.reload({ waitUntil: "load" });
		await choYen(t.p);
		const sau = await t.p.evaluate((chon) => {
			const ds = document.querySelectorAll(chon);
			const o = ds[ds.length - 1];
			const truoc = o?.previousElementSibling;
			return { truoc: truoc?.matches('[data-kara-turn="system"]') ? truoc.textContent?.trim() : null, chu: o?.textContent ?? "" };
		}, CHON.nguoi);
		ghi(`   sau tai lai: he thong «${sau.truoc}» · bong bong «${sau.chu}»`);
		buoc(4, sau.truoc !== quyet ? "dong he thong khong dung ngay truoc bong bong" : sau.chu.includes("⟦") ? "bong bong lo dau khoi may" : null);
		if (doDo !== "bo-quyet") kiem(`console khong loi (${t.loi.length})`, t.loi.length === 0);
	} finally {
		await t.dong();
	}
}

await moPhien(lenh);
try {
	await chuanBi(phan);
	ghi(`PHAN ${phan}${doDo ? ` · chieu do ${doDo}` : ""}`);
	const lam = {
		duong: () => phanDuong({ doDo }),
		khung: () => phanKhung({ doDo, nop1 }),
		moc: () => phanMoc({ doDo, nop1 }),
		"hoi-dong": phanHoiDong,
		"he-thong": phanHeThong,
		so: () => phanSo({ doDo, nop1 }),
		"dua-vao": () => phanDuaVao({ doDo, nop1 }),
		"ma-tran": () => phanMaTran({ doDo, nop1 }),
	}[phan];
	await lam();
} catch (loi) {
	await khongDo(`phan ${phan}: ${loi?.stack ?? loi}`);
}
await ket();
