import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import os from "node:os";
import { join, resolve } from "node:path";
import { describe, test } from "node:test";
import { KIEM_CHEO } from "../cau-hinh.mjs";
import { taoKho } from "./kho-gia.mjs";

const DEM = resolve(import.meta.dirname, "..", "dem.mjs");

function chay(kho, doiSo, env = {}, { dem = DEM } = {}) {
	const tam = mkdtempSync(join(os.tmpdir(), "kcs-dem-"));
	const thongBao = join(tam, "thong-bao.txt");
	const r = spawnSync("node", [dem, "--goc", kho.goc, ...doiSo], {
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

const LAN_CAT_CHU = `const lenh = "node kiem.js 'thanh công bố'";
const json = JSON.stringify({
	suites: [{ cmd: "true", exit: 0 }],
	slugs: { ky: { evals_exit: { E1: 1 }, lech: [{ id: "E1", cmd: lenh, expected: 0, exit: 1 }] } },
});
const b = Buffer.from(json, "utf8");
const o = b.indexOf(Buffer.from("ô", "utf8")) + 1;
process.stdout.write(b.subarray(0, o), () => {
	setTimeout(() => process.stdout.write(b.subarray(o), () => process.exit(1)), 200);
});
`;

describe("kcs-dem", () => {
	test("lenh co dau bi cat giua hai lan ghi stdout van giu nguyen khi chay lai", () => {
		const kho = taoKho();
		kho.ghi("kiem.js", "process.exit(0);\n");
		kho.hoSo("ky", { paths: ["a.txt"] });
		kho.git("add", "-A");
		kho.git("commit", "-q", "-m", "ho so");
		kho.git("push", "-q", "origin", "onehub");
		const T = kho.sha();
		kho.gop({ "a.txt": "b" });
		const lan = join(mkdtempSync(join(os.tmpdir(), "kcs-lan-")), "lan.mjs");
		writeFileSync(lan, LAN_CAT_CHU);
		const r = chay(kho, ["--tu", T], { KIEM_CHEO_LAN: lan });
		assert.equal(r.ma, 0, r.ra);
		assert.deepEqual(
			r.ket?.do?.map((d) => [d.loai, d.lenh]),
			[["chap-chon", "node kiem.js 'thanh công bố'"]],
			JSON.stringify(r.ket),
		);
		kho.don();
	});

	test("goi qua duong symlink van chay luot, khong thoat 0 im lang", () => {
		const kho = taoKho();
		kho.gop({ "a.txt": "a" });
		const lienKet = join(mkdtempSync(join(os.tmpdir(), "kcs-lk-")), "dem.mjs");
		symlinkSync(DEM, lienKet);
		const r = chay(kho, [], {}, { dem: lienKet });
		assert.equal(r.ma, 2, r.ra);
		assert.equal(r.ket?.ket_qua, "loi");
		kho.don();
	});

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

	const LAN_DEM = `import { appendFileSync } from "node:fs";
const argv = process.argv.slice(2);
const slugs = argv.flatMap((a, i) => (a === "--slug" ? [argv[i + 1]] : []));
if (process.env.KCS_ARGV) appendFileSync(process.env.KCS_ARGV, JSON.stringify(slugs) + "\\n");
if (process.env.KCS_TRAN) appendFileSync(process.env.KCS_TRAN, String(argv[argv.indexOf("--tran-phut") + 1]) + "\\n");
const loi = (s) => process.stderr.write(s + "\\n");
if (process.env.KCS_MA_CUNG) process.exit(Number(process.env.KCS_MA_CUNG));
const lechCua = new Set((process.env.KCS_LECH ?? "").split(",").filter(Boolean));
loi("[lane] sha x · 1 suite · " + slugs.length + " hồ sơ");
loi("[lane] suite 1/1: true → exit 0 (0.1s)");
const dung = process.env.KCS_DUNG_SAU === undefined ? null : Number(process.env.KCS_DUNG_SAU);
const lech = {};
for (const [i, s] of slugs.entries()) {
  if (dung !== null && i > dung) break;
  const ma = lechCua.has(s) ? 1 : 0;
  loi("[lane] " + s + " E1: node kiem.js " + s + " → exit " + ma + " (0.1s)");
  if (ma) lech[s] = [{ id: "E1", cmd: "node kiem.js " + s, expected: 0, exit: 1 }];
}
if (dung !== null) { loi("[lane] TỔNG KẾT — vuot-tran"); process.exit(4); }
process.stdout.write(JSON.stringify({ suites: [{ cmd: "true", exit: 0 }], slugs: Object.fromEntries(slugs.map((s) => [s, { lech: lech[s] ?? [] }])) }));
process.exit(Object.keys(lech).length ? 1 : 0);
`;

	const KIEM_JS = `const fs = require("node:fs");
if (process.argv[2] && process.argv[2] === process.env.KCS_NGU) {
  const t = Date.now();
  while (Date.now() - t < 30000) {}
}
process.exit(fs.existsSync("hong.txt") ? 1 : 0);
`;
	const SAU = ["a", "b", "c", "d", "e", "f"];
	function khoSau() {
		const kho = taoKho();
		kho.ghi("kiem.js", KIEM_JS);
		for (const s of SAU) kho.hoSo(s, { paths: [`x-${s}.txt`] });
		kho.git("add", "-A");
		kho.git("commit", "-q", "-m", "ho so");
		kho.git("push", "-q", "origin", "onehub");
		const T = kho.sha();
		const D1 = kho.gop({ "hong.txt": "1", ...Object.fromEntries(SAU.map((s) => [`x-${s}.txt`, "1"])) });
		const lan = join(mkdtempSync(join(os.tmpdir(), "kcs-lan-dem-")), "lan.mjs");
		writeFileSync(lan, LAN_DEM);
		const argvTep = join(mkdtempSync(join(os.tmpdir(), "kcs-argv-")), "argv.jsonl");
		const dem = (env) => {
			const r = chay(kho, ["--tu", T], { KIEM_CHEO_LAN: lan, KCS_ARGV: argvTep, ...env });
			const ds = existsSync(argvTep) ? readFileSync(argvTep, "utf8").split("\n").filter(Boolean) : [];
			return { ...r, argv: ds.length ? JSON.parse(ds.at(-1)) : null };
		};
		const tienDo = () => {
			const t = join(kho.goc, KIEM_CHEO.thuMuc, KIEM_CHEO.tep.tienDo);
			return existsSync(t) ? JSON.parse(readFileSync(t, "utf8")) : null;
		};
		return { kho, T, D1, dem, tienDo, tepTienDo: join(kho.goc, KIEM_CHEO.thuMuc, KIEM_CHEO.tep.tienDo) };
	}

	test("chay tiep: ba dem, cham tran hai lan, gop do qua cac dem, ket luan sau cung", () => {
		const k = khoSau();
		const d1 = k.dem({ KCS_DUNG_SAU: "2", KCS_LECH: "a" });
		assert.equal(d1.ma, 0, d1.ra);
		assert.deepEqual(d1.argv, SAU);
		assert.equal(d1.ket?.ket_qua, "chua-xong", JSON.stringify(d1.ket));
		assert.equal(d1.ket.xong_dem_nay, "2/6");
		assert.deepEqual(d1.ket.tap_lan, SAU);
		assert.deepEqual(k.tienDo()?.xong, ["a", "b"]);
		assert.equal(k.tienDo()?.den, k.D1);
		assert.deepEqual(k.tienDo()?.do.map((d) => [d.ho_so, d.loai]), [["a", "do-moi"]]);
		assert.equal(d1.moc, null, "moc khong tien khi chua xong");

		const D2 = k.kho.gop({ "x-b.txt": "2" });
		const d2 = k.dem({ KCS_DUNG_SAU: "1" });
		assert.deepEqual(d2.argv, ["b", "c", "d", "e", "f"], "dem 2 do lai b (bi cham) va phan con lai");
		assert.equal(d2.ket?.ket_qua, "chua-xong");
		assert.deepEqual(k.tienDo()?.xong, ["a", "b"]);
		assert.equal(k.tienDo()?.den, D2);
		assert.equal(k.tienDo()?.tu, k.T);
		assert.deepEqual(k.tienDo()?.do.map((d) => [d.ho_so, d.loai]), [["a", "do-moi"]], "do-moi cua dem 1 phai con");

		const d3 = k.dem({});
		assert.deepEqual(d3.argv, ["c", "d", "e", "f"]);
		assert.equal(d3.ket?.ket_qua, "do", "do-moi chi co o dem 1 van lat ket_qua thanh do");
		assert.equal(d3.moc?.sha, D2);
		assert.equal(k.tienDo(), null, "tien-do bi xoa khi do het");
		k.kho.don();
	});

	test("chay tiep: dem cuoi lan thoat 1 vi mot eval lech -> gop do, moc tien, tien-do xoa", () => {
		const k = khoSau();
		k.dem({ KCS_DUNG_SAU: "3" });
		const d2 = k.dem({ KCS_LECH: "f" });
		assert.deepEqual(d2.argv, ["d", "e", "f"]);
		assert.equal(d2.ket?.ket_qua, "do", JSON.stringify(d2.ket));
		assert.deepEqual(d2.ket.do.map((d) => d.ho_so), ["f"]);
		assert.equal(d2.moc?.sha, k.D1);
		assert.equal(k.tienDo(), null);
		k.kho.don();
	});

	test("chay tiep: lan loi ha tang (thoat 3) giu nguyen tien-do tung byte, moc dung", () => {
		const k = khoSau();
		k.dem({ KCS_DUNG_SAU: "2", KCS_LECH: "a" });
		const truoc = readFileSync(k.tepTienDo, "utf8");
		const d2 = k.dem({ KCS_MA_CUNG: "3" });
		assert.equal(d2.ket?.ket_qua, "khong-chay-duoc");
		assert.equal(readFileSync(k.tepTienDo, "utf8"), truoc);
		assert.equal(d2.moc, null);
		k.kho.don();
	});

	test("chay tiep: tien-do hong -> do du tap va ghi ly do", () => {
		const k = khoSau();
		k.dem({ KCS_DUNG_SAU: "2" });
		writeFileSync(k.tepTienDo, "{hong");
		const d2 = k.dem({});
		assert.deepEqual(d2.argv, SAU);
		assert.match(d2.ket?.ly_do_tien_do ?? "", /tien-do\.json hong/);
		assert.equal(d2.ket?.ket_qua, "xanh");
		k.kho.don();
	});
	test("chay tiep: phan loai vuot tran sau lan cham tran -> ghi tien-do cua ho so da phan loai, ho so cat ngang do lai dem sau", () => {
		const k = khoSau();
		const tran = join(mkdtempSync(join(os.tmpdir(), "kcs-tran-")), "tran.txt");
		const d1 = k.dem({ KCS_DUNG_SAU: "3", KCS_LECH: "a,c", KCS_NGU: "c", KIEM_CHEO_TRAN_PHUT: "0.1", KCS_TRAN: tran });
		assert.equal(d1.ket?.ket_qua, "chua-xong", JSON.stringify(d1.ket));
		assert.equal(readFileSync(tran, "utf8").trim(), String(KIEM_CHEO.luot.lanPhut), "lan nhan --tran-phut rieng");
		assert.deepEqual(k.tienDo()?.xong, ["a", "b"], "c lech chua phan loai xong -> khong tinh xong");
		assert.deepEqual(k.tienDo()?.do.map((d) => [d.ho_so, d.loai]), [["a", "do-moi"]]);
		assert.match(d1.ket.ly_do, /cat ngang o c/);
		assert.equal(d1.moc, null);

		const d2 = k.dem({ KCS_LECH: "c" });
		assert.deepEqual(d2.argv, ["c", "d", "e", "f"]);
		assert.equal(d2.ket?.ket_qua, "do");
		assert.deepEqual(d2.ket.do.map((d) => d.ho_so).sort(), ["a", "c"]);
		assert.equal(d2.moc?.sha, k.D1);
		assert.equal(k.tienDo(), null);
		k.kho.don();
	});

	test("chay tiep: lan chay het nhung phan loai vuot tran -> chua-xong, khong mat ho so da do", () => {
		const k = khoSau();
		const d1 = k.dem({ KCS_LECH: "a,b", KCS_NGU: "b", KIEM_CHEO_TRAN_PHUT: "0.1" });
		assert.equal(d1.ket?.ket_qua, "chua-xong", JSON.stringify(d1.ket));
		assert.deepEqual(k.tienDo()?.xong, ["a", "c", "d", "e", "f"]);
		assert.equal(d1.moc, null);
		const d2 = k.dem({ KCS_LECH: "b" });
		assert.deepEqual(d2.argv, ["b"]);
		assert.equal(d2.ket?.ket_qua, "do");
		k.kho.don();
	});

});
