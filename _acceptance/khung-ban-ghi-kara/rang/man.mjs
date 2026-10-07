import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "khung-ban-ghi-kara";
const CHIEU_DO = process.argv.includes("--chieu-do");

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/man.mjs"`,
	);
	process.exit(2);
}

process.env.BANG_CHUNG ??= join(GOC, ".acceptance-runs", HO_SO, "evidence");
const NOI_GIU = join(GOC, "_acceptance", HO_SO, "evidence");

const { chay, HEP, MA, moDo, RONG } = await import(
	"../../kho-tai-lieu/rang/man-lib.mjs"
);

const CU = "Trưởng phòng";
const MOI = "Giám đốc kinh doanh";
const d = await moDo();

const docMan = (t) =>
	t.evaluate(() => {
		const tran = [];
		const goc = document.documentElement;
		if (goc.scrollWidth > goc.clientWidth + 1)
			tran.push(`trang ${goc.scrollWidth}>${goc.clientWidth}`);
		const ngan = document.querySelector(
			"[data-slot='sheet-content'],[data-slot='drawer-content']",
		);
		if (ngan && ngan.scrollWidth > ngan.clientWidth + 1)
			tran.push(`ngan ${ngan.scrollWidth}>${ngan.clientWidth}`);
		return {
			chu: document.body.innerText ?? "",
			nhanKara: window.__tim('[data-slot="kara-label"]').length,
			tran,
		};
	});

async function gieo() {
	const cty = await d.db.company.create({
		data: { name: `Thép Hòa Phát ${MA}`, domain: `hoaphat-${MA}.test` },
		select: { id: true },
	});
	const nguoi = await d.db.contact.create({
		data: {
			firstName: "Hà",
			lastName: `Nguyễn ${MA}`,
			title: CU,
			companyId: cty.id,
		},
		select: { id: true },
	});
	await d.db.contactFact.create({
		data: {
			contactId: nguoi.id,
			field: "title",
			value: MOI,
			score: 0.9,
			band: "VERIFIED",
			evidence: [{ kind: "profile", detail: "Hồ sơ LinkedIn cập nhật 18/09" }],
			method: "thu",
			status: "PROPOSED",
		},
	});
	return { congTy: cty.id, nguoi: nguoi.id };
}

async function bamNut(t, chu) {
	const ok = await t.evaluate((c) => {
		const nut = window
			.__tim("button")
			.find((b) => (b.innerText ?? "").trim() === c);
		nut?.click();
		return Boolean(nut);
	}, chu);
	if (!ok) throw new Error(`khong thay nut ${chu}`);
	await new Promise((r) => setTimeout(r, 1500));
}

try {
	const chu = await d.nguoiMoi("kbk", "owner", "Phan Kiểm Thử");
	await d.batTrinhDuyet(chu.cookie);
	const { congTy, nguoi } = await gieo();
	const thoaThuan = await d.lam(chu.cookie, "deals.create", {
		name: `Hợp đồng thép ${MA}`,
		companyId: congTy,
		ownerId: chu.id,
		amountCents: null,
		expectedCloseDate: null,
	});
	const ngan = (loai, id, tab) =>
		`/contacts?record=${loai}:${id}${tab ? `&tab=${tab}` : ""}`;

	if (chay(1))
		await d.chayBuoc(1, async () => {
			const t = await d.moTrang(
				chu.cookie,
				RONG,
				ngan("contact", nguoi, "agent"),
			);
			const m = await docMan(t);
			await d.chup(t, "kbk-kara-ca-nhan-1440.png");
			await t.close();
			const loi = [];
			if (!m.chu.includes("Kara")) loi.push("khong thay chu Kara");
			if (!m.chu.includes("Người này là ai?"))
				loi.push("khong thay goi y tieng Viet");
			if (m.chu.includes("Ask about")) loi.push("con chu tieng Anh");
			d.dat(1, loi.length === 0, loi.join(" · "));
		});

	if (chay(2))
		await d.chayBuoc(2, async () => {
			const loi = [];
			for (const [loai, id, ten, cau] of [
				["company", congTy, "kbk-kara-cong-ty-1440.png", "Công ty này làm gì?"],
				[
					"deal",
					thoaThuan.id,
					"kbk-kara-thoa-thuan-1440.png",
					"Thoả thuận đang ở đâu?",
				],
			]) {
				const t = await d.moTrang(chu.cookie, RONG, ngan(loai, id, "agent"));
				const m = await docMan(t);
				await d.chup(t, ten);
				await t.close();
				if (!m.chu.includes(cau)) loi.push(`${loai}: khong thay goi y`);
			}
			const t = await d.moTrang(
				chu.cookie,
				RONG,
				ngan("contact", nguoi, "agent"),
			);
			await bamNut(t, "Người này là ai?");
			await new Promise((r) => setTimeout(r, 6000));
			const m = await docMan(t);
			await d.chup(t, "kbk-kara-trang-thai-1440.png");
			await t.close();
			const trangThai = m.chu.includes("Kara chưa trả lời được")
				? "chua-tra-loi"
				: m.chu.includes("Kara chưa được bật")
					? "chua-bat"
					: null;
			console.log(`  trang thai Kara: ${trangThai ?? "khong thay"}`);
			if (trangThai === null) loi.push("khong thay trang thai Kara");
			for (const cam of ["bun run dev", "AGENT_URL", "not reachable"]) {
				if (m.chu.includes(cam)) loi.push(`lo chuoi cam ${cam}`);
			}
			d.dat(2, loi.length === 0, loi.join(" · "));
		});

	if (chay(3))
		await d.chayBuoc(3, async () => {
			const loi = [];
			const t = await d.moTrang(chu.cookie, RONG, ngan("contact", nguoi));
			const truoc = await docMan(t);
			if (truoc.nhanKara !== 1) loi.push(`nhan Kara ${truoc.nhanKara} lan`);
			if (!truoc.chu.includes("Kara · 1 đề xuất"))
				loi.push("khong thay Kara · 1 đề xuất");
			await d.chup(t, "kbk-de-xuat-1440.png");
			await bamNut(t, "Thay giá trị hiện có");
			const sauNhan = await d.hoi(chu.cookie, "contacts.byId", { id: nguoi });
			if (sauNhan.title !== MOI) loi.push(`sau nhan title=${sauNhan.title}`);
			await d.chup(t, "kbk-bien-nhan-1440.png");
			await bamNut(t, "Hoàn tác");
			if (CHIEU_DO) await bamNut(t, "Hoàn tác");
			const sauHoan = await d.hoi(chu.cookie, "contacts.byId", { id: nguoi });
			if (sauHoan.title !== CU) loi.push(`sau hoan tac title=${sauHoan.title}`);
			const m = await docMan(t);
			if (!m.chu.includes("Thay giá trị hiện có"))
				loi.push("de xuat khong hien lai");
			await d.chup(t, "kbk-hoan-tac-1440.png");
			await t.close();
			d.dat(3, loi.length === 0, loi.join(" · "));
		});

	if (chay(4))
		await d.chayBuoc(4, async () => {
			const loi = [];
			const t1 = await d.moTrang(
				chu.cookie,
				HEP,
				ngan("contact", nguoi, "agent"),
			);
			const m1 = await docMan(t1);
			await d.chup(t1, "kbk-kara-ca-nhan-390.png");
			await t1.close();
			const t2 = await d.moTrang(chu.cookie, HEP, ngan("contact", nguoi));
			const m2 = await docMan(t2);
			await d.chup(t2, "kbk-de-xuat-390.png");
			await t2.close();
			if (m1.tran.length > 0) loi.push(`tab Kara tran: ${m1.tran.join(", ")}`);
			if (m2.tran.length > 0) loi.push(`de xuat tran: ${m2.tran.join(", ")}`);
			if (!m2.chu.includes("Thay giá trị hiện có"))
				loi.push("390 khong thay de xuat");
			d.dat(4, loi.length === 0, loi.join(" · "));
		});

	mkdirSync(NOI_GIU, { recursive: true });
	for (const ten of [
		"kbk-kara-ca-nhan-1440.png",
		"kbk-kara-cong-ty-1440.png",
		"kbk-kara-thoa-thuan-1440.png",
		"kbk-kara-trang-thai-1440.png",
		"kbk-de-xuat-1440.png",
		"kbk-bien-nhan-1440.png",
		"kbk-hoan-tac-1440.png",
		"kbk-kara-ca-nhan-390.png",
		"kbk-de-xuat-390.png",
	]) {
		const nguon = join(process.env.BANG_CHUNG, ten);
		if (existsSync(nguon)) copyFileSync(nguon, join(NOI_GIU, ten));
	}

	await d.ket("khung-ban-ghi-kara man");
} catch (e) {
	await d.khongDoDuoc(e);
}
