import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readdirSync, readFileSync } from "node:fs";
import os from "node:os";
import { join, resolve } from "node:path";
import { taoKho } from "../../../scripts/kiem-cheo/test/kho-gia.mjs";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const DEM = join(GOC, "scripts", "kiem-cheo", "dem.mjs");
const LAN_GIA = join(import.meta.dirname, "lan-gia.mjs");
const KIEM = `const fs = require("node:fs");
if (fs.existsSync("cham.txt")) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 20000);
const dem = process.env.KCS_DEM;
if (dem) {
  const n = (fs.existsSync(dem) ? Number(fs.readFileSync(dem, "utf8")) : 0) + 1;
  fs.writeFileSync(dem, String(n));
  if (n === 1) process.exit(1);
}
process.exit(fs.readFileSync("san-pham.txt", "utf8").startsWith("tot") ? 0 : 1);
`;

function chupCayGoi() {
	const trangThai = execFileSync(
		"git",
		["-C", GOC, "status", "--porcelain=v1", "--untracked-files=all"],
		{ encoding: "utf8" },
	);
	const h = createHash("sha256").update(trangThai);
	for (const dong of trangThai.split("\n").filter(Boolean)) {
		const p = join(GOC, dong.slice(3));
		if (existsSync(p)) {
			try {
				h.update(readFileSync(p));
			} catch {}
		}
	}
	return h.digest("hex");
}

function dungKho({ hoSoTuT = true, sanPhamT = "tot", gop }) {
	const kho = taoKho();
	kho.ghi("kiem.js", KIEM);
	kho.ghi("san-pham.txt", sanPhamT);
	if (hoSoTuT) kho.hoSo("ky", { paths: ["san-pham.txt"] });
	kho.git("add", "-A");
	kho.git("commit", "-q", "-m", "nen");
	kho.git("push", "-q", "origin", "onehub");
	const T = kho.sha();
	const M = [];
	for (const g of gop) {
		if (g.hoSo) {
			kho.hoSo("ky", { paths: ["san-pham.txt"] });
		}
		M.push(kho.gop(g.tep ?? {}));
	}
	return { kho, T, M };
}

function chay({ kho, T, env = {} }) {
	const tam = mkdtempSync(join(os.tmpdir(), "kcs-pha-"));
	const argvTep = join(tam, "argv.jsonl");
	const thongBao = join(tam, "thong-bao.txt");
	const r = spawnSync("node", [DEM, "--goc", kho.goc, "--tu", T], {
		encoding: "utf8",
		env: {
			...process.env,
			KIEM_CHEO_LAN: LAN_GIA,
			KIEM_CHEO_DUNG_CAY: "true",
			KIEM_CHEO_THONG_BAO: `printf '%s\\n' "$KCS_TIEU_DE" >> '${thongBao}'`,
			KCS_ARGV: argvTep,
			...env,
		},
	});
	const thuMuc = join(kho.goc, ".acceptance-runs", "kiem-cheo");
	const tepNgay = existsSync(thuMuc)
		? readdirSync(thuMuc).filter((t) => /^\d{4}-\d{2}-\d{2}\.json$/.test(t))
		: [];
	const ket = tepNgay.length
		? JSON.parse(readFileSync(join(thuMuc, tepNgay.at(-1)), "utf8"))
		: null;
	const argv = existsSync(argvTep)
		? readFileSync(argvTep, "utf8")
				.split("\n")
				.filter(Boolean)
				.map((d) => JSON.parse(d))
		: [];
	const moc = join(thuMuc, "moc.json");
	return {
		ma: r.status,
		ra: `${r.stdout}${r.stderr}`,
		ket,
		argv,
		moc: existsSync(moc) ? JSON.parse(readFileSync(moc, "utf8")) : null,
		khoa: existsSync(join(thuMuc, "khoa", "s4")),
		tam,
	};
}

const sanPham = (v) => ({ tep: { "san-pham.txt": v } });
const khac = (t) => ({ tep: { [t]: t } });
const loi = [];

function o(ten, fn) {
	const truoc = chupCayGoi();
	try {
		fn();
		if (chupCayGoi() !== truoc) throw new Error("cay noi goi lenh bi doi");
		console.log(`o ${ten}: dat`);
	} catch (e) {
		loi.push(`o ${ten}: ${e.message}`);
		console.log(`o ${ten}: HONG — ${e.message}`);
	}
}

function bang(a, b, thongDiep) {
	if (JSON.stringify(a) !== JSON.stringify(b)) {
		throw new Error(
			`${thongDiep}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`,
		);
	}
}

o("(a) doi chung khong pha -> xanh", () => {
	const { kho, T } = dungKho({
		gop: [khac("x.txt"), sanPham("tot2"), khac("y.txt")],
	});
	const r = chay({ kho, T });
	bang(r.ket?.ket_qua, "xanh", "ket_qua");
	bang(r.ket?.ho_so, ["ky"], "ho_so");
	kho.don();
});

o("(b) pha o M2 -> do-moi goi ten M2", () => {
	const { kho, T, M } = dungKho({
		gop: [khac("x.txt"), sanPham("hong"), khac("y.txt")],
	});
	const r = chay({ kho, T });
	bang(r.ket?.ket_qua, "do", "ket_qua");
	const moi = r.ket.do.filter((d) => d.loai === "do-moi");
	bang(moi.length, 1, "so muc do-moi");
	bang(moi[0].lan_gop, M[1], "lan_gop phai la sha M2");
	kho.don();
});

o("(c) pha o T -> do-san, khong do-moi", () => {
	const { kho, T } = dungKho({
		sanPhamT: "hong",
		gop: [khac("x.txt"), sanPham("hong2"), khac("y.txt")],
	});
	const r = chay({ kho, T });
	bang(
		r.ket?.do?.map((d) => d.loai),
		["do-san"],
		"loai",
	);
	if (r.ket.ket_qua === "do")
		throw new Error("do-san khong duoc lam ket_qua do");
	kho.don();
});

o("(d) do lan dau, xanh khi chay lai -> chap-chon", () => {
	const { kho, T } = dungKho({ gop: [khac("x.txt"), sanPham("tot2")] });
	const dem = join(mkdtempSync(join(os.tmpdir(), "kcs-dem-")), "dem");
	const r = chay({ kho, T, env: { KCS_DEM: dem } });
	bang(
		r.ket?.do?.map((d) => d.loai),
		["chap-chon"],
		"loai",
	);
	bang(r.ket.ket_qua, "xanh", "ket_qua");
	kho.don();
});

o("(e) lan chay trong cay rieng .acceptance-runs/kiem-cheo/cay", () => {
	const { kho, T } = dungKho({ gop: [sanPham("tot2")] });
	const r = chay({ kho, T });
	const cay = join(kho.goc, ".acceptance-runs", "kiem-cheo", "cay");
	if (
		!r.argv.length ||
		!r.argv.every(
			(a) => a.cwd.endsWith("/.acceptance-runs/kiem-cheo/cay") || a.cwd === cay,
		)
	) {
		throw new Error(`cwd cua lan: ${r.argv.map((a) => a.cwd).join(", ")}`);
	}
	kho.don();
});

o(
	"(f) dung cay that bai -> khong-chay-duoc goi ten buoc, moc khong tien",
	() => {
		const { kho, T } = dungKho({ gop: [sanPham("tot2")] });
		const r = chay({ kho, T, env: { KIEM_CHEO_DUNG_CAY: "exit 7" } });
		bang(r.ket?.ket_qua, "khong-chay-duoc", "ket_qua");
		if (!/dung cay/.test(r.ket.ly_do)) throw new Error(`ly_do: ${r.ket.ly_do}`);
		bang(r.moc, null, "moc.json");
		kho.don();
	},
);

o("(f) suite cua lan do -> khong-chay-duoc, moc khong tien", () => {
	const { kho, T } = dungKho({ gop: [sanPham("tot2")] });
	const r = chay({ kho, T, env: { KCS_SUITE_MA: "1" } });
	bang(r.ket?.ket_qua, "khong-chay-duoc", "ket_qua");
	if (!/suite do o D/.test(r.ket.ly_do))
		throw new Error(`ly_do: ${r.ket.ly_do}`);
	bang(r.moc, null, "moc.json");
	kho.don();
});

o("(g) ho so vao o M1, pha o M2 -> do-moi M2", () => {
	const { kho, T, M } = dungKho({
		hoSoTuT: false,
		gop: [
			{ hoSo: true, tep: { "a.txt": "a" } },
			sanPham("hong"),
			khac("y.txt"),
		],
	});
	const r = chay({ kho, T });
	bang(
		r.ket?.do?.map((d) => [d.loai, d.lan_gop]),
		[["do-moi", M[1]]],
		"do",
	);
	kho.don();
});

o("(g) doi chung: ho so co tu T, pha o T -> do-san", () => {
	const { kho, T } = dungKho({ sanPhamT: "hong", gop: [sanPham("hong2")] });
	const r = chay({ kho, T });
	bang(
		r.ket?.do?.map((d) => d.loai),
		["do-san"],
		"loai",
	);
	kho.don();
});

o("(h) argv: khong --write, dung mot --slug cho moi ho so cua tap", () => {
	const { kho, T } = dungKho({ gop: [sanPham("tot2")] });
	const r = chay({ kho, T });
	const a = r.argv[0]?.argv ?? [];
	if (a.includes("--write")) throw new Error("lan duoc goi voi --write");
	const slug = a.flatMap((x, i) => (x === "--slug" ? [a[i + 1]] : []));
	bang(slug, ["ky"], "slug");
	kho.don();
});

o(
	"(i) vuot tran -> khong-chay-duoc, tien trinh con chet, khoa tra, moc khong tien",
	() => {
		const { kho, T } = dungKho({ gop: [sanPham("tot2")] });
		const pidTep = join(mkdtempSync(join(os.tmpdir(), "kcs-pid-")), "pid");
		const r = chay({
			kho,
			T,
			env: { KIEM_CHEO_TRAN_PHUT: "0.05", KCS_NGU: "60", KCS_PID: pidTep },
		});
		bang(r.ket?.ket_qua, "khong-chay-duoc", "ket_qua");
		if (!/vuot tran/.test(r.ket.ly_do))
			throw new Error(`ly_do: ${r.ket.ly_do}`);
		const pid = Number(readFileSync(pidTep, "utf8"));
		let song = true;
		for (let i = 0; i < 50 && song; i++) {
			try {
				process.kill(pid, 0);
				spawnSync("sleep", ["0.2"]);
			} catch {
				song = false;
			}
		}
		if (song) throw new Error(`tien trinh con ${pid} van song`);
		bang(r.khoa, false, "khoa s4 con");
		bang(r.moc, null, "moc.json");
		kho.don();
	},
);

o(
	"(j) lan thoat ma 4 (tu dung o tran cua lan) -> khong-chay-duoc, moc khong tien",
	() => {
		const { kho, T } = dungKho({ gop: [sanPham("tot2")] });
		const r = chay({ kho, T, env: { KCS_LAN_MA: "4" } });
		bang(r.ket?.ket_qua, "khong-chay-duoc", "ket_qua");
		if (!/lan dung som \(ma 4[,)]/.test(r.ket.ly_do))
			throw new Error(`ly_do: ${r.ket.ly_do}`);
		bang(r.moc, null, "moc.json");
		kho.don();
	},
);

o(
	"(k) tran no giua lenh tim nhi phan -> khong-chay-duoc vuot tran, khong phan loai",
	() => {
		const { kho, T } = dungKho({
			gop: [
				{ tep: { "cham.txt": "1" } },
				{ tep: { "cham.txt": null, "san-pham.txt": "hong" } },
			],
		});
		const r = chay({ kho, T, env: { KIEM_CHEO_TRAN_PHUT: "0.08" } });
		bang(r.ket?.ket_qua, "khong-chay-duoc", "ket_qua");
		if (!/vuot tran/.test(r.ket.ly_do))
			throw new Error(`ly_do: ${r.ket.ly_do}`);
		bang(r.ket.do, [], "khong duoc ghi phan loai do lenh bi giet");
		bang(r.moc, null, "moc.json");
		kho.don();
	},
);

if (loi.length > 0) {
	console.error(loi.join("\n"));
	process.exit(1);
}
console.log("pha-thu: moi o dat");
