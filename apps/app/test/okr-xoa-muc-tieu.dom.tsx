import { describe, expect, test } from "bun:test";
import type { ObjectiveOutput } from "../../api/src/okr/okr.contracts";
import {
	bamChuot,
	cho,
	chiTietTu,
	DetailSheet,
	daBoTu,
	dung,
	kho,
	mucTieu,
	nhip,
	ObjectiveSheet,
	okrMessages,
	type San,
} from "./okr-don-san";

const m = okrMessages("vi").sheet;

async function dungSheet(ct: ObjectiveOutput): Promise<San> {
	kho.chiTiet = ct;
	const san = await dung(
		<DetailSheet onOpenChange={() => {}} open>
			<ObjectiveSheet objectiveId={ct.id} />
		</DetailSheet>,
		`?record=objective:${ct.id}`,
	);
	await cho(
		() =>
			document.body.querySelector("[data-okr-sheet] [role=tab]") !== null &&
			document.body.querySelector("[data-so-kr-cho]") === null,
		"sheet tai xong",
	);
	return san;
}

const nutMenu = () =>
	document.body.querySelector<HTMLButtonElement>(
		`button[aria-label="${m.menu}"]`,
	);

async function mucMenu(): Promise<string[]> {
	const nut = nutMenu();
	if (!nut) return [];
	await bamChuot(nut);
	await cho(
		() => document.body.querySelector("[role=menuitem]") !== null,
		"mo menu",
	);
	return [...document.body.querySelectorAll("[role=menuitem]")].map(
		(x) => x.textContent?.trim() ?? "",
	);
}

const NHAP = (doi = {}) =>
	mucTieu("mt-x", { status: "nhap", publishedAt: null, canEdit: true, ...doi });

describe("menu-theo-trang-thai", () => {
	const CA: {
		ten: string;
		ct: () => ObjectiveOutput;
		mong: { xoa: boolean; bo: boolean; dungLai: boolean };
	}[] = [
		{
			ten: "nhap / xoa true",
			ct: () => chiTietTu(NHAP(), { xoa: true, datHienThi: true }),
			mong: { xoa: true, bo: false, dungLai: false },
		},
		{
			ten: "nhap / xoa false",
			ct: () => chiTietTu(NHAP(), { datHienThi: true }),
			mong: { xoa: false, bo: true, dungLai: false },
		},
		{
			ten: "cong-bo / xoa false",
			ct: () => chiTietTu(mucTieu("mt-x", { canEdit: true })),
			mong: { xoa: false, bo: true, dungLai: false },
		},
		{
			ten: "da-bo / xoa true / dungLai true",
			ct: () =>
				chiTietTu(
					{ ...daBoTu("mt-x"), canEdit: true },
					{ xoa: true, dungLai: true },
				),
			mong: { xoa: true, bo: false, dungLai: true },
		},
		{
			ten: "da-bo / xoa false / dungLai true",
			ct: () =>
				chiTietTu({ ...daBoTu("mt-x"), canEdit: true }, { dungLai: true }),
			mong: { xoa: false, bo: false, dungLai: true },
		},
	];
	for (const ca of CA)
		test(`menu-theo-trang-thai: ${ca.ten}`, async () => {
			await dungSheet(ca.ct());
			const dungLai =
				document.body.querySelector("[data-nut='dung-lai']") !== null;
			const muc = await mucMenu();
			console.log(
				`menu ${ca.ten}: ${JSON.stringify(muc)}; dung lai ${dungLai}`,
			);
			expect({
				xoa: muc.includes(m.xoa),
				bo: muc.includes(m.bo),
				dungLai,
			}).toEqual(ca.mong);
		});
});

async function moHoiXoa() {
	const muc = await mucMenu();
	if (!muc.includes(m.xoa)) throw new Error(`menu khong co Xoa: ${muc}`);
	const item = [...document.body.querySelectorAll("[role=menuitem]")].find(
		(x) => x.textContent?.trim() === m.xoa,
	);
	if (!item) throw new Error("khong thay muc Xoa");
	await bamChuot(item);
	await cho(
		() => document.body.querySelector("[role=alertdialog]") !== null,
		"mo hop hoi xoa",
	);
	return document.body.querySelector<HTMLElement>("[role=alertdialog]");
}

async function xacNhan(hop: HTMLElement | null) {
	const nut = [...(hop?.querySelectorAll("button") ?? [])].find(
		(b) => b.textContent?.trim() === m.hoiXoa.action,
	);
	if (!nut) throw new Error("khong thay nut xac nhan");
	await bamChuot(nut);
	await nhip(6);
}

describe("xoa", () => {
	test("xoa: hop hoi lai co ten (translate=no) va so KR; xac nhan goi xoaMucTieu mot lan, dong ngan, toast", async () => {
		const san = await dungSheet(chiTietTu(NHAP(), { xoa: true }));
		const hop = await moHoiXoa();
		const ten = hop?.querySelector("[translate='no']")?.textContent ?? null;
		const than = hop?.textContent ?? "";
		await xacNhan(hop);
		const goi = kho.daGhi.filter((g) => g.duong === "okr.xoaMucTieu");
		expect({
			tieuDe: than.includes(m.hoiXoa.title),
			ten,
			soKr: than.includes(m.hoiXoa.body(2)),
			goi: goi.map((g) => g.dauVao),
			record: san.url().get("record"),
			toast: kho.toast,
		}).toEqual({
			tieuDe: true,
			ten: "Mục tiêu mt-x",
			soKr: true,
			goi: [{ id: "mt-x" }],
			record: null,
			toast: [{ loai: "success", chu: m.daXoa }],
		});
	});

	test("xoa loi: may chu tu choi thi toast dung thong diep, ngan o lai", async () => {
		const cau = "Mục tiêu đã có bình luận — không xoá được. Hãy bỏ mục tiêu.";
		kho.loiGhi.set("okr.xoaMucTieu", cau);
		const san = await dungSheet(chiTietTu(NHAP(), { xoa: true }));
		const hop = await moHoiXoa();
		await xacNhan(hop);
		expect({
			record: san.url().get("record"),
			toast: kho.toast,
		}).toEqual({
			record: "objective:mt-x",
			toast: [{ loai: "error", chu: cau }],
		});
	});
});

describe("dung-lai", () => {
	for (const [canGuiDuyet, chu] of [
		[true, m.daDungLai.guiDuyet],
		[false, m.daDungLai.congBo],
	] as const)
		test(`dung-lai: bam Dung lai goi dungLaiMucTieu mot lan, khong hop hoi lai, toast theo canGuiDuyet=${canGuiDuyet}`, async () => {
			kho.traGhi.set("okr.dungLaiMucTieu", {
				id: "mt-x",
				canhBao: null,
				canGuiDuyet,
			});
			await dungSheet(
				chiTietTu({ ...daBoTu("mt-x"), canEdit: true }, { dungLai: true }),
			);
			const nut = document.body.querySelector("[data-nut='dung-lai']");
			if (!nut) throw new Error("khong thay nut Dung lai");
			await bamChuot(nut);
			await nhip(6);
			expect({
				goi: kho.daGhi
					.filter((g) => g.duong === "okr.dungLaiMucTieu")
					.map((g) => g.dauVao),
				hop: document.body.querySelector("[role=alertdialog]") !== null,
				toast: kho.toast,
			}).toEqual({
				goi: [{ id: "mt-x" }],
				hop: false,
				toast: [{ loai: "success", chu }],
			});
		});
});
