import { describe, expect, test } from "bun:test";
import { LOAI_VET_DU_AN, parseVetDuAn } from "../src/du-an";
import { LOAI_VET_VIEC, NGUON_VIEC, parseVetViec } from "../src/viec";

describe("dg-vet", () => {
	test("dg-vet: bốn loại vết việc mới đọc được, khuôn sai bị từ chối", () => {
		const viec = { id: "a", tieuDe: "A" };
		const dung = [
			{
				loai: "doi-bat-dau",
				truoc: { batDauNgay: null },
				sau: { batDauNgay: "2026-10-20" },
			},
			{
				loai: "doi-bat-dau",
				truoc: { batDauNgay: "2026-10-22" },
				sau: { batDauNgay: "2026-10-27", boi: viec },
			},
			{
				loai: "doi-han",
				truoc: { hanNgay: "2026-10-23" },
				sau: { hanNgay: "2026-10-28", boi: viec },
			},
			{ loai: "doi-du-an", truoc: null, sau: { id: "p", ten: "P" } },
			{ loai: "doi-du-an", truoc: { id: "p", ten: "P" }, sau: null },
			{ loai: "them-phu-thuoc", truoc: null, sau: { viec } },
			{ loai: "go-phu-thuoc", truoc: { viec }, sau: null },
		];
		for (const h of dung) {
			try {
				parseVetViec({ id: "x", ...h });
			} catch (e) {
				throw new Error(`dg: vet moi khong doc duoc ${h.loai} ${String(e)}`);
			}
		}
		let tuChoi = false;
		try {
			parseVetViec({
				id: "x",
				loai: "them-phu-thuoc",
				truoc: null,
				sau: { viec: { id: "a" } },
			});
		} catch {
			tuChoi = true;
		}
		if (!tuChoi) throw new Error("dg: vet sai khuon van doc");
		for (const l of [
			"doi-bat-dau",
			"doi-du-an",
			"them-phu-thuoc",
			"go-phu-thuoc",
		]) {
			if (!(LOAI_VET_VIEC as readonly string[]).includes(l))
				throw new Error(`dg: thieu loai ${l}`);
		}
		for (const n of ["gantt", "tu-doi"]) {
			if (!(NGUON_VIEC as readonly string[]).includes(n))
				throw new Error(`dg: thieu nguon ${n}`);
		}
		expect(tuChoi).toBe(true);
	});

	test("dg-vet: chín loại vết dự án đọc được", () => {
		const noiDung = { ten: "P", moTa: null };
		const moc = { id: "m", ten: "Go-live", ngay: "2026-10-30" };
		const viec = { id: "a", tieuDe: "A" };
		const dung = {
			tao: { truoc: null, sau: noiDung },
			"doi-noi-dung": { truoc: noiDung, sau: { ten: "Q", moTa: "x" } },
			"them-viec": { truoc: null, sau: viec },
			"bot-viec": { truoc: viec, sau: null },
			"them-moc": { truoc: null, sau: moc },
			"sua-moc": { truoc: moc, sau: { ...moc, ngay: "2026-11-02" } },
			"xoa-moc": { truoc: moc, sau: null },
			dong: { truoc: null, sau: null },
			"mo-lai": { truoc: null, sau: null },
		};
		for (const loai of LOAI_VET_DU_AN) {
			const h = dung[loai];
			parseVetDuAn({ loai, truoc: h.truoc, sau: h.sau });
		}
		expect(Object.keys(dung).length).toBe(LOAI_VET_DU_AN.length);
	});
});
