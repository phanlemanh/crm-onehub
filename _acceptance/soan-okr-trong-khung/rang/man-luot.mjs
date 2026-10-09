import { tre } from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import { CHAM_MS, DEM, LENH, TEN } from "./kich-ban.mjs";
import { choBanNhap } from "./do-khung.mjs";
import {
	anh,
	bamNutChu,
	CHON,
	choThay,
	choYen,
	chungTrang,
	docCuoc,
	dongBangNut,
	dungYen,
	ghi,
	guiTin,
	KHUNG,
	KY,
	khongDo,
	kiem,
	m,
	MAN,
	mo,
	moCuocMoi,
	moTrang,
	PHONG,
	saiThem,
	sql,
	trang,
} from "./man-chung.mjs";

const GIAY_MS = 1000;
const CHO_SAU_DONG_MS = 12 * GIAY_MS;
const CHONG_MS = 2 * GIAY_MS;
const QUAY_LAI = "Quay lại";
const MOC_LOI = '[data-moc="loi"],[data-luot="loi"],[data-nop-khong-thanh]';

const inSo = (nhan, truoc, sau) =>
	ghi(`   ${nhan}: CSDL truoc soLuot ${truoc.soLuot} · so lan nop ${truoc.nop} — sau soLuot ${sau.soLuot} · so lan nop ${sau.nop}`);

const dangSoan = (p) =>
	p.evaluate((khung, chon) => [...document.querySelectorAll(`:is(${khung}) ${chon}`)].length > 0, KHUNG, CHON.dangLam);

async function choDangSoan(p) {
	return choThay(p, (khung, chon) => document.querySelectorAll(`:is(${khung}) ${chon}`).length > 0, "Kara dang soan", MAN.cho.manMs, KHUNG, CHON.dangLam);
}

async function choKhungSoan(p) {
	const thay = await choThay(
		p,
		(khung) => [...document.querySelectorAll(`:is(${khung}) [data-trang-soan]`)].some((o) => o.checkVisibility() && o.getAttribute("data-trang-soan") !== "dang-mo"),
		"khung soan",
		MAN.cho.manMs,
		KHUNG,
	);
	await dungYen(p);
	return thay;
}

const docNhap = (p) =>
	p.evaluate(
		(khung, chon, loi) => {
			const k = [...document.querySelectorAll(khung)].find((x) => x.checkVisibility());
			const o = k?.querySelector(chon);
			return {
				mucTieu: o ? [...o.querySelectorAll('[data-loai-dong="muc-tieu"]')].map((d) => d.innerText.split("\n")[0]) : [],
				chu: o?.innerText ?? "",
				loi: k ? k.querySelectorAll(loi).length : -1,
			};
		},
		KHUNG,
		CHON.banNhap,
		MOC_LOI,
	);

async function huyPhiaMayChu(p, phien, cuocId) {
	const kq = await p.evaluate(
		async (phien, cuocId) => {
			const res = await fetch(`/eve/agents/okr/eve/v1/session/${encodeURIComponent(phien)}/cancel`, {
				method: "POST",
				headers: { "x-crm-cuoc-soan": cuocId, "content-type": "application/json" },
				body: "{}",
			});
			return `${res.status} ${(await res.text()).slice(0, 120)}`;
		},
		phien,
		cuocId,
	);
	ghi(`   (chieu do dung-khi-dong: khung thao goi huy luot phia may chu → ${kq})`);
}

async function caDong(t, cuocId, doDo) {
	const truoc = await docCuoc(cuocId);
	if (!(await guiTin(t, LENH.chamNop1, { choXong: false }))) await khongDo("dong: luot 2 khong toi mo hinh");
	if (!(await choDangSoan(t.p))) await khongDo("dong: khong thay Kara dang soan");
	await dongBangNut(t.p);
	const hop = await choThay(t.p, (hoi) => [...document.querySelectorAll(hoi)].some((h) => h.checkVisibility()), "hop hoi", 10000, CHON.hopHoi);
	const bam = await bamNutChu(t.p, `${CHON.hopHoi} button`, m.trang.hoiDong.nut);
	const dong = await choThay(t.p, (khung) => !new URLSearchParams(location.search).has("record") && ![...document.querySelectorAll(khung)].some((k) => k.checkVisibility()), "khung dong", 10000, KHUNG);
	ghi(`   dong: hop hoi ${hop} · bam «${m.trang.hoiDong.nut}» ${bam} · khung dong ${dong}`);
	if (doDo === "dung-khi-dong") await huyPhiaMayChu(t.p, t.phien.at(-1) ?? (await docCuoc(cuocId)).phien, cuocId);
	await tre(CHO_SAU_DONG_MS);
	const sau = await docCuoc(cuocId);
	inSo("dong", truoc, sau);
	await choThay(t.p, () => [...document.querySelectorAll('[data-nut-soan="nut-tiep"] button')].some((b) => b.checkVisibility()), "nut Tiep tuc", MAN.cho.manMs);
	await t.p.evaluate(() => {
		window.__chuaTaiLai = true;
	});
	await t.p.evaluate(() => [...document.querySelectorAll('[data-nut-soan="nut-tiep"] button')].find((b) => b.checkVisibility())?.click());
	await choKhungSoan(t.p);
	await choBanNhap(t.p, MAN.cho.manMs);
	const nhap = await docNhap(t.p);
	const khongTaiLai = await t.p.evaluate(() => window.__chuaTaiLai === true);
	await chungTrang(t.p, "dong: mo lai");
	await anh(t, "E8-dong-mo-lai", doDo);
	ghi(`   dong: mo lai (khong tai lai trang: ${khongTaiLai}) → ban nhap ${nhap.mucTieu.length} Muc tieu ${JSON.stringify(nhap.mucTieu)} · moc loi ${nhap.loi}`);
	const loi =
		!hop || !bam || !dong
			? "dong: khong dong duoc khung qua hop hoi"
			: sau.nop !== truoc.nop + 1
				? "dong: so lan nop khong tang"
				: !khongTaiLai
					? "dong: mo lai phai tai lai trang"
				: sau.soLuot !== truoc.soLuot + 1
					? `dong: soLuot tang ${sau.soLuot - truoc.soLuot}, can 1`
					: nhap.mucTieu.length !== DEM.nop1.mucTieu
						? `dong: mo lai ban nhap co ${nhap.mucTieu.length} Muc tieu, can ${DEM.nop1.mucTieu}`
						: nhap.loi !== 0
							? `dong: mo lai co ${nhap.loi} moc loi`
							: null;
	if (loi) saiThem(loi);
	else ghi("dong: dat");
	return loi === null;
}

async function idMucTieu() {
	const [r] = await sql(
		`SELECT id FROM "okrObjective" WHERE "cycleId" = $1 AND "departmentId" = $2 AND status <> 'da-bo' ORDER BY "createdAt" LIMIT 1`,
		[KY, PHONG],
	);
	if (r) return r.id;
	const [k] = await sql(`SELECT id FROM "okrObjective" WHERE "departmentId" = $1 AND status <> 'da-bo' ORDER BY "createdAt" LIMIT 1`, [PHONG]);
	if (k) return k.id;
	const [b] = await sql(`SELECT id FROM "okrObjective" WHERE status <> 'da-bo' ORDER BY "createdAt" LIMIT 1`);
	return b?.id ?? null;
}

async function caChong(t, cuocId) {
	const truoc = await docCuoc(cuocId);
	const oid = await idMucTieu();
	if (!oid) await khongDo("chong: khong co Muc tieu nao trong CSDL de mo chong");
	ghi("   chong: mo lai khung soan bang tai trang (goto URL co record=soan) — nuqs khong nhan record doi tu ngoai sau khi chinh no da ghi (loi san co, ngoai AC-8)");
	if (!(await moTrang(t, cuocId)) || !(await choYen(t.p))) await khongDo("chong: khong mo lai duoc khung soan bang tai trang");
	if (!(await guiTin(t, LENH.chamNop2, { choXong: false }))) await khongDo("chong: luot 3 khong toi mo hinh");
	if (!(await choDangSoan(t.p))) await khongDo("chong: khong thay Kara dang soan");
	const coRouter = await t.p.evaluate((oid) => {
		const r = window.next?.router;
		if (!r) return false;
		const q = new URLSearchParams(location.search);
		q.set("record", `${q.get("record")},objective:${oid}`);
		r.replace(`${location.pathname}?${q.toString()}`);
		return true;
	}, oid);
	if (!coRouter) await khongDo("chong: khong co window.next.router de URL replace");
	const moMt = await choThay(
		t.p,
		(khung) => [...document.querySelectorAll(khung)].some((k) => k.checkVisibility() && k.getAttribute("data-size") !== "kara" && !k.querySelector("[data-trang-soan]")),
		"khung Muc tieu",
		MAN.cho.manMs,
		KHUNG,
	);
	await dungYen(t.p);
	await chungTrang(t.p, "chong: Muc tieu");
	await tre(CHONG_MS);
	const quay = await t.p.evaluate(
		(khung, chu) => {
			const k = [...document.querySelectorAll(khung)].find((x) => x.checkVisibility());
			const b = k && [...k.querySelectorAll("button")].find((x) => x.textContent?.trim() === chu);
			b?.click();
			return !!b;
		},
		KHUNG,
		QUAY_LAI,
	);
	await choKhungSoan(t.p);
	const thayDangSoan = await dangSoan(t.p);
	await chungTrang(t.p, "chong: quay lai khung soan");
	await anh(t, "E8-chong-quay-lai", t.doDo);
	await choYen(t.p);
	const moi = await choThay(t.p, (khung, chon, ten) => [...document.querySelectorAll(`:is(${khung}) ${chon}`)].some((o) => o.innerText.includes(ten)), "ban nhap moi", MAN.cho.luotMs, KHUNG, CHON.banNhap, TEN.m1Sua);
	const sau = await docCuoc(cuocId);
	inSo("chong", truoc, sau);
	ghi(`   chong: khung Muc tieu ${oid} hien ${moMt} · nut «${QUAY_LAI}» ${quay} · quay lai thay Kara dang soan ${thayDangSoan} · ban nhap moi «${TEN.m1Sua}» ${moi}`);
	const loi =
		!moMt || !quay
			? "chong: khong mo hay khong dong duoc khung Muc tieu chong len"
			: !thayDangSoan
				? "chong: quay lai khong hien Kara dang soan"
				: !moi
					? "chong: khong co ban nhap moi khi luot xong"
					: sau.soLuot !== truoc.soLuot + 1
						? `chong: soLuot tang ${sau.soLuot - truoc.soLuot}, can 1`
						: sau.nop !== truoc.nop + 1
							? "chong: so lan nop khong tang"
							: null;
	if (loi) saiThem(loi);
	else ghi("chong: dat");
	const conChong = await t.p.evaluate((id) => new URLSearchParams(location.search).get("record") !== `soan:${id}`, cuocId);
	if (conChong) {
		ghi("   (chong: dua url ve record=soan truoc ca tai lai)");
		await moTrang(t, cuocId);
		await choYen(t.p);
	}
}

async function caTaiLai(t, cuocId) {
	const truoc = await docCuoc(cuocId);
	if (!(await guiTin(t, LENH.chamNop1, { choXong: false }))) await khongDo("tai lai: luot 4 khong toi mo hinh");
	if (!(await choDangSoan(t.p))) await khongDo("tai lai: khong thay Kara dang soan");
	const hopTruoc = t.hop.length;
	await t.p.reload({ waitUntil: "load" });
	const hopDang = t.hop.slice(hopTruoc);
	await choKhungSoan(t.p);
	const thayDangSoan = await dangSoan(t.p);
	await chungTrang(t.p, "tai lai: khung mo lai tu URL");
	await anh(t, "E8-tai-lai", t.doDo);
	await choYen(t.p);
	const moi = await choThay(t.p, (khung, chon, ten) => [...document.querySelectorAll(`:is(${khung}) ${chon}`)].some((o) => o.innerText.includes(ten)), "ban nhap moi", MAN.cho.luotMs, KHUNG, CHON.banNhap, TEN.m1);
	const sau = await docCuoc(cuocId);
	inSo("tai lai", truoc, sau);
	const hopRanh = t.hop.length;
	await t.p.reload({ waitUntil: "load" });
	await choKhungSoan(t.p);
	const hopKhiRanh = t.hop.slice(hopRanh);
	ghi(`   tai lai: hop trinh duyet khi dang soan ${JSON.stringify(hopDang)} · sau tai lai thay Kara dang soan ${thayDangSoan} · ban nhap moi «${TEN.m1}» ${moi} · hop khi Kara ranh ${JSON.stringify(hopKhiRanh)}`);
	const loi =
		hopDang.length !== 1 || hopDang[0] !== "beforeunload"
			? "tai lai: khong co dung mot hop beforeunload khi dang soan"
			: !thayDangSoan
				? "tai lai: khung mo lai khong hien Kara dang soan"
				: !moi
					? "tai lai: khong co ban nhap moi khi luot xong"
					: sau.soLuot !== truoc.soLuot + 1
						? `tai lai: soLuot tang ${sau.soLuot - truoc.soLuot}, can 1`
						: hopKhiRanh.length > 0
							? "tai lai: Kara ranh ma tai lai van hoi"
							: null;
	if (loi) saiThem(loi);
	else ghi("tai lai: dat");
}

export async function phanLuot({ doDo }) {
	ghi(`   mo hinh gia: luot cham ${CHAM_MS} ms roi nop`);
	const cuoc = await moCuocMoi();
	const t = { ...(await trang(MAN.kho[1440])), doDo, phien: [] };
	t.p.on("request", (r) => {
		const k = /\/eve\/v1\/session\/([^/?]+)/.exec(r.url());
		if (k && !t.phien.includes(k[1])) t.phien.push(decodeURIComponent(k[1]));
	});
	try {
		if (!(await mo(t, cuoc.id))) await khongDo("khong mo duoc cuoc");
		const dongDat = await caDong(t, cuoc.id, doDo);
		if (doDo) return;
		if (!dongDat) kiem("ca dong dat truoc khi do tiep", false);
		await caChong(t, cuoc.id);
		await caTaiLai(t, cuoc.id);
	} finally {
		await t.dong();
	}
}
