import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const HERE = dirname(TEP_NAY);
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "tim-va-dieu-huong-kho";

const CAY_DO = {
	nhan: "ban sao bo nhom Tai lieu khoi QuickSwitcher",
	tenCay: "tdk-man-tim-chieu-do",
	chiBuoc: "1",
	tep: "apps/app/components/crm/quick-switcher.tsx",
	cam: (s) =>
		s.replace(
			"{duChu && !taiLieu.isError && trang.length > 0 ? (",
			"{false ? (",
		),
	dauVet: "{false ? (",
	ghim: /buoc 1: khong thay nhom Tai lieu/,
};

if (process.argv.includes("--chieu-do")) {
	const { chieuDo } = await import("../../kho-tai-lieu/rang/man-lib.mjs");
	await chieuDo(TEP_NAY, CAY_DO);
}

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/man-tim.mjs"`,
	);
	process.exit(2);
}

process.env.BANG_CHUNG ??= join(GOC, ".acceptance-runs", HO_SO, "evidence");

const { cho, chay, HEP, moDo, RONG } = await import(
	"../../kho-tai-lieu/rang/man-lib.mjs"
);

const d = await moDo();

const TEN = {
	bm: "Bảo mật dữ liệu khách hàng",
	qd: "Quy định hoa hồng đối tác",
	dt: "Đào tạo nhân viên mới",
	np: "Nghỉ phép năm",
	rg: "Trang không ai nhắc tới",
};

async function moTimNhanh(t, chu) {
	await t.keyboard.down("Meta");
	await t.keyboard.press("k");
	await t.keyboard.up("Meta");
	await d.doi(t, () => window.__tim("[cmdk-input]").length > 0);
	await t.focus("[cmdk-input]");
	await t.keyboard.type(chu, { delay: 20 });
	await cho(1500);
}

const docHop = (t) =>
	t.evaluate(() => ({
		nhom: window.__tim("[cmdk-group-heading]").map((e) => e.innerText.trim()),
		trang: window.__tim("[data-tai-lieu]").map((e) => ({
			slug: e.getAttribute("data-tai-lieu"),
			chu: e.innerText,
			dam: e.querySelector("strong")?.innerText ?? "",
		})),
		canhBao: window.__tim("[role='alert']").length,
	}));

try {
	const nguoi = await d.nguoiMoi("t", "member", "Lê Thu Trang");
	const okr = await d.nguoiMoi("o", "okr", "Phạm Ngọc Anh");
	const ws = await d.batTrinhDuyet(nguoi.cookie);
	const lk = (chu, slug) => `[${chu}](/${ws}/tai-lieu/${slug})`;
	const tao = (ten, noiDung) =>
		d.taoTrangDangDung(nguoi, { ten, loai: "quy-dinh", noiDung });
	const slug = {};
	slug.bm = await tao(TEN.bm, "Không chia sẻ dữ liệu khách ra ngoài.\n");
	slug.qd = await tao(
		TEN.qd,
		`Tỉ lệ hoa hồng theo tầng. Xem ${lk("bảo mật dữ liệu", slug.bm)} trước khi gửi số.\n`,
	);
	slug.dt = await tao(
		TEN.dt,
		"Nhân viên mới học cách làm trong tuần thử việc.\n",
	);
	slug.np = await tao(
		TEN.np,
		`Làm ở nhà thì theo ${lk("quy tắc bảo mật", slug.bm)} của công ty.\n`,
	);
	slug.rg = await tao(TEN.rg, "Một mình.\n");
	console.log(`-- gieo 5 trang da duyet tren ${ws}`);

	if (chay(1))
		await d.chayBuoc(1, async () => {
			const t = await d.moTrang(nguoi.cookie, RONG, "");
			await moTimNhanh(t, "quy dinh hoa hong");
			const hop = await docHop(t);
			await d.chup(t, "tdk-cmdk-1440.png");
			if (!hop.nhom.includes("Tài liệu")) {
				d.dat(1, false, "khong thay nhom Tai lieu");
				await t.close();
				return;
			}
			const loi = [];
			const dau = hop.trang.find((r) => r.slug === slug.qd);
			if (!dau) loi.push(`nhom Tai lieu khong co ${TEN.qd}`);
			else if (dau.dam.length === 0) loi.push("doan trich khong co phan dam");
			await t.click(`[data-tai-lieu="${slug.qd}"]`);
			await d.choDuong(t, `/tai-lieu/${slug.qd}`).catch(() => null);
			const duong = await t.evaluate(() => window.location.pathname);
			if (!duong.endsWith(`/tai-lieu/${slug.qd}`))
				loi.push(`chon dong khong mo trang: ${duong}`);
			await t.close();
			d.dat(1, loi.length === 0, loi.join(" · "));
		});

	if (chay(2))
		await d.chayBuoc(2, async () => {
			const t = await d.moTrang(okr.cookie, RONG, "/tai-lieu");
			await moTimNhanh(t, "dao tao");
			const hop = await docHop(t);
			await d.chup(t, "tdk-cmdk-okr-1440.png");
			await t.close();
			const loi = [];
			if (JSON.stringify(hop.nhom) !== JSON.stringify(["Tài liệu"]))
				loi.push(`nhom hien: ${hop.nhom.join(", ") || "khong co"}`);
			if (!hop.trang.some((r) => r.slug === slug.dt))
				loi.push(`vai okr khong tim thay ${TEN.dt}`);
			if (hop.canhBao > 0) loi.push("co canh bao loi");
			d.dat(2, loi.length === 0, loi.join(" · "));
		});

	if (chay(3))
		await d.chayBuoc(3, async () => {
			const t = await d.moTrang(nguoi.cookie, HEP, "/tai-lieu");
			await moTimNhanh(t, "hoa hong");
			const hop = await docHop(t);
			const tran = await d.cuonNgang(t);
			await d.chup(t, "tdk-cmdk-390.png");
			await t.close();
			const loi = [];
			if (!hop.trang.some((r) => r.slug === slug.qd))
				loi.push("390: nhom Tai lieu khong co trang");
			if (tran.length > 0) loi.push(`390 cuon ngang: ${tran.join(", ")}`);
			d.dat(3, loi.length === 0, loi.join(" · "));
		});

	if (chay(4))
		await d.chayBuoc(4, async () => {
			const t = await d.moTrang(nguoi.cookie, RONG, `/tai-lieu/${slug.dt}/sua`);
			await d.doi(t, () => window.__tim("[role='textbox'] p").length > 0);
			const doan = await t.$("[role='textbox'] p");
			await doan.click({ clickCount: 3 });
			if (!(await t.$("[data-nut='lienKetTrang']"))) {
				d.dat(4, false, "khong thay nut Lien ket toi trang");
				await t.close();
				return;
			}
			await d.bamSel(t, "[data-nut='lienKetTrang']");
			await t.keyboard.type("bao mat", { delay: 20 });
			await d.doi(
				t,
				(s) => window.__tim(`[data-goi-y-trang="${s}"]`).length > 0,
				slug.bm,
			);
			await d.chup(t, "tdk-chen-lien-ket-1440.png");
			await t.click(`[data-goi-y-trang="${slug.bm}"]`);
			await cho(600);
			const co = await t.evaluate(
				(s) =>
					window.__tim(`[role='textbox'] a[href$='/tai-lieu/${s}']`).length,
				slug.bm,
			);
			await t.close();
			d.dat(4, co === 1, `doan chu chua thanh lien ket (${co} lien ket)`);
		});

	const docNhac = (t) =>
		t.evaluate(() => {
			const khoi = document.querySelector("[data-nhac-toi]");
			return {
				chu: khoi?.innerText ?? "",
				dong: [...(khoi?.querySelectorAll("[data-nhac-toi-dong]") ?? [])].map(
					(e) => ({
						slug: e.getAttribute("data-nhac-toi-dong"),
						dam: e.querySelector("strong")?.innerText ?? "",
					}),
				),
			};
		});

	if (chay(5))
		await d.chayBuoc(5, async () => {
			const t = await d.moTrang(nguoi.cookie, RONG, `/tai-lieu/${slug.bm}`);
			const nhac = await docNhac(t);
			await d.chup(t, "tdk-nhac-toi-1440.png");
			if (!nhac.chu.includes("Trang nhắc tới trang này")) {
				d.dat(5, false, "khong thay khoi Trang nhac toi");
				await t.close();
				return;
			}
			const loi = [];
			const mong = [slug.np, slug.qd].sort();
			const thay = nhac.dong.map((r) => r.slug).sort();
			if (JSON.stringify(thay) !== JSON.stringify(mong))
				loi.push(`dong: ${thay.join(", ")}`);
			if (!nhac.chu.includes("(2)")) loi.push("tieu de khong co (2)");
			if (nhac.dong.some((r) => r.dam.length === 0))
				loi.push("cau khong co chu lien ket dam");
			await t.click(`[data-nhac-toi-dong="${slug.qd}"]`);
			await d.choDuong(t, `/tai-lieu/${slug.qd}`).catch(() => null);
			const duong = await t.evaluate(() => window.location.pathname);
			if (!duong.endsWith(`/tai-lieu/${slug.qd}`))
				loi.push(`bam dong khong mo trang nguon: ${duong}`);
			await t.close();
			d.dat(5, loi.length === 0, loi.join(" · "));
		});

	if (chay(6))
		await d.chayBuoc(6, async () => {
			const t = await d.moTrang(nguoi.cookie, HEP, `/tai-lieu/${slug.bm}`);
			const nhac = await docNhac(t);
			const tran = await d.cuonNgang(t);
			await d.chup(t, "tdk-nhac-toi-390.png");
			await t.close();
			const loi = [];
			if (nhac.dong.length !== 2) loi.push(`390: ${nhac.dong.length} dong`);
			if (tran.length > 0) loi.push(`390 cuon ngang: ${tran.join(", ")}`);
			d.dat(6, loi.length === 0, loi.join(" · "));
		});

	if (chay(7))
		await d.chayBuoc(7, async () => {
			const t = await d.moTrang(nguoi.cookie, RONG, `/tai-lieu/${slug.rg}`);
			const nhac = await docNhac(t);
			await d.chup(t, "tdk-nhac-toi-rong.png");
			await t.close();
			d.dat(
				7,
				nhac.chu.includes("Chưa trang nào nhắc tới trang này."),
				`khoi rong khong co cau: ${nhac.chu.slice(0, 120)}`,
			);
		});

	await d.ket("man-tim");
} catch (e) {
	await d.khongDoDuoc(e);
}
