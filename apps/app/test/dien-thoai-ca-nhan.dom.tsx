import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import { contactMessages } from "@/lib/messages/contacts";
import { onboardingMessages } from "@/lib/messages/onboarding";
import { recordSheetMessages } from "@/lib/messages/record-sheet";
import { bam, cho, dat, dongHet, go, mo, nhip, trangThai } from "./khung-gop-y";

const { QuickAddContact } = await import(
	"@/components/crm/record-sheet/quick-add"
);
const { CreateContactSheet } = await import(
	"@/app/(app)/[slug]/contacts/create-contact-sheet"
);
const { columnsFor } = await import(
	"@/app/(app)/[slug]/contacts/contacts-table"
);
const { SoDienThoai } = await import("@/components/crm/so-dien-thoai");
const { ChonCaNhan } = await import(
	"@/app/(app)/[slug]/onboarding/[planId]/them-moi-gioi"
);

const rs = recordSheetMessages("vi");
const cm = contactMessages("vi");
const om = onboardingMessages("vi");
const TAO = "contacts.create";

type ThanhPhan = "QuickAddContact" | "CreateContactSheet";

beforeEach(() => {
	trangThai.daGoi = [];
	dat(TAO, () => ({ id: "c-moi", firstName: "Lan", lastName: null }));
});

afterEach(dongHet);

async function moForm(ten: ThanhPhan) {
	if (ten === "QuickAddContact") {
		await mo(<QuickAddContact companyId="co-1" ownerId="u-1" onDone={() => {}} />);
		return;
	}
	await mo(<CreateContactSheet />, { searchParams: "?new=true" });
}

function nhanCacO(): string[] {
	return [...document.querySelectorAll("label")]
		.map((l) => l.textContent?.trim() ?? "")
		.filter((t) =>
			["Tên", "Họ", "Điện thoại", "Email", "Chức danh"].includes(t),
		);
}

function oTheoNhan(nhan: string): HTMLInputElement {
	const label = [...document.querySelectorAll("label")].find(
		(l) => l.textContent?.trim() === nhan,
	);
	const o = label?.htmlFor ? document.getElementById(label.htmlFor) : null;
	if (!(o instanceof HTMLInputElement)) throw new Error(`khong thay o ${nhan}`);
	return o;
}

function nutGui(ten: ThanhPhan): HTMLButtonElement {
	const chu = ten === "QuickAddContact" ? rs.company.addContact : cm.create.submit;
	const nut = [...document.querySelectorAll<HTMLButtonElement>("button")].find(
		(b) => b.textContent?.trim() === chu,
	);
	if (!nut) throw new Error(`khong thay nut ${chu}`);
	return nut;
}

function loiGoiTao() {
	return trangThai.daGoi.filter((g) => g.duong === TAO);
}

describe("gui-so", () => {
	test("gui-so: QuickAddContact thu tu o va gui phone", async () => {
		await moForm("QuickAddContact");
		expect(nhanCacO().join(",")).toBe("Tên,Họ,Điện thoại,Email,Chức danh");
		expect(oTheoNhan("Điện thoại").type).toBe("tel");
		await go(oTheoNhan("Tên"), "Lan");
		await go(oTheoNhan("Điện thoại"), "0901 234 567");
		await bam(nutGui("QuickAddContact"));
		await cho(() => loiGoiTao().length === 1, "contacts.create duoc goi");
		expect(String(loiGoiTao()[0]?.dauVao?.phone)).toBe("0901 234 567");
	});

	test("tao-sheet: thieu phone trong contacts.create", async () => {
		await moForm("CreateContactSheet");
		expect(nhanCacO().slice(0, 4).join(",")).toBe("Tên,Họ,Điện thoại,Email");
		await go(oTheoNhan("Tên"), "Lan");
		await go(oTheoNhan("Điện thoại"), "+84 28 3812 3456");
		await bam(nutGui("CreateContactSheet"));
		await cho(() => loiGoiTao().length === 1, "contacts.create duoc goi");
		expect(String(loiGoiTao()[0]?.dauVao?.phone)).toBe("+84 28 3812 3456");
	});

	for (const ten of ["QuickAddContact", "CreateContactSheet"] as const) {
		test(`gui-so: ${ten} chi go Ten thi khong gui phone`, async () => {
			await moForm(ten);
			await go(oTheoNhan("Tên"), "Lan");
			await bam(nutGui(ten));
			await cho(() => loiGoiTao().length === 1, "contacts.create duoc goi");
			expect(String(loiGoiTao()[0]?.dauVao?.phone)).toBe("undefined");
		});
	}
});

describe("so-sai", () => {
	for (const ten of ["QuickAddContact", "CreateContactSheet"] as const) {
		for (const sai of ["abc", "12345"]) {
			test(`so-sai: mutate da bi goi — ${ten} ${sai}`, async () => {
				await moForm(ten);
				await go(oTheoNhan("Tên"), "Lan");
				await go(oTheoNhan("Điện thoại"), sai);
				await bam(nutGui(ten));
				await nhip(5);
				const loi = document.querySelector('[data-slot="field-error"]');
				expect(
					`${loiGoiTao().length} ${loi?.textContent ?? ""} ${document.activeElement === oTheoNhan("Điện thoại")}`,
				).toBe(`0 ${rs.contact.phoneInvalid} true`);
			});
		}

		test(`so-sai: doi chung so dung — ${ten}`, async () => {
			await moForm(ten);
			await go(oTheoNhan("Tên"), "Lan");
			await go(oTheoNhan("Điện thoại"), "0901 234 567");
			await bam(nutGui(ten));
			await cho(() => loiGoiTao().length === 1, "contacts.create duoc goi");
			expect(document.querySelector('[data-slot="field-error"]')).toBeNull();
		});
	}
});

describe("trung-giu-chu", () => {
	for (const ten of ["QuickAddContact", "CreateContactSheet"] as const) {
		test(`trung-giu-chu: mat chu da go — ${ten}`, async () => {
			dat(TAO, () => {
				throw Object.assign(new Error("Lan A already uses 0901 234 567."), {
					data: { code: "CONFLICT" },
				});
			});
			await moForm(ten);
			await go(oTheoNhan("Tên"), "Lan B");
			await go(oTheoNhan("Điện thoại"), "0901 234 567");
			await bam(nutGui(ten));
			await cho(
				() => document.body.textContent?.includes("Lan A already uses") ?? false,
				"toast bao trung",
			);
			expect(
				`${oTheoNhan("Tên").value} | ${oTheoNhan("Điện thoại").value}`,
			).toBe("Lan B | 0901 234 567");
		});
	}
});

describe("cot-bang", () => {
	const cot = columnsFor(cm);

	test("cot-bang: cot ngay sau ten la dien thoai", () => {
		const i = cot.findIndex((c) => c.id === "name");
		expect(`${cot[i + 1]?.id} ${String(cot[i + 1]?.header)}`).toBe(
			"phone Điện thoại",
		);
	});

	const DONG: [string | null, string][] = [
		["+84901234567", "0901 234 567"],
		["+6561234567", "+6561234567"],
	];

	for (const [phone, ra] of DONG) {
		test(`cot-bang: phai hien ${ra}`, async () => {
			const o = cot.find((c) => c.id === "phone");
			await mo(<div data-o="1">{o?.cell({ phone } as never)}</div>);
			expect(document.querySelector("[data-o]")?.textContent).toBe(ra);
		});
	}

	test("cot-bang: khong so thi o trong chuan", async () => {
		const o = cot.find((c) => c.id === "phone");
		await mo(
			<>
				<div data-o="1">{o?.cell({ phone: null } as never)}</div>
				<div data-mau="1">
					<EmptyCellValue />
				</div>
			</>,
		);
		expect(document.querySelector("[data-o]")?.innerHTML).toBe(
			document.querySelector("[data-mau]")?.innerHTML,
		);
	});
});

describe("ngan-chi-tiet", () => {
	test("ngan-chi-tiet: lien ket goi va dang hien", async () => {
		await mo(<SoDienThoai so="+84901234567" goi />);
		const a = document.querySelector("a");
		expect(`${a?.getAttribute("href")} ${a?.textContent}`).toBe(
			"tel:+84901234567 0901 234 567",
		);
	});
});

describe("goi-y-moi-gioi", () => {
	const M = {
		id: "m",
		firstName: "Moi Gioi",
		lastName: "M",
		email: null,
		phone: "0901.234.567",
		imageUrl: null,
	};
	const N = {
		id: "n",
		firstName: "Moi Gioi",
		lastName: "N",
		email: "n@x.vn",
		phone: null,
		imageUrl: null,
	};

	beforeEach(() => {
		dat("contacts.list", () => ({ rows: [M, N], total: 2, facetCounts: {} }));
	});

	async function moChon() {
		await mo(
			<ChonCaNhan id="cn" value="" onValueChange={() => {}} daTrongPheu={[]} />,
		);
		const nut = document.getElementById("cn");
		if (!nut) throw new Error("khong thay o chon");
		await bam(nut);
		await nhip(5);
	}

	function luaChon(): string[] {
		return [...document.querySelectorAll('[role="option"]')].map(
			(o) => o.textContent ?? "",
		);
	}

	test("goi-y-moi-gioi: M phai hien so", async () => {
		await moChon();
		expect(luaChon().some((t) => t.includes("Moi Gioi M") && t.includes("0901 234 567"))).toBe(true);
	});

	test("goi-y-moi-gioi: N van hien email", async () => {
		await moChon();
		expect(luaChon().some((t) => t.includes("Moi Gioi N") && t.includes("n@x.vn"))).toBe(true);
	});

	for (const so of ["0901234567", "0901 234 567"]) {
		test(`goi-y-moi-gioi: M bi loc mat — go ${so}`, async () => {
			await moChon();
			const tim = document.querySelector<HTMLInputElement>(
				"[cmdk-input], input[role='combobox']",
			);
			await go(tim, so);
			await nhip(10);
			expect(luaChon().some((t) => t.includes("Moi Gioi M"))).toBe(true);
		});
	}

	test("goi-y-moi-gioi: nhan o chon", () => {
		expect(om.tao.moiGioi.contact.length > 0).toBe(true);
	});
});
