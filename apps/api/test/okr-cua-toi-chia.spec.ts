import { describe, expect, test } from "bun:test";
import {
	TRANG_THAI_MUC_TIEU,
	type TrangThaiMucTieu,
} from "@crm/validation/okr-muc-tieu";
import { chiaCuaToi } from "../src/okr/cua-toi";

type Dich = "objectives" | "daBo" | "dangTheoDoi" | "khong";

const BANG: {
	thuoc: boolean;
	status: TrangThaiMucTieu;
	dich: Dich;
	ghim: string;
}[] = [
	{
		thuoc: true,
		status: "nhap",
		dich: "objectives",
		ghim: "nhap cua toi roi khoi objectives",
	},
	{
		thuoc: true,
		status: "cho-duyet",
		dich: "objectives",
		ghim: "cho-duyet cua toi roi khoi objectives",
	},
	{
		thuoc: true,
		status: "cong-bo",
		dich: "objectives",
		ghim: "cong-bo cua toi roi khoi objectives",
	},
	{
		thuoc: true,
		status: "da-bo",
		dich: "daBo",
		ghim: "da-bo cua toi khong o daBo",
	},
	{
		thuoc: false,
		status: "nhap",
		dich: "dangTheoDoi",
		ghim: "nhap chi theo doi khong o dangTheoDoi",
	},
	{
		thuoc: false,
		status: "cho-duyet",
		dich: "dangTheoDoi",
		ghim: "cho-duyet chi theo doi khong o dangTheoDoi",
	},
	{
		thuoc: false,
		status: "cong-bo",
		dich: "dangTheoDoi",
		ghim: "cong-bo chi theo doi khong o dangTheoDoi",
	},
	{
		thuoc: false,
		status: "da-bo",
		dich: "khong",
		ghim: "chi-theo-doi-da-bo lot vao dangTheoDoi",
	},
];

function noi(r: ReturnType<typeof chiaCuaToi>, id: string): Dich[] {
	const o: Dich[] = [];
	if (r.objectives.some((m) => m.id === id)) o.push("objectives");
	if (r.daBo.some((m) => m.id === id)) o.push("daBo");
	if (r.dangTheoDoi.some((m) => m.id === id)) o.push("dangTheoDoi");
	return o.length === 0 ? ["khong"] : o;
}

describe("chia-cua-toi", () => {
	test("bang 2 x 4 phu du trang thai muc tieu", () => {
		expect({
			trangThai: new Set(BANG.map((d) => d.status)),
			soDong: BANG.length,
		}).toEqual({ trangThai: new Set(TRANG_THAI_MUC_TIEU), soDong: 8 });
	});

	for (const [i, d] of BANG.entries())
		test(`${d.thuoc ? "thuoc" : "khong thuoc"} x ${d.status}`, () => {
			const id = `m${i}`;
			const r = chiaCuaToi(
				[{ id, status: d.status }],
				new Set(d.thuoc ? [id] : []),
			);
			const thay = noi(r, id);
			if (thay.length !== 1 || thay[0] !== d.dich)
				throw new Error(`${d.ghim}: mong ${d.dich}, thay ${thay.join("+")}`);
		});

	test("giu thu tu dau vao trong tung mang", () => {
		const ds = (["b", "a", "d", "c"] as const).map((id) => ({
			id,
			status: "cong-bo" as const,
		}));
		const r = chiaCuaToi(ds, new Set(["b", "d"]));
		expect({
			objectives: r.objectives.map((m) => m.id),
			dangTheoDoi: r.dangTheoDoi.map((m) => m.id),
		}).toEqual({ objectives: ["b", "d"], dangTheoDoi: ["a", "c"] });
	});
});
