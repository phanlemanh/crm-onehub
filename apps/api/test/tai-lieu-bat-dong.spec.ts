import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { nap, tuanTuHoa } from "@crm/validation/tai-lieu-markdown";
import { deXuat, docMau, dungSan, duyet, MAU, taoTrang } from "./tai-lieu-san";

dungSan();

const SO_MAU = 12;

describe("bat-dong", () => {
	test("bat-dong: moi mau de xuat qua tRPC, noi dung da luu nap lai tuan tu hoa y het tung byte", async () => {
		expect(MAU).toHaveLength(SO_MAU);
		const { slug, deXuatId } = await taoTrang(
			"Điểm bất động qua máy chủ",
			"Bản gốc để đề xuất.",
		);
		await duyet(deXuatId, "chu");
		const vo: string[] = [];
		for (const mau of MAU) {
			const id = await deXuat(slug, docMau(mau), "khac");
			const { noiDung } = await db.taiLieuDeXuat.findUniqueOrThrow({
				where: { id },
				select: { noiDung: true },
			});
			const lai = tuanTuHoa(nap(noiDung));
			const dat = Buffer.from(lai).equals(Buffer.from(noiDung));
			process.stdout.write(`bat-dong: ${mau} -> ${dat ? "dat" : "vo"}\n`);
			if (!dat) vo.push(`diem bat dong vo: ${mau}`);
		}
		expect(vo).toEqual([]);
	});
});
