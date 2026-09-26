import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Combobox } from "../src/components/combobox";
import { Empty } from "../src/components/empty";
import { LocaleProvider } from "../src/components/locale-provider";
import { SimpleTable, SimpleTableRow } from "../src/components/simple-table";
import { TableCell } from "../src/components/table";
import { ToggleGroup, ToggleGroupItem } from "../src/components/toggle-group";

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

async function ve(cay: ReactElement): Promise<HTMLElement> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	khung = o;
	root = createRoot(o);
	await act(async () =>
		root?.render(<LocaleProvider locale="vi">{cay}</LocaleProvider>),
	);
	return o;
}

function nhom(layout?: "grid-2") {
	return (
		<ToggleGroup layout={layout} type="single" variant="outline">
			<ToggleGroupItem value="a">A</ToggleGroupItem>
			<ToggleGroupItem value="b">B</ToggleGroupItem>
		</ToggleGroup>
	);
}

describe("toggle-group-luoi", () => {
	test("layout grid-2: hai cột ở mọi bề rộng, không quay về hàng ngang từ sm", async () => {
		const o = await ve(nhom("grid-2"));
		const goc = o.querySelector('[data-slot="toggle-group"]');
		const lop = goc?.className.split(/\s+/) ?? [];
		expect({
			layout: goc?.getAttribute("data-layout"),
			luoi: ["grid", "grid-cols-2", "w-full"].filter((c) => !lop.includes(c)),
			conHangNgang: lop.filter((c) =>
				["flex", "w-fit", "sm:flex", "sm:w-fit"].includes(c),
			),
		}).toEqual({ layout: "grid-2", luoi: [], conHangNgang: [] });
	});

	test("doi chung — không khai layout thì giữ hàng ngang như cũ", async () => {
		const o = await ve(nhom());
		const goc = o.querySelector('[data-slot="toggle-group"]');
		const lop = goc?.className.split(/\s+/) ?? [];
		expect({
			layout: goc?.getAttribute("data-layout"),
			flex: lop.includes("flex") && lop.includes("w-fit"),
			luoi: lop.includes("grid-cols-2"),
		}).toEqual({ layout: null, flex: true, luoi: false });
	});
});

describe("combobox-khong-dich", () => {
	test("translate=no tới cả nút và danh sách trong popover", async () => {
		const o = await ve(
			<Combobox
				onValueChange={() => {}}
				options={[{ value: "p1", label: "Kinh doanh vùng 1" }]}
				translate="no"
				value="p1"
			/>,
		);
		const nut = o.querySelector('[data-slot="combobox-trigger"]');
		if (!(nut instanceof HTMLElement)) throw new Error("khong co nut");
		await act(async () => {
			for (const loai of ["pointerdown", "mousedown", "pointerup", "click"])
				nut.dispatchEvent(
					new window.PointerEvent(loai, {
						bubbles: true,
						button: 0,
						pointerType: "mouse",
					}),
				);
		});
		const hop = document.body.querySelector('[data-slot="popover-content"]');
		expect({
			nut: nut.getAttribute("translate"),
			hop: hop?.getAttribute("translate") ?? null,
		}).toEqual({ nut: "no", hop: "no" });
	});
});

describe("combobox-cat-ten-dai", () => {
	test("tên dài cắt bằng dấu … và vẫn đọc đủ qua title", async () => {
		const ten = "Phòng Đối tác chiến lược khu vực miền Bắc và miền Trung";
		const o = await ve(
			<Combobox
				onValueChange={() => {}}
				options={[{ value: "p1", label: ten }]}
				value="p1"
			/>,
		);
		const chu = o.querySelector('[data-slot="select-value"] > span');
		const lop = chu?.className.split(/\s+/) ?? [];
		expect({
			cat: ["truncate", "min-w-0"].filter((c) => !lop.includes(c)),
			title: chu?.getAttribute("title"),
			chu: chu?.textContent,
		}).toEqual({ cat: [], title: ten, chu: ten });
	});

	test("doi chung — chưa chọn thì không có title", async () => {
		const o = await ve(
			<Combobox
				onValueChange={() => {}}
				options={[{ value: "p1", label: "Kinh doanh" }]}
				placeholder="Tìm phòng ban"
				value=""
			/>,
		);
		const chu = o.querySelector('[data-slot="select-value"] > span');
		expect({
			title: chu?.getAttribute("title") ?? null,
			chu: chu?.textContent,
		}).toEqual({ title: null, chu: "Tìm phòng ban" });
	});
});

describe("empty-gon", () => {
	test("size compact: đệm nhỏ, không đệm py-12 của khối rỗng thường", async () => {
		const o = await ve(
			<>
				<Empty size="compact" data-thu="gon" />
				<Empty data-thu="thuong" />
			</>,
		);
		const lop = (thu: string) =>
			o.querySelector(`[data-thu="${thu}"]`)?.className.split(/\s+/) ?? [];
		expect({
			gon: {
				size: o.querySelector('[data-thu="gon"]')?.getAttribute("data-size"),
				py: lop("gon").filter((c) => c.startsWith("py-")),
			},
			thuong: {
				size: o.querySelector('[data-thu="thuong"]')?.getAttribute("data-size"),
				py: lop("thuong").filter((c) => c.startsWith("py-")),
			},
		}).toEqual({
			gon: { size: "compact", py: ["py-6"] },
			thuong: { size: "default", py: ["py-12"] },
		});
	});
});

describe("hang-dang-chon", () => {
	test("selected: hàng mang data-state=selected và vạch đầu dòng, hàng khác không", async () => {
		const o = await ve(
			<SimpleTable columns={[{ id: "ngay", header: "Ngày" }]}>
				<SimpleTableRow selected data-thu="chon">
					<TableCell>27</TableCell>
				</SimpleTableRow>
				<SimpleTableRow data-thu="khong">
					<TableCell>26</TableCell>
				</SimpleTableRow>
			</SimpleTable>,
		);
		const hang = (thu: string) => o.querySelector(`[data-thu="${thu}"]`);
		const vach = (thu: string) =>
			hang(thu)?.className.includes("before:bg-foreground") ?? false;
		expect({
			chon: [hang("chon")?.getAttribute("data-state"), vach("chon")],
			khong: [hang("khong")?.getAttribute("data-state") ?? null, vach("khong")],
		}).toEqual({ chon: ["selected", true], khong: [null, false] });
	});
});
