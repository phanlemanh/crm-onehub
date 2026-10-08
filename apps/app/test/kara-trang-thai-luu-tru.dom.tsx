import { afterEach, describe, expect, test } from "bun:test";
import { act, useState } from "react";
import {
	bam,
	cho,
	dat,
	dongHet,
	goiCua,
	mo,
	nhip,
	nutCo,
	phim,
} from "./khung-gop-y";

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { RecordActions } = await import(
	"@/components/crm/record-sheet/record-actions"
);
const { crmMessages } = await import("@/lib/messages/crm");
const { contactMessages } = await import("@/lib/messages/contacts");
const { companyMessages } = await import("@/lib/messages/companies");
const { dealMessages } = await import("@/lib/messages/deals");

type Loai = "contact" | "company" | "deal";

const VI = crmMessages("vi");
const EN = crmMessages("en");
const THU_TUC = {
	contact: "contacts",
	company: "companies",
	deal: "deals",
} as const satisfies Record<Loai, string>;
const DANH_TU = {
	contact: contactMessages("vi").noun,
	company: companyMessages("vi").noun,
	deal: dealMessages("vi").noun,
} as const satisfies Record<Loai, string>;

const chuTrang = () => document.body.textContent ?? "";

function phai(dieu: boolean, thongDiep: string) {
	if (!dieu) throw new Error(thongDiep);
}

afterEach(dongHet);

let anNgan: () => void = () => {};

function Ngan({ loai, archivedAt }: { loai: Loai; archivedAt: string | null }) {
	const [hien, datHien] = useState(true);
	anNgan = () => datHien(false);
	return hien ? (
		<RecordActions
			record={{ kind: loai, id: "r1" }}
			name="Hà"
			consequence="⟦hau qua⟧"
			archivedAt={archivedAt}
		/>
	) : null;
}

async function moMenu(moreActions: string) {
	const trigger = [...document.querySelectorAll("button")].find((b) =>
		(b.textContent ?? "").includes(moreActions),
	);
	if (!trigger) throw new Error("khong thay nut menu");
	await phim(trigger, "Enter");
	await nhip(5);
}

async function chonMuc(chu: string) {
	await cho(
		() =>
			[...document.querySelectorAll("[role=menuitem]")].some(
				(e) => (e.textContent ?? "").trim() === chu,
			),
		`muc ${chu}`,
	);
	const muc = [
		...document.querySelectorAll<HTMLElement>("[role=menuitem]"),
	].find((e) => (e.textContent ?? "").trim() === chu);
	if (!muc) throw new Error(`khong thay muc ${chu}`);
	await bam(muc);
}

function datThuTuc(loai: Loai, restore: () => unknown) {
	dat(`${THU_TUC[loai]}.archive`, () => ({ name: "Hà" }));
	dat(`${THU_TUC[loai]}.restore`, restore);
}

describe("kara-trang-thai-luu-tru", () => {
	test("luu-tru-hoan-tac: toast co Hoan tac, khoi phuc dung mot lan", async () => {
		const o: string[] = [];
		for (const loai of ["contact", "company", "deal"] as const) {
			datThuTuc(loai, () => ({ name: "Hà" }));
			await mo(<Ngan loai={loai} archivedAt={null} />);
			await moMenu(VI.sheet.moreActions);
			await chonMuc(VI.sheet.archive(DANH_TU[loai]));
			expect(goiCua(`${THU_TUC[loai]}.archive`).map((g) => g.dauVao)).toEqual([
				{ id: "r1" },
			]);
			await cho(
				() => chuTrang().includes(VI.sheet.archived("Hà")),
				"toast luu tru",
			);
			const hoanTac = nutCo(VI.sheet.hoanTac);
			phai(hoanTac !== null, "luu-tru: toast khong co Hoan tac");
			await act(async () => {
				hoanTac?.click();
				hoanTac?.click();
			});
			await cho(
				() => chuTrang().includes(VI.sheet.restored("Hà")),
				"toast khoi phuc",
			);
			expect(goiCua(`${THU_TUC[loai]}.restore`).map((g) => g.dauVao)).toEqual([
				{ id: "r1" },
			]);
			o.push(loai);
			await dongHet();
		}

		datThuTuc("contact", () => ({ name: "Hà" }));
		const daKhoiPhuc = goiCua("contacts.restore").length;
		await mo(<Ngan loai="contact" archivedAt={null} />);
		await moMenu(VI.sheet.moreActions);
		await chonMuc(VI.sheet.archive(DANH_TU.contact));
		await cho(
			() => nutCo(VI.sheet.hoanTac) !== null,
			"toast truoc khi dong ngan",
		);
		await act(async () => anNgan());
		await nhip(3);
		const nutSauDong = nutCo(VI.sheet.hoanTac);
		await act(async () => nutSauDong?.click());
		await cho(
			() => goiCua("contacts.restore").length === daKhoiPhuc + 1,
			"hoan tac sau khi dong ngan",
		);
		await dongHet();

		datThuTuc("contact", () => ({ name: "Hà" }));
		await mo(
			<LocaleProvider locale="en">
				<Ngan loai="contact" archivedAt={null} />
			</LocaleProvider>,
		);
		await moMenu(EN.sheet.moreActions);
		await chonMuc(EN.sheet.archive(contactMessages("en").noun));
		await cho(() => chuTrang().includes(EN.sheet.archived("Hà")), "toast en");
		phai(nutCo(EN.sheet.hoanTac) !== null, "luu-tru: toast en khong co Undo");
		o.push("en");
		expect(o.length).toBe(4);
	});

	test("hoan-tac-hong: bao ro, khong chu loi tho, Khoi phuc trong menu van dung", async () => {
		datThuTuc("contact", () => {
			throw new Error("boom-restore");
		});
		await mo(<Ngan loai="contact" archivedAt={null} />);
		await moMenu(VI.sheet.moreActions);
		await chonMuc(VI.sheet.archive(DANH_TU.contact));
		await cho(() => nutCo(VI.sheet.hoanTac) !== null, "toast");
		await bam(nutCo(VI.sheet.hoanTac) as HTMLElement);
		await cho(
			() =>
				chuTrang().includes(VI.sheet.hoanTacLoi) ||
				chuTrang().includes("boom-restore"),
			"bao loi hoan tac",
		);
		phai(!chuTrang().includes("boom-restore"), "hoan-tac-loi: lo chu loi tho");
		expect(chuTrang()).toContain(VI.sheet.hoanTacLoi);
		await dongHet();

		datThuTuc("contact", () => ({ name: "Hà" }));
		await mo(<Ngan loai="contact" archivedAt="2026-10-08T00:00:00.000Z" />);
		const truoc = goiCua("contacts.restore").length;
		await moMenu(VI.sheet.moreActions);
		await chonMuc(VI.sheet.restore(DANH_TU.contact));
		await cho(
			() => goiCua("contacts.restore").length === truoc + 1,
			"khoi phuc tu menu",
		);
	});
});
