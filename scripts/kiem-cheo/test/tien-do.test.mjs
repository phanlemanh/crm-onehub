import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import { join, resolve } from "node:path";
import { describe, test } from "node:test";
import { docNhatKyDung, docTienDo, gopDo, suiteDoTrongNhatKy, tapConLai } from "../tien-do.mjs";

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

const MAU = resolve(import.meta.dirname, "../../../_acceptance/kiem-cheo-chay-quang-lang/rang/mau");
const NHAT_KY_THAT = readFileSync(join(MAU, "lan-2026-10-10.log"), "utf8");
const HO_SO_THAT = JSON.parse(readFileSync(join(MAU, "ho-so-2026-10-10.json"), "utf8")).ho_so;

describe("docNhatKyDung tren nhat ky that dem 10/10", () => {
	test("mau dung la nhat ky da do (sha256 ghim) va 146 ho so", () => {
		assert.equal(createHash("sha256").update(NHAT_KY_THAT).digest("hex").slice(0, 12), "734211ad57cf");
		assert.equal(HO_SO_THAT.length, 146);
	});
	test("21 ho so xong, dang do cron-theo-ban-khai", () => {
		const r = docNhatKyDung(NHAT_KY_THAT, HO_SO_THAT);
		assert.equal(r.xong.length, 21);
		assert.equal(r.dangDo, "cron-theo-ban-khai");
		assert.deepEqual(r.xong, HO_SO_THAT.slice(0, 21));
	});
	test("eval do that cua ho so dang do khong vao ket qua cua ho so xong", () => {
		const r = docNhatKyDung(NHAT_KY_THAT, HO_SO_THAT);
		assert.ok(r.ketQua.get("cron-theo-ban-khai").some((e) => e.id === "E8" && e.ma === 2), "ket qua cua ho so dang do van doc duoc");
		assert.ok(!r.xong.includes("cron-theo-ban-khai"));
	});
	test("doi chung: dao thu tu ho so thi so ho so xong doi", () => {
		const r = docNhatKyDung(NHAT_KY_THAT, [...HO_SO_THAT].reverse());
		assert.notEqual(r.xong.length, 21);
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

describe("suiteDoTrongNhatKy", () => {
	const DO = "[lane] suite 1/2: bun run test → exit 1 (190.0s)";
	test("suite do lan dau, xanh o lan chay lai -> khong tinh do", () => {
		const nk = [DO, "[lane] suite 1/2 (chạy lại): bun run test → exit 0 (188.0s)", "[lane] suite 2/2: bun run lint → exit 0 (3.0s)"].join("\n");
		assert.deepEqual(suiteDoTrongNhatKy(nk), []);
	});
	test("suite do ca hai lan -> van tinh do, lay ma lan chay lai", () => {
		const nk = [DO, "[lane] suite 1/2 (chạy lại): bun run test → exit 2 (188.0s)"].join("\n");
		assert.deepEqual(suiteDoTrongNhatKy(nk), ["1/2 (bun run test) ma 2"]);
	});
	test("doi chung: khong co dong chay lai thi suite do van do", () => {
		assert.deepEqual(suiteDoTrongNhatKy(DO), ["1/2 (bun run test) ma 1"]);
	});
});
