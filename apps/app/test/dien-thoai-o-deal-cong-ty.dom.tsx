import { afterEach, describe, expect, test } from "bun:test";
import { dat, dongHet, mo, nhip, phim, trangThai } from "./khung-gop-y";

const { AttachDealContact } = await import(
	"@/components/crm/record-sheet/quick-add"
);

const LUA_CHON = [
	{
		id: "c-a",
		firstName: "An",
		lastName: "Lê",
		email: null,
		phone: "+84901234567",
		title: "Trưởng phòng",
		imageUrl: null,
	},
	{
		id: "c-b",
		firstName: "Bình",
		lastName: "Trần",
		email: null,
		phone: "+84901234568",
		title: null,
		imageUrl: null,
	},
	{
		id: "c-c",
		firstName: "Chi",
		lastName: "Phạm",
		email: null,
		phone: null,
		title: "Kế toán",
		imageUrl: null,
	},
];

afterEach(dongHet);

async function moOChon() {
	trangThai.daGoi = [];
	dat("deals.contactOptions", () => LUA_CHON);
	dat("deals.attachContact", () => ({ contactId: "c-a" }));
	await mo(
		<AttachDealContact
			dealId="d-1"
			companyName="Thép Hòa Phát"
			onDone={() => undefined}
		/>,
	);
	const nut = document.querySelector("[role='combobox']");
	if (!nut) throw new Error("chon-nguoi: khong thay o chon");
	await phim(nut, "ArrowDown");
	await nhip(5);
	return [...document.querySelectorAll("[role='option']")].map((o) =>
		(o.textContent ?? "").replace(/\s+/g, " ").trim(),
	);
}

describe("chon-nguoi", () => {
	test("moi lua chon hien ten · chuc danh · so, bo ve trong", async () => {
		const chu = await moOChon();
		if (!chu[0]?.includes("0901 234 567")) {
			throw new Error(`chon-nguoi: thieu so — ${chu.join(" | ")}`);
		}
		expect(chu).toEqual([
			"An Lê · Trưởng phòng · 0901 234 567",
			"Bình Trần · 0901 234 568",
			"Chi Phạm · Kế toán",
		]);
	});
});
