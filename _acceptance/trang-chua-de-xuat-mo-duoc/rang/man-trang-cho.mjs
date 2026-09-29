import { randomBytes, randomUUID } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const HERE = dirname(TEP_NAY);
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "trang-chua-de-xuat-mo-duoc";

const CAY_DO = {
	1: {
		nhan: "ban sao khoi phuc kiem cu: trang khong ban de xuat thi khong ai mo duoc",
		tenCay: "tcd-man-chieu-do-1",
		chiBuoc: "1",
		tep: "apps/api/src/tai-lieu/tai-lieu.service.ts",
		cam: (s) =>
			s.replace(
				"where: { AND: [{ slug }, dieuKienThay(nguoi)] },",
				"where: { AND: [{ slug }, dieuKienThay(nguoi), { OR: [{ banDangDungId: { not: null } }, { deXuat: { some: {} } }] }] },",
			),
		dauVet: "{ deXuat: { some: {} } }",
		ghim: /buoc 1: man doc 404/,
	},
	2: {
		nhan: "ban sao bo wrap-anywhere o dong nguon",
		tenCay: "tcd-man-chieu-do-2",
		chiBuoc: "2",
		tep: "apps/app/app/(app)/[slug]/tai-lieu/[trang]/man-doc.tsx",
		cam: (s) =>
			s.replace(
				'<p className="wrap-anywhere" translate="no">',
				'<p className="whitespace-nowrap" translate="no">',
			),
		dauVet: '<p className="whitespace-nowrap" translate="no">',
		ghim: /buoc 2: cuon ngang loi-390/,
	},
	3: {
		nhan: "ban sao tra lai chuyen huong cua /sua khi trang chua co ban",
		tenCay: "tcd-man-chieu-do-3",
		chiBuoc: "3",
		tep: "apps/app/app/(app)/[slug]/tai-lieu/[trang]/sua/page.tsx",
		cam: (s) =>
			s.replace(
				'if (trang.choLanDau?.dangCho === "duyet")',
				"if (trang.noiDung === null)",
			),
		dauVet: "if (trang.noiDung === null)",
		ghim: /buoc 3: khong mo trinh soan/,
	},
	4: {
		nhan: "ban sao khoa nut Gui duyet",
		tenCay: "tcd-man-chieu-do-4",
		chiBuoc: "3,4",
		tep: "apps/app/app/(app)/[slug]/tai-lieu/man-soan.tsx",
		cam: (s) =>
			s.replace(
				"const khoaGui = chuaDoi || chuaCoNoiDung;",
				"const khoaGui = true;",
			),
		dauVet: "const khoaGui = true;",
		ghim: /buoc 4: khong gui duoc/,
	},
};

const coChieuDo = process.argv.find(
	(a) => a === "--chieu-do" || a.startsWith("--chieu-do="),
);
if (coChieuDo) {
	const buoc = coChieuDo.split("=")[1] ?? "1";
	const cay = CAY_DO[buoc];
	if (!cay) {
		console.log(
			`KHONG DO DUOC: man-trang-cho khong co chieu do cho buoc ${buoc}`,
		);
		process.exit(2);
	}
	const { chieuDo } = await import("../../kho-tai-lieu/rang/man-lib.mjs");
	await chieuDo(TEP_NAY, cay);
}

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/man-trang-cho.mjs"`,
	);
	process.exit(2);
}

process.env.BANG_CHUNG ??= join(GOC, ".acceptance-runs", HO_SO, "evidence");

const { cho, chay, HEP, moDo, RONG } = await import(
	"../../kho-tai-lieu/rang/man-lib.mjs"
);
const { taiLieuMessages } = await import(
	"../../../apps/app/lib/messages/tai-lieu.ts"
);

const M = taiLieuMessages("vi").doc;
const TEP_DAI =
	"Chinh_sach_nhan_vien_2026_ban_cuoi_cung_da_ky_va_dong_dau_lan_ba.pdf";
const LY_DO_DAI =
	"Maysoanhetthoigiankhidocnguonnaysaubalanthulaivaolucmuoihaigiotruadungvuottranbuoc";
const TRANG_THAI_MAN = ["may-soan", "go-tay", "loi", "tra-lai"];
const NGUON_CUA = {
	"may-soan": "DANG_SOAN",
	"go-tay": "CAN_GO_TAY",
	loi: "LOI",
};

const d = await moDo();

async function trangChuaCoBan(ten, owner, chu, trangThaiNguon) {
	const t = await d.db.taiLieuTrang.create({
		data: {
			slug: `tcd-${randomUUID().slice(0, 8)}`,
			ten,
			loai: "chinh-sach",
			chuTrangId: chu.id,
			taoBoiId: owner.id,
		},
		select: { id: true, slug: true },
	});
	await d.db.taiLieuNguon.create({
		data: {
			sha256: randomBytes(32).toString("hex"),
			tenTep: TEP_DAI,
			kieu: "pdf",
			kichThuoc: 2048,
			blobPathname: `kho-tai-lieu/nguon/${randomUUID()}`,
			taiBoiId: owner.id,
			trangId: t.id,
			trangThai: trangThaiNguon,
			lyDo: trangThaiNguon === "LOI" ? LY_DO_DAI : null,
		},
	});
	return t.slug;
}

async function trangTraLai(ten, owner, chu) {
	const { slug } = await d.lam(owner.cookie, "taiLieu.create", {
		ten,
		loai: "quy-dinh",
		chuTrangId: chu.id,
		departmentId: null,
		noiDung: "Bản đầu thiếu số liệu.\n",
	});
	const ds = await d.hoi(chu.cookie, "taiLieu.proposals");
	const dx = ds.rows.find(
		(r) => r.slug === slug && r.trangThai === "CHO_DUYET",
	);
	if (!dx) throw new Error(`khong thay de xuat dau cua ${slug}`);
	await d.lam(chu.cookie, "taiLieu.reject", {
		id: dx.id,
		lyDo: "Thiếu số liệu năm 2026.",
	});
	return slug;
}

const khung = (t, dc) =>
	t.evaluate(
		(dc) =>
			window
				.__tim(`[data-cho-lan-dau="${dc}"]`)
				.map((e) => e.innerText)
				.join("\n"),
		dc,
	);

const la404 = (t) =>
	t.evaluate(
		() =>
			/\b404\b/.test(document.body.innerText) &&
			window.__tim("[data-man-doc]").length === 0,
	);

try {
	const owner = await d.nguoiMoi("o", "owner", "Chủ kho thử");
	const chu = await d.nguoiMoi("c", "member", "Phan Lê Mạnh");
	await d.batTrinhDuyet(owner.cookie);
	const slug = {};
	for (const tt of ["may-soan", "go-tay", "loi"])
		slug[tt] = await trangChuaCoBan(
			`Chính sách thử ${tt} ${randomUUID().slice(0, 4)}`,
			owner,
			chu,
			NGUON_CUA[tt],
		);
	slug["tra-lai"] = await trangTraLai(
		`Quy định thử trả lại ${randomUUID().slice(0, 4)}`,
		owner,
		chu,
	);
	console.log(`-- gieo 4 trang chua co ban: ${Object.values(slug).join(", ")}`);

	if (chay(1))
		await d.chayBuoc(1, async () => {
			const t = await d.moTrang(owner.cookie, RONG, "/tai-lieu");
			await d.bamSel(t, `tr[data-trang="${slug["may-soan"]}"] a`);
			await d.choDuong(t, `/tai-lieu/${slug["may-soan"]}`).catch(() => null);
			const duong = await t.evaluate(() => window.location.pathname);
			const loi = [];
			if (await la404(t)) {
				await d.chup(t, "tcd-may-soan-404.png");
				await t.close();
				d.dat(1, false, "man doc 404");
				return;
			}
			if (!duong.endsWith(`/tai-lieu/${slug["may-soan"]}`))
				loi.push(`bam dong khong mo trang: ${duong}`);
			const chu1 = await khung(t, "may-soan");
			if (!chu1.includes(M.cho["may-soan"].tieuDe))
				loi.push(`khung khong co «${M.cho["may-soan"].tieuDe}»`);
			await d.chup(t, "tcd-may-soan-1440.png");
			await t.close();
			d.dat(1, loi.length === 0, loi.join(" · "));
		});

	if (chay(2))
		await d.chayBuoc(2, async () => {
			const loi = [];
			for (const tt of TRANG_THAI_MAN) {
				for (const [kho, ten] of [
					[RONG, "1440"],
					[HEP, "390"],
				]) {
					const t = await d.moTrang(owner.cookie, kho, `/tai-lieu/${slug[tt]}`);
					const chu2 = await khung(t, tt);
					if (!chu2.includes(M.cho[tt].tieuDe))
						loi.push(`${tt}-${ten}: khong co khung`);
					if (kho === HEP) {
						const tran = await d.cuonNgang(t);
						if (tran.length > 0) loi.push(`cuon ngang ${tt}-390`);
						else console.log(`buoc 2: dat ${tt}`);
					}
					await d.chup(t, `tcd-${tt}-${ten}.png`);
					await t.close();
				}
			}
			if (loi.length > 0) d.dat(2, false, loi.join(" · "));
		});

	if (chay(3) || chay(4))
		await d.chayBuoc(3, async () => {
			const t = await d.moTrang(
				owner.cookie,
				RONG,
				`/tai-lieu/${slug["go-tay"]}`,
			);
			await d.bamChu(t, "a", M.vietTay);
			await d.choDuong(t, `/tai-lieu/${slug["go-tay"]}/sua`).catch(() => null);
			const trinhSoan = await t.evaluate(() => {
				const o = window.__tim("[role='textbox']")[0];
				return o
					? { co: true, chu: o.innerText.trim() }
					: { co: false, chu: "" };
			});
			await d.chup(t, "tcd-viet-tay-1440.png");
			if (!trinhSoan.co || trinhSoan.chu !== "") {
				await t.close();
				d.dat(3, false, "khong mo trinh soan");
				return;
			}
			d.dat(3, true, "");
			if (!chay(4)) {
				await t.close();
				return;
			}
			const moc = `tcd-moc-${randomUUID().slice(0, 8)}`;
			await t.click("[role='textbox']");
			await t.keyboard.type(`Nội dung viết tay ${moc}.`, { delay: 10 });
			await cho(400);
			const khoa = await t.evaluate(
				() => document.querySelector("[data-gui-duyet]")?.disabled ?? true,
			);
			if (khoa) {
				await t.close();
				d.dat(4, false, "khong gui duoc");
				return;
			}
			await t.click("[data-gui-duyet]");
			await d.choDuong(t, `/tai-lieu/${slug["go-tay"]}`).catch(() => null);
			const chu4 = await khung(t, "duyet");
			const soBan = await d.db.taiLieuDeXuat.count({
				where: {
					trang: { slug: slug["go-tay"] },
					banGocId: null,
					noiDung: { contains: moc },
				},
			});
			await d.chup(t, "tcd-gui-ban-dau-1440.png");
			await t.close();
			const loi = [];
			if (!chu4.includes(M.cho.duyet.tieuDe))
				loi.push("man doc chua bao cho duyet");
			if (soBan !== 1) loi.push(`co ${soBan} ban de xuat mang moc, mong 1`);
			d.dat(4, loi.length === 0, loi.join(" · "));
		});

	await d.ket("man-trang-cho");
} catch (e) {
	await d.khongDoDuoc(e);
}
