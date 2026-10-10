import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { docNhatKyDung, docTienDo, gopDo, tapConLai } from "../tien-do.mjs";

const NHAT_KY = [
	"[lane] sha abc · 7 suite · 3 hồ sơ · 6 eval máy",
	"[lane] suite 1/7: bun run test -- --filter=api → exit 0 (191.7s)",
	"[lane] a E1: node a.mjs → exit 0 (0.1s)",
	"[lane] a E2: node a2.mjs → exit 1 (0.2s)",
	"    nhật ký trọn: .acceptance-runs/x/01-a-E2.log",
	"[lane] a E2 (chạy lại): node a2.mjs → exit 1 (0.2s)",
	"[lane] b E1: (đã chạy) → exit 0",
	"[lane] b E3: node b3.mjs → exit 2 (0.1s)",
	"[lane] c E1: node c.mjs → exit 0 (0.1s)",
	"[lane] TỔNG KẾT — vuot-tran · 80 phút · 9 lệnh",
].join("\n");

describe("docNhatKyDung", () => {
	test("ho so truoc ho so cuoi co dong ket qua la xong; ho so cuoi dang do dang", () => {
		const r = docNhatKyDung(NHAT_KY, ["a", "b", "c", "d"]);
		assert.deepEqual(r.xong, ["a", "b"]);
		assert.equal(r.dangDo, "c");
	});
	test("lan chay lai thay ket qua lan dau; lenh lay tu dong co lenh", () => {
		const r = docNhatKyDung(NHAT_KY, ["a", "b", "c", "d"]);
		assert.deepEqual(r.ketQua.get("a"), [
			{ id: "E1", lenh: "node a.mjs", ma: 0 },
			{ id: "E2", lenh: "node a2.mjs", ma: 1 },
		]);
		assert.deepEqual(r.ketQua.get("b"), [
			{ id: "E1", lenh: null, ma: 0 },
			{ id: "E3", lenh: "node b3.mjs", ma: 2 },
		]);
	});
	test("khong dong ket qua nao -> 0 ho so xong", () => {
		const r = docNhatKyDung("[lane] suite 1/7: x → exit 0 (1s)\n", ["a", "b"]);
		assert.deepEqual(r.xong, []);
		assert.equal(r.dangDo, null);
	});
	test("ho so khong co eval may nao van tinh xong khi ho so sau no da chay", () => {
		const r = docNhatKyDung("[lane] c E1: node c.mjs → exit 0 (0.1s)\n[lane] d E1: node d.mjs → exit 0 (0s)\n", ["a", "b", "c", "d", "e"]);
		assert.deepEqual(r.xong, ["a", "b", "c"]);
	});
	test("doi chung do: dem ho so dang do la xong thi sai", () => {
		const r = docNhatKyDung(NHAT_KY, ["a", "b", "c", "d"]);
		assert.ok(!r.xong.includes("c"), "ho so dang do khong duoc tinh xong");
	});
	test("dong cua ho so ngoai danh sach bi bo qua", () => {
		const r = docNhatKyDung("[lane] la E1: x → exit 0 (0s)\n[lane] b E1: y → exit 0 (0s)\n", ["a", "b", "c"]);
		assert.deepEqual(r.xong, ["a"]);
	});
});

describe("tapConLai", () => {
	const tienDo = { tu: "T", den: "D1", xong: ["a", "b", "c"], do: [] };
	test("dinh khong doi -> chi do phan con lai", () => {
		assert.deepEqual(tapConLai({ tap: ["a", "b", "c", "d", "e"], tienDo, chamMoi: [] }), ["d", "e"]);
	});
	test("lan gop moi cham ho so da xong -> do lai ho so do", () => {
		assert.deepEqual(tapConLai({ tap: ["a", "b", "c", "d"], tienDo, chamMoi: ["b"] }), ["b", "d"]);
	});
	test("doi chung do: bo qua chamMoi thi ho so bi cham khong duoc do lai", () => {
		const sai = ["a", "b", "c", "d"].filter((s) => !tienDo.xong.includes(s));
		assert.notDeepEqual(sai, tapConLai({ tap: ["a", "b", "c", "d"], tienDo, chamMoi: ["b"] }));
	});
});

describe("gopDo", () => {
	test("do cu cua ho so bi do lai bi bo, do moi thay vao", () => {
		const cu = [{ ho_so: "a", eval: "E1", loai: "do-san" }, { ho_so: "b", eval: "E2", loai: "do-moi" }];
		const moi = [{ ho_so: "b", eval: "E3", loai: "chap-chon" }];
		assert.deepEqual(gopDo({ cu, moi, doLai: ["b"] }), [cu[0], moi[0]]);
	});
});

describe("docTienDo", () => {
	const tam = mkdtempSync(join(os.tmpdir(), "kcs-tien-do-"));
	const tep = join(tam, "tien-do.json");
	test("vang -> khong co, khong loi", () => {
		assert.deepEqual(docTienDo(join(tam, "khong-co.json"), "T"), { co: false });
	});
	test("hong -> ly do goi ten", () => {
		writeFileSync(tep, "{hong");
		const r = docTienDo(tep, "T");
		assert.equal(r.co, false);
		assert.match(r.lyDo, /tien-do\.json hong/);
	});
	test("thieu truong -> ly do goi ten", () => {
		writeFileSync(tep, JSON.stringify({ tu: "T", den: "D", xong: "a" }));
		assert.match(docTienDo(tep, "T").lyDo, /thieu truong/);
	});
	test("khac moc -> ly do goi ten ca hai moc", () => {
		writeFileSync(tep, JSON.stringify({ tu: "T0", den: "D", xong: [], do: [] }));
		const r = docTienDo(tep, "T1");
		assert.equal(r.co, false);
		assert.match(r.lyDo, /T0.*T1/);
	});
	test("dung moc -> tra tien do", () => {
		writeFileSync(tep, JSON.stringify({ tu: "T", den: "D", xong: ["a"], do: [] }));
		assert.deepEqual(docTienDo(tep, "T"), { co: true, tienDo: { tu: "T", den: "D", xong: ["a"], do: [] } });
	});
});
