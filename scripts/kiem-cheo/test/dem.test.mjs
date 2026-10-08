import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync } from "node:fs";
import os from "node:os";
import { join, resolve } from "node:path";
import { describe, test } from "node:test";
import { KIEM_CHEO } from "../cau-hinh.mjs";
import { taoKho } from "./kho-gia.mjs";

const DEM = resolve(import.meta.dirname, "..", "dem.mjs");

function chay(kho, doiSo, env = {}) {
	const tam = mkdtempSync(join(os.tmpdir(), "kcs-dem-"));
	const thongBao = join(tam, "thong-bao.txt");
	const r = spawnSync("node", [DEM, "--goc", kho.goc, ...doiSo], {
		encoding: "utf8",
		env: {
			...process.env,
			KIEM_CHEO_LAN: "/khong/ton/tai",
			KIEM_CHEO_DUNG_CAY: "true",
			KIEM_CHEO_THONG_BAO: `printf 'GOI %s\\n' "$KCS_TIEU_DE" >> '${thongBao}'`,
			...env,
		},
	});
	const thuMuc = join(kho.goc, KIEM_CHEO.thuMuc);
	const ngay = existsSync(thuMuc)
		? readdirSync(thuMuc).filter((t) => /^\d{4}-\d{2}-\d{2}\.json$/.test(t))
		: [];
	return {
		ma: r.status,
		ra: `${r.stdout}${r.stderr}`,
		ket: ngay.length
			? JSON.parse(readFileSync(join(thuMuc, ngay.at(-1)), "utf8"))
			: null,
		thongBao: existsSync(thongBao)
			? readFileSync(thongBao, "utf8").split("\n").filter(Boolean)
			: [],
		moc: existsSync(join(thuMuc, KIEM_CHEO.tep.moc))
			? JSON.parse(readFileSync(join(thuMuc, KIEM_CHEO.tep.moc), "utf8"))
			: null,
		khoa: existsSync(join(thuMuc, "khoa", "s4")),
		cay: existsSync(join(thuMuc, KIEM_CHEO.tep.cay)),
	};
}

describe("kcs-dem", () => {
	test("(c) moc vang -> ma 2, bao mot lan ket_qua loi, goi ten lenh --tu", () => {
		const kho = taoKho();
		kho.gop({ "a.txt": "a" });
		const r = chay(kho, []);
		assert.equal(r.ma, 2, r.ra);
		assert.equal(r.ket?.ket_qua, "loi");
		assert.match(r.ket.ly_do, /moc vang/);
		assert.match(r.ket.ly_do, /kiem-cheo:chay -- --tu/);
		assert.equal(r.thongBao.length, 1, "phai bao dung mot lan");
		assert.match(r.thongBao[0], /loi/);
		kho.don();
	});

	test("(c) git fetch loi -> loi, bao mot lan", () => {
		const kho = taoKho();
		kho.git("remote", "set-url", "origin", "/khong/co/kho/nao");
		const r = chay(kho, []);
		assert.equal(r.ket?.ket_qua, "loi");
		assert.match(r.ket.ly_do, /git fetch/);
		assert.equal(r.thongBao.length, 1);
		kho.don();
	});

	test("(d) 0 lan gop moi -> khong-gop-moi, khong khoa, khong cay, khong bao", () => {
		const kho = taoKho();
		const r = chay(kho, ["--tu", kho.sha()]);
		assert.equal(r.ma, 0, r.ra);
		assert.equal(r.ket?.ket_qua, "khong-gop-moi");
		assert.equal(r.khoa, false);
		assert.equal(r.cay, false);
		assert.equal(r.thongBao.length, 0);
		kho.don();
	});

	test("(d) tap rong -> xanh 0 ho so, moc tien toi D, khong khoa, khong cay", () => {
		const kho = taoKho();
		kho.hoSo("ky", { paths: ["apps/khac/**"] });
		kho.git("add", "-A");
		kho.git("commit", "-q", "-m", "ho so");
		kho.git("push", "-q", "origin", "onehub");
		const T = kho.sha();
		const D = kho.gop({ "apps/api/a.ts": "a" });
		const r = chay(kho, ["--tu", T]);
		assert.equal(r.ma, 0, r.ra);
		assert.equal(r.ket?.ket_qua, "xanh");
		assert.deepEqual(r.ket.ho_so, []);
		assert.equal(r.moc?.sha, D, "moc phai tien toi D");
		assert.equal(r.khoa, false);
		assert.equal(r.cay, false);
		kho.don();
	});
});
