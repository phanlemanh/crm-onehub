import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs, {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import os from "node:os";
import { join } from "node:path";
import { after, describe, test } from "node:test";
import { kiemDon } from "../../dieu-phoi/hinh-dang.mjs";
import { KIEM_CHEO } from "../cau-hinh.mjs";
import { layKhoa, voiKhoa } from "../khoa.mjs";

const tam = mkdtempSync(join(os.tmpdir(), "kcs-khoa-"));
after(() => rmSync(tam, { recursive: true, force: true }));

const PID_CHET = (() => {
	const r = spawnSync(process.execPath, ["-e", "console.log(process.pid)"], {
		encoding: "utf8",
	});
	return Number(r.stdout.trim());
})();

function dotGia(ten, pid) {
	const d = join(tam, ten);
	mkdirSync(join(d, "xin"), { recursive: true });
	mkdirSync(join(d, "khoa"), { recursive: true });
	writeFileSync(join(d, KIEM_CHEO.khoa.tepPid), `${pid}\n`);
	return d;
}

const DON = `${KIEM_CHEO.khoa.phien}-${KIEM_CHEO.khoa.loai}.json`;
const CAY = join(tam, "kho", ".acceptance-runs", "kiem-cheo", "cay");

function capCho(d, phien) {
	return async () => {
		if (!existsSync(join(d, "xin", DON))) return;
		mkdirSync(join(d, "khoa", "s4"), { recursive: true });
		writeFileSync(
			join(d, "khoa", "s4", "chu.json"),
			JSON.stringify({ phien, worktree: CAY }),
		);
	};
}

describe("kcs-khoa", () => {
	test("(f) co dot: don dung khoa, ghi tep tam roi doi ten, cap cho kiem-cheo -> lay duoc, tra thi xoa khoa", async () => {
		const d = dotGia("dot-song", process.pid);
		const ghiThang = [];
		const fsGian = {
			...fs,
			writeFileSync: (p, ...r) => {
				if (String(p).endsWith(`/xin/${DON}`)) ghiThang.push(p);
				return fs.writeFileSync(p, ...r);
			},
		};
		let don;
		const khoa = await layKhoa({
			goc: tam,
			cay: CAY,
			moc: "2026-10-07",
			timDot: () => d,
			fs: fsGian,
			cho: async () => {
				don ??= JSON.parse(readFileSync(join(d, "xin", DON), "utf8"));
				await capCho(d, KIEM_CHEO.khoa.phien)();
			},
			now: () => Date.parse("2026-10-09T01:00:00Z"),
		});
		assert.deepEqual(ghiThang, [], "don phai ghi qua tep tam roi doi ten");
		assert.deepEqual(Object.keys(don).sort(), [
			"loai",
			"luc",
			"moc",
			"phien",
			"slug",
			"uoc_phut",
			"worktree",
		]);
		assert.equal(don.phien, "kiem-cheo");
		assert.equal(don.slug, "kiem-cheo-sau-gop");
		assert.equal(don.loai, "s4");
		assert.equal(don.worktree, CAY);
		assert.equal(don.moc, "2026-10-07");
		assert.equal(khoa.loai, "dot");
		assert.doesNotThrow(
			() => kiemDon(don),
			"don phai qua kiemDon that cua bo phat lich (worktree la thu muc ton tai)",
		);
		khoa.tra();
		assert.ok(!existsSync(join(d, "khoa", "s4")), "tra khoa phai xoa khoa/s4");
	});

	test("(f) khong moc thi don khong co khoa moc", async () => {
		const d = dotGia("dot-song-2", process.pid);
		let don;
		const khoa = await layKhoa({
			goc: tam,
			cay: CAY,
			moc: null,
			timDot: () => d,
			cho: async () => {
				don ??= JSON.parse(readFileSync(join(d, "xin", DON), "utf8"));
				await capCho(d, KIEM_CHEO.khoa.phien)();
			},
		});
		assert.ok(!("moc" in don), "duoi 20 gio don khong mang moc");
		khoa.tra();
	});

	test("(f) khoa o P3 tron thoi gian cho -> bo-luot-khoa-ban goi ten P3, don duoc rut", async () => {
		const d = dotGia("dot-ban", process.pid);
		let t = Date.parse("2026-10-09T01:00:00Z");
		const kq = await layKhoa({
			goc: tam,
			cay: CAY,
			moc: null,
			timDot: () => d,
			cho: async () => {
				await capCho(d, "P3")();
				t += KIEM_CHEO.khoa.choToiDaMs;
			},
			now: () => t,
		});
		assert.deepEqual(kq, { ban: true, chu: "P3" });
		assert.ok(!existsSync(join(d, "xin", DON)), "het gio cho phai rut don");
	});

	test("(f) ham chay nem loi -> khoa van duoc tra", async () => {
		const d = dotGia("dot-loi", process.pid);
		const khoa = await layKhoa({
			goc: tam,
			cay: CAY,
			moc: null,
			timDot: () => d,
			cho: capCho(d, KIEM_CHEO.khoa.phien),
		});
		await assert.rejects(
			voiKhoa(khoa, async () => {
				throw new Error("lan no");
			}),
			/lan no/,
		);
		assert.ok(!existsSync(join(d, "khoa", "s4")), "loi van phai tra khoa");
	});

	test("(g) khong dot song: khoa tay khoa/s4 + chu.json kiem-cheo, tra thi xoa", async () => {
		const d = dotGia("dot-chet", PID_CHET);
		const khoa = await layKhoa({
			goc: tam,
			cay: CAY,
			moc: null,
			timDot: () => d,
		});
		assert.equal(khoa.loai, "tay");
		const chu = JSON.parse(
			readFileSync(join(d, "khoa", "s4", "chu.json"), "utf8"),
		);
		assert.equal(chu.phien, "kiem-cheo");
		assert.equal(chu.worktree, CAY);
		assert.ok(!existsSync(join(d, "xin", DON)), "khong dot thi khong ghi don");
		khoa.tra();
		assert.ok(!existsSync(join(d, "khoa", "s4")));
	});

	test("(g) khong dot song, khoa tay da co -> bo-luot-khoa-ban goi ten chu", async () => {
		const d = dotGia("dot-chet-ban", PID_CHET);
		mkdirSync(join(d, "khoa", "s4"), { recursive: true });
		writeFileSync(
			join(d, "khoa", "s4", "chu.json"),
			JSON.stringify({ phien: "P2" }),
		);
		const kq = await layKhoa({
			goc: tam,
			cay: CAY,
			moc: null,
			timDot: () => d,
		});
		assert.deepEqual(kq, { ban: true, chu: "P2" });
		assert.ok(
			existsSync(join(d, "khoa", "s4", "chu.json")),
			"khong duoc xoa khoa cua phien khac",
		);
	});
});
