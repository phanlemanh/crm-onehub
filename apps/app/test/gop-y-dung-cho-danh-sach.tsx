import { describe, expect, test } from "bun:test";
import { act } from "react";
import { danhSachInput } from "../../api/src/okr/okr-xem.contracts";
import {
	bamChuot,
	bamPhim,
	cho,
	type DauVao,
	danhSachTu,
	docCua,
	dung,
	HAI_MAN,
	hangMt,
	kho,
	khoiMt,
	kiemCa,
	kr,
	MT_A,
	MT_B,
	m,
	mucTieu,
	nhip,
	qs,
	qsa,
	soHangMt,
	TheoDonVi,
	thaoHet,
	ui,
} from "./khung-gop-y-dung-cho";

describe("chip", () => {
	test("chip dem tu API tren hai man, B khong co chip va so hang giu nguyen", async () => {
		let soCa = 0;
		for (const man of HAI_MAN) {
			await man.dung([MT_A(), MT_B()]);
			const chipA = qsa('[data-chip-gop-y="mt-a"]');
			expect(chipA.length, `${man.ten}: chip A`).toBe(1);
			expect(chipA[0]?.textContent, "chip khong tu api: A").toBe(
				`Kara · ${m.chip("3")}`,
			);
			expect(chipA[0]?.querySelector("[data-slot=kara-mark]")).not.toBeNull();
			expect(chipA[0]?.getAttribute("aria-label")).toBe(
				m.chipAria("3", "Giữ chân khách miền Bắc"),
			);
			expect(qsa('[data-chip-gop-y="mt-b"]').length, `${man.ten}: chip B`).toBe(
				0,
			);
			const hangB = soHangMt("mt-b");
			await thaoHet();
			await man.dung([MT_B()]);
			await cho(() => khoiMt("mt-b") !== null, "bang doi chung");
			expect(hangB, `${man.ten}: so hang B`).toBe(
				khoiMt("mt-b") === null ? -2 : soHangMt("mt-b"),
			);
			await thaoHet();
			soCa += 2;
		}
		console.log(`so ca chip dem: ${soCa}`);
	});

	test("bam chip bang chuot va Enter mo ho so A, dat co cuon, khong doi thu mo", async () => {
		let soCa = 0;
		for (const man of HAI_MAN) {
			for (const cach of ["chuot", "enter"] as const) {
				const san = await man.dung([MT_A(), MT_B()]);
				const moRa = () =>
					hangMt("mt-a")
						?.querySelector("button[aria-expanded]")
						?.getAttribute("aria-expanded") ?? null;
				const truoc = moRa();
				const chip = qs('[data-chip-gop-y="mt-a"]');
				if (!chip) throw new Error(`${man.ten}: khong co chip A`);
				if (cach === "chuot") await bamChuot(chip);
				else await bamPhim(chip, "{Enter}");
				await cho(() => san.url().get("record") !== null, "url co record");
				kiemCa(
					{
						record: san.url().get("record"),
						neo: san.url().get("neoGopY"),
						moRa: moRa(),
					},
					{ record: "objective:mt-a", neo: "true", moRa: truoc },
					(truong) => `chip ${man.ten}/${cach} sai: ${truong}`,
				);
				await thaoHet();
				soCa += 1;
			}
		}
		console.log(`so ca chip bam: ${soCa}`);
	});

	test("bam ten A mo ho so ma khong dat co cuon", async () => {
		for (const man of HAI_MAN) {
			const san = await man.dung([MT_A(), MT_B()]);
			const ten = qs('[data-mo-muc-tieu="mt-a"]');
			if (!ten) throw new Error("khong co nut ten A");
			await bamChuot(ten);
			await cho(() => san.url().get("record") !== null, "url co record");
			kiemCa(
				{ record: san.url().get("record"), neo: san.url().get("neoGopY") },
				{ record: "objective:mt-a", neo: null },
				(truong) => `bam ten ${man.ten} sai: ${truong}`,
			);
			await thaoHet();
		}
	});
});

const NAM = ["n1", "n2", "n3", "n4", "n5"].map((id, i) =>
	mucTieu(id, [kr(`${id}-k`, id)], { soGopYCho: i < 2 ? 1 : 0 }),
);

const locGopY = (vao: DauVao) => danhSachInput.parse(vao).loc.gopY;

function danhSachTheoLoc(rongKhiLoc = false) {
	return (vao: DauVao) => {
		const coLoc = locGopY(vao).includes("cho");
		const ds = coLoc
			? rongKhiLoc
				? []
				: NAM.filter((mt) => mt.soGopYCho > 0)
			: NAM;
		return danhSachTu(ds, rongKhiLoc ? 0 : 2);
	};
}

const locCuoi = () => {
	const goi = docCua("okr.danhSach").at(-1);
	return goi ? locGopY(goi.vao) : null;
};

async function moMatGopY(): Promise<HTMLElement> {
	const moLoc = qsa('[aria-haspopup="menu"]').find((o) =>
		o.textContent?.trim().startsWith(ui.table.filters),
	);
	if (!moLoc) throw new Error("khong thay nut mo menu Loc");
	await bamChuot(moLoc);
	await cho(
		() =>
			qsa('[role="menuitem"]').some((o) => o.textContent?.includes(m.loc.mat)),
		"mat gop y trong menu",
	);
	const mat = qsa('[role="menuitem"]').find((o) =>
		o.textContent?.includes(m.loc.mat),
	);
	if (!mat) throw new Error("khong thay mat Gop y cua Kara");
	await bamPhim(mat, "{ArrowRight}");
	await cho(
		() => qsa('[role="menuitemcheckbox"]').length > 0,
		"lua chon co gop y cho",
	);
	const chon = qsa('[role="menuitemcheckbox"]').find((o) =>
		o.textContent?.includes(m.loc.coCho("2")),
	);
	if (!chon) throw new Error("khong thay lua chon Co gop y cho · 2");
	return chon;
}

/* Bỏ lọc trên bảng đơn vị (DH2): mục «Bỏ chọn» trong mặt «Góp ý của Kara» của
   menu Lọc — cùng cách mọi DataTable bỏ một mặt lọc. */
async function moBoChonGopY(): Promise<HTMLElement> {
	const moLoc = qsa('[aria-haspopup="menu"]').find((o) =>
		o.textContent?.trim().startsWith(ui.table.filters),
	);
	if (!moLoc) throw new Error("khong thay nut mo menu Loc");
	await bamChuot(moLoc);
	await cho(
		() =>
			qsa('[role="menuitem"]').some((o) => o.textContent?.includes(m.loc.mat)),
		"mat gop y trong menu",
	);
	const mat = qsa('[role="menuitem"]').find((o) =>
		o.textContent?.includes(m.loc.mat),
	);
	if (!mat) throw new Error("khong thay mat Gop y cua Kara");
	await bamPhim(mat, "{ArrowRight}");
	await cho(
		() =>
			qsa('[role="menuitem"]').some(
				(o) => o.textContent?.trim() === ui.table.clearFilters,
			),
		"muc Bo chon cua mat gop y",
	);
	const bo = qsa('[role="menuitem"]').find(
		(o) => o.textContent?.trim() === ui.table.clearFilters,
	);
	if (!bo) throw new Error("khong co muc Bo chon");
	return bo;
}

describe("loc-url", () => {
	test("chon mat gop y ghi URL, gui loc len API, bo loc xoa khoa", async () => {
		kho.danhSach = danhSachTheoLoc();
		const san = await dung(<TheoDonVi />);
		await cho(() => khoiMt("n1") !== null, "nam muc tieu");
		const chon = await moMatGopY();
		await bamChuot(chon);
		await cho(() => san.url().get("gopYOkr") !== null, "url khong ghi gopYOkr");
		expect(san.url().get("gopYOkr"), "url khong ghi gopYOkr").toBe("cho");
		await cho(
			() => Bun.deepEquals(locCuoi(), ["cho"]),
			"input kho.danhSach mang loc.gopY",
		);
		await cho(() => khoiMt("n3") === null, "chi con muc tieu co gop y");
		expect(
			qsa("[data-muc-tieu]").map((k) => k.getAttribute("data-muc-tieu")),
		).toEqual(["n1", "n2"]);
		await act(async () => {
			document.dispatchEvent(
				new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
			);
		});
		await nhip(3);
		const boLoc = await moBoChonGopY();
		await bamChuot(boLoc);
		await cho(() => san.url().get("gopYOkr") === null, "bo loc roi url");
		console.log("so ca loc-url chon/bo: 2");
	});

	test("mo voi gopYOkr=cho gui loc ngay lan dau; loc rong hien khong khop", async () => {
		kho.danhSach = danhSachTheoLoc();
		await dung(<TheoDonVi />, "?gopYOkr=cho");
		await cho(() => docCua("okr.danhSach").length > 0, "goi danhSach");
		expect(docCua("okr.danhSach")[0]?.vao?.loc).toMatchObject({
			gopY: ["cho"],
		});
		await thaoHet();
		kho.daDoc = [];
		kho.danhSach = danhSachTheoLoc(true);
		await dung(<TheoDonVi />, "?gopYOkr=cho");
		await cho(
			() => qs("[data-trang-thai=ST-donvi-loc-khongkhop]") !== null,
			"trang thai khong khop",
		);
		console.log("so ca loc-url mo-url/rong: 2");
	});
});
