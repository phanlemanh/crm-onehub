import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ArchivedList } from "../src/components/archived-list";
import { NavItem } from "../src/components/nav-item";
import { PickListDialog } from "../src/components/pick-list-dialog";
import { StatTile } from "../src/components/stat-tile";

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

function dung(el: ReactElement): HTMLElement {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() => root?.render(el));
	return khung;
}

async function bam(el: Element | null): Promise<void> {
	if (!el) throw new Error("khong thay phan tu de bam");
	await act(async () => {
		(el as HTMLElement).click();
	});
}

function nutCo(chu: string): HTMLButtonElement | null {
	return (
		[...document.body.querySelectorAll("button")].find(
			(b) => b.textContent?.trim() === chu,
		) ?? null
	);
}

describe("nav-item", () => {
	test("nav-item: dang chon mang aria-current=page, nut khac thi khong", () => {
		const k = dung(
			<nav>
				<NavItem active level={0}>
					Gốc
				</NavItem>
				<NavItem level={2}>Phòng ban</NavItem>
			</nav>,
		);
		const nut = [...k.querySelectorAll("[data-slot='nav-item']")];
		expect(nut.map((n) => n.getAttribute("aria-current"))).toEqual([
			"page",
			null,
		]);
	});
});

describe("stat-tile", () => {
	test("stat-tile: bam goi onClick, pressed mang aria-pressed", async () => {
		let bamDuoc = 0;
		const k = dung(
			<StatTile
				label="Có phòng ban chính"
				value="8/15"
				action="Xem"
				pressed
				onClick={() => {
					bamDuoc += 1;
				}}
			/>,
		);
		const nut = k.querySelector("[data-slot='stat-tile']");
		expect(nut?.getAttribute("aria-pressed")).toBe("true");
		expect(nut?.textContent).toContain("8/15");
		await bam(nut);
		expect(bamDuoc).toBe(1);
	});
});

function VoChon({
	loi,
	onConfirm,
}: {
	loi?: string | null;
	onConfirm: (ids: string[]) => void;
}) {
	const [chon, setChon] = useState<string[]>([]);
	return (
		<PickListDialog
			open
			onOpenChange={() => {}}
			title="Thêm người"
			description="Chọn người"
			searchPlaceholder="Tìm theo tên"
			items={[
				{ id: "a", label: "An", hint: "Chưa có phòng ban" },
				{ id: "b", label: "Bình", hint: "Đang ở Kho vận — sẽ chuyển" },
				{ id: "c", label: "Chi" },
			]}
			selected={chon}
			onSelectedChange={setChon}
			confirmLabel={(n) => `Thêm ${n} người`}
			cancelLabel="Huỷ"
			emptyLabel="Không còn ai để thêm"
			error={loi ?? null}
			onConfirm={() => onConfirm(chon)}
		/>
	);
}

describe("pick-list-dialog", () => {
	test("pick-list-dialog: chua chon thi nut mo, chon hai thi nhan mang so va gui dung id", async () => {
		let gui: string[] = [];
		dung(
			<VoChon
				onConfirm={(ids) => {
					gui = ids;
				}}
			/>,
		);
		const xacNhan0 = nutCo("Thêm 0 người");
		expect(`chua chon: disabled=${xacNhan0?.disabled}`).toBe(
			"chua chon: disabled=true",
		);
		const hop = document.body.querySelector("[role='dialog']") as HTMLElement;
		expect(hop.textContent).toContain("Đang ở Kho vận — sẽ chuyển");
		const o = [...hop.querySelectorAll("[role='checkbox']")];
		await bam(o[0] ?? null);
		await bam(o[1] ?? null);
		const xacNhan = nutCo("Thêm 2 người");
		expect(`chon hai: disabled=${xacNhan?.disabled}`).toBe(
			"chon hai: disabled=false",
		);
		await bam(xacNhan);
		expect(gui).toEqual(["a", "b"]);
	});

	test("pick-list-dialog: tim loc danh sach, loi hien duoi o", async () => {
		dung(
			<VoChon loi="Email này chưa là thành viên OneHub Center" onConfirm={() => {}} />,
		);
		const hop = document.body.querySelector("[role='dialog']") as HTMLElement;
		const tim = hop.querySelector("input") as HTMLInputElement;
		await act(async () => {
			const dat = Object.getOwnPropertyDescriptor(
				HTMLInputElement.prototype,
				"value",
			)?.set;
			dat?.call(tim, "bì");
			tim.dispatchEvent(new Event("input", { bubbles: true }));
		});
		const ten = [...hop.querySelectorAll("[data-slot='pick-list-item']")].map(
			(x) => x.getAttribute("data-id"),
		);
		expect(ten).toEqual(["b"]);
		expect(hop.querySelector("[data-slot='field-error']")?.textContent).toBe(
			"Email này chưa là thành viên OneHub Center",
		);
	});
});

describe("archived-list", () => {
	test("archived-list: nhan co so luong, khoi phuc goi dung id, khong purgeable thi khong co nut xoa", async () => {
		const khoiPhuc: string[] = [];
		const xoa: string[] = [];
		const k = dung(
			<ArchivedList
				label="Đã lưu trữ"
				restoreLabel="Khôi phục"
				purgeLabel="Xoá hẳn"
				items={[
					{ id: "x", name: "Pháp chế", purgeable: true },
					{ id: "y", name: "Kho cũ", purgeable: false },
				]}
				onRestore={(id) => khoiPhuc.push(id)}
				onPurge={(m) => xoa.push(m.id)}
			/>,
		);
		const vo = k.querySelector("[data-slot='archived-list']");
		const trigger = nutCo("Đã lưu trữ (2)");
		expect(`nhan: ${trigger !== null} slot: ${vo !== null}`).toBe(
			"nhan: true slot: true",
		);
		await bam(trigger);
		const dong = [...k.querySelectorAll("[data-luu-tru]")];
		expect(dong.map((d) => d.getAttribute("data-luu-tru"))).toEqual(["x", "y"]);
		const nutY = [...(dong[1]?.querySelectorAll("button") ?? [])].map((b) =>
			b.textContent?.trim(),
		);
		expect(nutY).toEqual(["Khôi phục"]);
		await bam(dong[0]?.querySelector("button") ?? null);
		const xoaX = [...(dong[0]?.querySelectorAll("button") ?? [])].find(
			(b) => b.textContent?.trim() === "Xoá hẳn",
		);
		await bam(xoaX ?? null);
		expect({ khoiPhuc, xoa }).toEqual({ khoiPhuc: ["x"], xoa: ["x"] });
	});
});
