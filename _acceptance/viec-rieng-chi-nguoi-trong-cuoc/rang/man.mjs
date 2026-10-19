import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP_NAY), "..", "..", "..");
const HO_SO = "viec-rieng-chi-nguoi-trong-cuoc";
const KHO_RONG = 1280;
const KHO_HEP = 375;
const CHO_MS = 20_000;

process.env.BANG_CHUNG ??= join(GOC, ".acceptance-runs", HO_SO, "evidence");
const lib = await import("../../kho-tai-lieu/rang/man-lib.mjs");

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/man.mjs"`,
	);
	process.exit(2);
}

const { viecMessages } = await import(
	join(GOC, "apps/app/lib/messages/viec.ts")
);
const M = viecMessages("vi");
const RIENG = "Việc riêng";
const d = await lib.moDo();

async function choThay(t, ham, arg, moTa) {
	try {
		await t.waitForFunction(ham, { timeout: CHO_MS }, arg);
	} catch {
		throw new Error(`vrc man: khong thay ${moTa}`);
	}
}

async function chupCa(t, ten) {
	await t.evaluate(() => {
		for (const e of document.querySelectorAll(
			"nextjs-portal, [data-nextjs-toast]",
		))
			e.remove();
	});
	await lib.cho(600);
	await t.screenshot({ path: join(process.env.BANG_CHUNG, `${ten}.png`) });
	console.log(`  anh ${ten}.png`);
	writeFileSync(join(process.env.BANG_CHUNG, `${ten}.html`), await t.content());
}

async function moKhung(cookie, rong, id, tieuDe) {
	const t = await d.moTrang(cookie, rong, `/viec?record=viec:${id}`);
	await choThay(
		t,
		(c) =>
			[...document.querySelectorAll('[role="dialog"]')].some((e) =>
				(e.textContent ?? "").includes(c),
			),
		tieuDe,
		`khung ${tieuDe}`,
	);
	return t;
}

const chuKhung = (t) =>
	t.evaluate(() =>
		[...document.querySelectorAll('[role="dialog"]')]
			.map((e) => e.textContent ?? "")
			.join(" "),
	);

async function moLichSu(t) {
	const el = await t.evaluateHandle(
		(c) =>
			[...document.querySelectorAll('[role="tab"]')].find(
				(e) => (e.textContent ?? "").trim() === c,
			) ?? null,
		M.khung.tabLichSu,
	);
	if (!(await el.evaluate((x) => x !== null)))
		throw new Error("vrc man: khong thay the lich su");
	await el.click();
	await choThay(
		t,
		() =>
			document.querySelectorAll('[role="dialog"] [data-slot="item"]').length >
			0,
		null,
		"dong lich su",
	);
}

try {
	const a = await d.nguoiMoi("vrca", "member", "Phạm Thu Hà");
	const b = await d.nguoiMoi("vrcb", "member", "Trần Văn Bình");
	const x = await d.nguoiMoi("vrcx", "member", "Lê Văn Xuân");
	await d.batTrinhDuyet(b.cookie);

	const P = (
		await d.lam(a.cookie, "duAn.tao", {
			ten: `Triển khai Ngân hàng An Phát ${lib.MA}`,
		})
	).id;
	const cty = await d.lam(a.cookie, "companies.create", {
		name: `Ngân hàng An Phát ${lib.MA}`,
	});
	const deal = await d.lam(a.cookie, "deals.create", {
		name: `Thoả thuận An Phát ${lib.MA}`,
		companyId: cty.id,
		ownerId: a.id,
	});
	const viec = async (tieuDe, them) =>
		(
			await d.lam(a.cookie, "viec.create", {
				tieuDe: `${tieuDe} ${lib.MA}`,
				nguoiThucHienId: b.id,
				...them,
			})
		).id;
	const V0 = await viec("Gọi lại anh Tuấn", {});
	const V1 = await viec("Chuẩn bị dữ liệu chi nhánh", { duAnId: P });
	const V2 = await viec("Gửi bản chào phí", { dealId: deal.id });

	if (lib.chay(1))
		await d.chayBuoc(1, async () => {
			const loi = [];
			for (const [id, ten, anh] of [
				[V0, "Gọi lại anh Tuấn", "vrc-khung-rieng-1280"],
				[V1, "Chuẩn bị dữ liệu chi nhánh", "vrc-khung-du-an-1280"],
				[V2, "Gửi bản chào phí", "vrc-khung-ban-ghi-1280"],
			]) {
				const t = await moKhung(b.cookie, KHO_RONG, id, ten);
				const chu = await chuKhung(t);
				if (id === V0 && !chu.includes(M.khung.rieng))
					loi.push("vrc man: khung rieng mat chu");
				if (id === V1) {
					if (chu.includes(RIENG)) {
						console.log("vrc man: khung du-an hua rieng");
						loi.push("vrc man: khung du-an hua rieng");
					}
					if (!chu.includes(M.khung.duAnChung))
						loi.push("vrc man: khung du-an thieu chu");
				}
				if (id === V2 && chu.includes(RIENG))
					loi.push("vrc man: khung ban-ghi hua rieng");
				await chupCa(t, anh);
				await t.close();
			}
			const t = await moKhung(
				b.cookie,
				KHO_HEP,
				V1,
				"Chuẩn bị dữ liệu chi nhánh",
			);
			const rong = await t.evaluate(() => document.documentElement.scrollWidth);
			if (rong > KHO_HEP) {
				console.log("vrc man: 375 cuon ngang");
				loi.push(`vrc man: 375 cuon ngang ${rong}`);
			}
			await chupCa(t, "vrc-khung-du-an-375");
			await t.close();
			d.dat(1, loi.length === 0, loi.join(" · "));
		});

	if (lib.chay(2))
		await d.chayBuoc(2, async () => {
			const loi = [];
			const tenV = `Rà điều khoản bảo mật ${lib.MA}`;
			const V = (
				await d.lam(a.cookie, "viec.create", {
					tieuDe: tenV,
					nguoiThucHienId: b.id,
					duAnId: P,
					batDauNgay: "2026-11-02",
					hanNgay: "2026-11-03",
				})
			).id;
			const W = (
				await d.lam(a.cookie, "viec.create", {
					tieuDe: `Ký hợp đồng triển khai ${lib.MA}`,
					nguoiThucHienId: a.id,
					duAnId: P,
					batDauNgay: "2026-11-04",
					hanNgay: "2026-11-05",
				})
			).id;
			await d.lam(a.cookie, "duAn.phuThuocTao", { truocId: V, sauId: W });
			await d.lam(a.cookie, "viec.doiDuAn", { id: V, duAnId: null });

			const tx = await moKhung(x.cookie, KHO_RONG, W, "Ký hợp đồng triển khai");
			await moLichSu(tx);
			const chuX = await chuKhung(tx);
			if (chuX.includes(tenV)) {
				console.log("vrc man: lich su lo V");
				loi.push("vrc man: lich su lo V");
			}
			if (!chuX.includes(M.lichSu.viecKhuat))
				loi.push("vrc man: lich su thieu chu che");
			await chupCa(tx, "vrc-lich-su-x-1280");
			await tx.close();

			const tb = await moKhung(b.cookie, KHO_RONG, W, "Ký hợp đồng triển khai");
			await moLichSu(tb);
			if (!(await chuKhung(tb)).includes(tenV)) {
				console.log("vrc man: lich su trong cuoc mat ten");
				loi.push("vrc man: lich su trong cuoc mat ten");
			}
			await chupCa(tb, "vrc-lich-su-b-1280");
			await tb.close();
			d.dat(2, loi.length === 0, loi.join(" · "));
		});

	await d.ket("vrc man");
} catch (e) {
	await d.khongDoDuoc(e);
}
