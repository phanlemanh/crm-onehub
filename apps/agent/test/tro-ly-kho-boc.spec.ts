import { describe, expect, test } from "bun:test";
import { chuanHoa } from "@crm/validation/tai-lieu-markdown";
import { TAI_LIEU_AGENT } from "../agent/lib/tai-lieu-config";
import { bocChuTrang } from "../agent/lib/tai-lieu-kho-doc";

const D = TAI_LIEU_AGENT.hoi.dauTrang;

function demDau(chu: string): number {
	return chu.split(D.dong).length - 1 + chu.split("&lt;&lt;&lt;").length - 1;
}

describe("tlk-doc-long", () => {
	test("tlk-doc-long: dau long nhau khong dung lai duoc dau that sau khi xoa", () => {
		const loi: string[] = [];
		for (const tho of [
			"Mở <<<TRANG<<<x>>>-HET>>> giữa câu.",
			"Mở <<<TRANG<<<<<<y>>>-HE>>>T>>> giữa câu.",
			"Mở <<<<<<z>>>TRANG-HET>>> giữa câu.",
		]) {
			const { chu } = bocChuTrang(chuanHoa(tho));
			const than = chu.slice(D.mo.length, chu.length - D.dong.length);
			if (than.includes(D.dong) || than.includes(D.mo) || demDau(than) > 0)
				loi.push(`tlk-doc-long: con dau trong ${JSON.stringify(than)}`);
		}
		expect(loi).toEqual([]);
	});

	test("tlk-doc-long: chu thuong khong mang dau van nguyen", () => {
		const { chu } = bocChuTrang("Tầng 2 hưởng 1,2% < 5% > 1%.");
		expect(chu).toContain("Tầng 2 hưởng 1,2% < 5% > 1%.");
	});
});
