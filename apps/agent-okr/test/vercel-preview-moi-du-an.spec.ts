import { describe, expect, test } from "bun:test";
import {
	cauHinhVercel,
	DU_AN,
	docTho,
	duocTrienKhai,
	type LuatTrienKhai,
	NHANH,
} from "./vercel-du-an";

function loiCua(tep: string): string[] {
	try {
		return (cauHinhVercel.safeParse(docTho(tep)).error?.issues ?? []).map(
			(issue) => `${issue.path.join(".") || "(goc)"}: ${issue.message}`,
		);
	} catch (loi) {
		return [loi instanceof Error ? loi.message : String(loi)];
	}
}

function docCauHinh(tep: string): LuatTrienKhai {
	return cauHinhVercel.parse(docTho(tep));
}

describe("vercel-preview-moi-du-an", () => {
	test("hop-le", () => {
		expect(DU_AN).toHaveLength(4);
		const ketQua = DU_AN.map(({ ten, tep }) => ({
			duAn: ten,
			tep,
			loi: loiCua(tep),
		}));
		expect(ketQua).toHaveLength(4);
		expect(ketQua.filter(({ loi }) => loi.length > 0)).toEqual([]);
	});

	test("onehub-trien-khai", () => {
		const ketQua = DU_AN.map(({ ten, tep }) => ({
			duAn: ten,
			trienKhai: duocTrienKhai(docCauHinh(tep), "onehub"),
		}));
		expect(ketQua).toHaveLength(4);
		expect(ketQua.filter(({ trienKhai }) => !trienKhai)).toEqual([]);
	});

	test("nhanh-khac-khong-trien-khai", () => {
		expect(NHANH).toHaveLength(18);
		const cap = DU_AN.flatMap(({ ten, tep }) => {
			const cauHinh = docCauHinh(tep);
			return NHANH.map((nhanh) => ({
				duAn: ten,
				nhanh,
				trienKhai: duocTrienKhai(cauHinh, nhanh),
			}));
		});
		expect(cap).toHaveLength(72);
		expect(cap.filter(({ trienKhai }) => trienKhai)).toEqual([]);
	});

	test("bo-khop-bat-bay-sao", () => {
		const bay = { git: { deploymentEnabled: { "*": false, onehub: true } } };
		expect({
			fix: duocTrienKhai(bay, "fix/a"),
			main: duocTrienKhai(bay, "main"),
			onehub: duocTrienKhai(bay, "onehub"),
		}).toEqual({ fix: true, main: false, onehub: true });
	});
});
