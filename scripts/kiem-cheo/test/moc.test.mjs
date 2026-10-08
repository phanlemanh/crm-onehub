import assert from "node:assert/strict";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { after, describe, test } from "node:test";
import { KIEM_CHEO } from "../cau-hinh.mjs";
import { canMoc, docMoc, ghiMoc, lanGop, ngayCua, tepDoi } from "../moc.mjs";
import { taoKho } from "./kho-gia.mjs";

const kho = taoKho();
after(() => kho.don());
const T = kho.sha();
const M1 = kho.gop({ "apps/api/a.ts": "1" });
const M2 = kho.gop({ "apps/app/b.tsx": "2" });
const M3 = kho.gop({ "packages/ui/c.ts": "3" });
const git = (...a) => kho.git(...a);

describe("kcs-moc", () => {
	test("(a) lanGop(T, M3) = [M1, M2, M3] dung thu tu; lanGop(M3, M3) = []", () => {
		assert.deepEqual(lanGop(git, T, M3), [M1, M2, M3]);
		assert.deepEqual(lanGop(git, M3, M3), []);
	});

	test("(a) tepDoi(T, M3) liet du ba tep san pham", () => {
		assert.deepEqual(tepDoi(git, T, M3).sort(), [
			"apps/api/a.ts",
			"apps/app/b.tsx",
			"packages/ui/c.ts",
		]);
	});

	test("(e) canMoc: 19 gio -> khong moc; 21 gio -> ngay cua M1", () => {
		const now = Date.parse("2026-10-09T02:00:00Z");
		const ngay = (sha) => ngayCua(git, sha);
		const lanGopChuaKiem = [M1, M2, M3];
		assert.equal(
			canMoc({
				lucTruoc: new Date(now - 19 * KIEM_CHEO.donVi.gioMs).toISOString(),
				now,
				lanGop: lanGopChuaKiem,
				ngayCua: ngay,
			}),
			null,
			"duoi 20 gio khong duoc mang moc",
		);
		assert.equal(
			canMoc({
				lucTruoc: new Date(now - 21 * KIEM_CHEO.donVi.gioMs).toISOString(),
				now,
				lanGop: lanGopChuaKiem,
				ngayCua: ngay,
			}),
			ngay(M1),
			"qua 20 gio: moc = ngay cua lan gop cu nhat chua kiem (M1)",
		);
		assert.match(ngay(M1), /^\d{4}-\d{2}-\d{2}$/);
	});

	test("(c) docMoc: vang / hong / sha khong tren first-parent -> loi goi ten ly do", () => {
		const goc = kho.goc;
		assert.match(docMoc({ goc, git, ref: "origin/onehub" }).loi, /vang/);
		const d = join(goc, KIEM_CHEO.thuMuc);
		mkdirSync(d, { recursive: true });
		writeFileSync(join(d, KIEM_CHEO.tep.moc), "{hong");
		assert.match(docMoc({ goc, git, ref: "origin/onehub" }).loi, /hong/);
		const nhanhNgoai = kho.gop({ "x.ts": "x" }, "onehub");
		git("reset", "-q", "--hard", M3);
		git("push", "-q", "-f", "origin", "onehub");
		ghiMoc(goc, { sha: nhanhNgoai, luc: "2026-10-08T00:00:00Z" });
		assert.match(
			docMoc({ goc, git, ref: "origin/onehub" }).loi,
			/khong con tren first-parent/,
		);
		ghiMoc(goc, { sha: M1, luc: "2026-10-08T00:00:00Z" });
		assert.deepEqual(docMoc({ goc, git, ref: "origin/onehub" }), {
			sha: M1,
			luc: "2026-10-08T00:00:00Z",
		});
	});

	test("(j) --nhanh: khoang gop la merge cua nhanh nhap, khong phai cua onehub", () => {
		git("checkout", "-q", "-b", "nhap", M3);
		git("push", "-q", "origin", "nhap");
		const N1 = kho.gop({ "apps/api/pha.ts": "pha" }, "nhap");
		git("checkout", "-q", "onehub");
		assert.deepEqual(lanGop(git, M3, "origin/nhap"), [N1]);
		assert.deepEqual(lanGop(git, M3, "origin/onehub"), []);
	});
});
