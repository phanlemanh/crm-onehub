import { strict as assert } from "node:assert";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { chay, GOC, ghim, LoiKhongChay } from "./chung.mjs";

assert.ok(
	existsSync(join(GOC, "_acceptance", "config.yaml")),
	"GOC phai tro dung goc kho",
);

let nem = null;
try {
	ghim("so tep", 3, 4);
} catch (loi) {
	nem = loi.message;
}
assert.ok(
	nem?.includes("so tep"),
	"ghim phai nem kem TEN hang, khong chi con so",
);
assert.ok(
	nem?.includes("3") && nem?.includes("4"),
	"ghim phai in ca hai con so",
);
assert.equal(ghim("so tep", 4, 4), 4, "ghim khop thi tra chinh gia tri");

const lanh = chay("bash", ["-c", "sleep 0.2; echo xin chao; exit 3"]);
assert.equal(lanh.ma, 3, "chay phai tra dung ma thoat that");
assert.ok(lanh.ra.includes("xin chao"), "chay phai giu dau ra");
assert.ok(
	lanh.giay >= 0.2,
	"chay phai do thoi gian THAT cua luot, khong phai mot so 0 gia",
);

function batLoi(lenh, doi_so) {
	try {
		chay(lenh, doi_so);
	} catch (loi) {
		return loi;
	}
	return null;
}

const biGiet = batLoi("bash", ["-c", "kill -9 $$"]);
assert.ok(
	biGiet instanceof LoiKhongChay,
	"luot bi giet bang tin hieu phai NEM, khong duoc tra ma=null cho nguoi goi",
);
assert.equal(biGiet.tin_hieu, "SIGKILL", "loi phai goi ten tin hieu da giet");

const khongCo = batLoi("khong-he-co-lenh-nay-dau", []);
assert.ok(
	khongCo instanceof LoiKhongChay,
	"lenh khong khoi dong duoc phai NEM, khong duoc doc y het mot lenh DO",
);
assert.equal(khongCo.ma_loi, "ENOENT", "loi phai goi ten ma loi cua he dieu hanh");

console.log("chung.mjs: 10 khang dinh dat");
