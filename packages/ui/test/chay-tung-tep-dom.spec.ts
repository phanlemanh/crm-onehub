import { afterEach, describe, expect, test } from "bun:test";
import { spawn, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CHAY_DOM } from "./chay-dom-config";

const DO = {
	tranMs: 1_500,
	bienMs: 8_000,
	dongHoMs: 30_000,
	caMs: 45_000,
	treoMs: 60_000,
	nguMs: 300,
	choNhomMs: 2_000,
	nhipMs: 100,
} as const;

const TRINH_CHAY = join(import.meta.dir, "chay-tung-tep-dom.ts");
const TEP_DAU = "c.dau";

const MAU = {
	xanh: 'import { expect, test } from "bun:test";\ntest("xanh", () => { expect(1).toBe(1); });\n',
	treo: `import { test } from "bun:test";\ntest("treo", () => { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ${DO.treoMs}); });\n`,
	ngu: `import { expect, test } from "bun:test";\nawait Bun.sleep(${DO.nguMs});\ntest("ngu", () => { expect(1).toBe(1); });\n`,
	do: 'import { expect, test } from "bun:test";\ntest("do", () => { expect(1).toBe(2); });\n',
	dau: `import { expect, test } from "bun:test";\nimport { writeFileSync } from "node:fs";\nwriteFileSync(${JSON.stringify(TEP_DAU)}, "chay");\ntest("dau", () => { expect(1).toBe(1); });\n`,
} as const;

type KetQua = {
	ma: number | null;
	out: string;
	err: string;
	ms: number;
	biCat: boolean;
	nhomConSong: boolean;
};

const thuMucTam: string[] = [];

afterEach(() => {
	for (const goc of thuMucTam.splice(0))
		rmSync(goc, { recursive: true, force: true });
});

function dung(tep: Record<string, string>): string {
	const goc = mkdtempSync(join(tmpdir(), "chay-dom-"));
	thuMucTam.push(goc);
	mkdirSync(join(goc, CHAY_DOM.tep.thuMuc));
	for (const [ten, noiDung] of Object.entries(tep)) {
		writeFileSync(join(goc, CHAY_DOM.tep.thuMuc, ten), noiDung);
	}
	return goc;
}

function nhomConSong(pid: number): boolean {
	try {
		process.kill(-pid, 0);
		return true;
	} catch {
		return false;
	}
}

async function choNhomTat(pid: number): Promise<boolean> {
	const han = performance.now() + DO.choNhomMs;
	while (performance.now() < han) {
		if (!nhomConSong(pid)) return false;
		await Bun.sleep(DO.nhipMs);
	}
	return nhomConSong(pid);
}

async function chay(goc: string): Promise<KetQua> {
	const ma = `import { chayTungTep } from ${JSON.stringify(TRINH_CHAY)};
process.exit(chayTungTep({ goc: process.cwd(), co: [], tranMs: ${DO.tranMs}, ghi: console.log, loi: console.error }));`;
	const truoc = performance.now();
	const con = spawn("bun", ["-e", ma], {
		cwd: goc,
		detached: true,
		stdio: ["ignore", "pipe", "pipe"],
	});
	const pid = con.pid ?? 0;
	let out = "";
	let err = "";
	let biCat = false;
	con.stdout.on("data", (d) => {
		out += d;
	});
	con.stderr.on("data", (d) => {
		err += d;
	});
	const dongHo = setTimeout(() => {
		biCat = true;
		process.kill(-pid, "SIGKILL");
	}, DO.dongHoMs);
	const maThoat = await new Promise<number | null>((xong) =>
		con.on("close", (m) => xong(m)),
	);
	clearTimeout(dongHo);
	const ms = performance.now() - truoc;
	return {
		ma: maThoat,
		out,
		err,
		ms,
		biCat,
		nhomConSong: await choNhomTat(pid),
	};
}

function dongXanh(out: string): { ten: string; giay: number }[] {
	return [...out.matchAll(/^chay-dom: test\/(.+) xanh sau (\d+\.\d) s$/gm)].map(
		(m) => ({ ten: m[1] ?? "", giay: Number(m[2]) }),
	);
}

function chamNhat(out: string): { ten: string; giay: number }[] {
	const dong = out.match(/^chay-dom: chậm nhất — (.+)$/m)?.[1] ?? "";
	return dong.split(" · ").map((muc) => {
		const m = muc.match(/^test\/(.+) (\d+\.\d) s$/);
		return { ten: m?.[1] ?? muc, giay: Number(m?.[2]) };
	});
}

function khongBiCat(kq: KetQua): void {
	if (kq.biCat) throw new Error("trình chạy không tự dừng");
}

describe("qua-gio", () => {
	test(
		"qua-gio: tệp treo bị cắt, gọi tên, mã quá giờ của cấu hình, tệp sau không chạy",
		async () => {
			const goc = dung({
				"a-xanh.dom.tsx": MAU.xanh,
				"b-treo.dom.tsx": MAU.treo,
				"c-xanh.dom.tsx": MAU.dau,
			});
			const kq = await chay(goc);
			khongBiCat(kq);
			expect(kq.ma).toBe(CHAY_DOM.tep.maQuaGio);
			expect(kq.err).toContain(
				"chay-dom: test/b-treo.dom.tsx quá 1.5 s — đã cắt tiến trình",
			);
			expect(dongXanh(kq.out).map((d) => d.ten)).toEqual(["a-xanh.dom.tsx"]);
			expect(existsSync(join(goc, TEP_DAU))).toBe(false);
			expect(kq.ms).toBeLessThan(DO.tranMs + DO.bienMs);
			expect(kq.nhomConSong).toBe(false);
		},
		DO.caMs,
	);

	test(
		"qua-gio: đối chứng — bỏ tệp treo thì thoát 0 và tệp sau có chạy",
		async () => {
			const goc = dung({
				"a-xanh.dom.tsx": MAU.xanh,
				"c-xanh.dom.tsx": MAU.dau,
			});
			const kq = await chay(goc);
			khongBiCat(kq);
			expect(kq.ma).toBe(0);
			expect(dongXanh(kq.out).map((d) => d.ten)).toEqual([
				"a-xanh.dom.tsx",
				"c-xanh.dom.tsx",
			]);
			expect(existsSync(join(goc, TEP_DAU))).toBe(true);
		},
		DO.caMs,
	);
});

describe("thoi-luong", () => {
	test(
		"thoi-luong: mỗi tệp một dòng theo thứ tự, tệp ngủ đủ giờ, dòng tổng và chậm nhất",
		async () => {
			const goc = dung({
				"a-xanh.dom.tsx": MAU.xanh,
				"b-ngu.dom.tsx": MAU.ngu,
				"c-xanh.dom.tsx": MAU.xanh,
			});
			const kq = await chay(goc);
			khongBiCat(kq);
			expect(kq.ma).toBe(0);
			const xanh = dongXanh(kq.out);
			expect(xanh.map((d) => d.ten)).toEqual([
				"a-xanh.dom.tsx",
				"b-ngu.dom.tsx",
				"c-xanh.dom.tsx",
			]);
			const ngu = xanh.find((d) => d.ten === "b-ngu.dom.tsx");
			expect(ngu?.giay ?? 0).toBeGreaterThanOrEqual(
				DO.nguMs / CHAY_DOM.hienThi.msMoiGiay,
			);
			expect(kq.out).toMatch(
				/^chay-dom: 3 tệp xanh sau \d+\.\d s \(giới hạn mỗi tệp 1\.5 s\)$/m,
			);
			const cham = chamNhat(kq.out);
			expect(cham).toHaveLength(
				Math.min(CHAY_DOM.tongKet.soTepChamNhat, xanh.length),
			);
			expect(cham[0]?.ten).toBe("b-ngu.dom.tsx");
			expect(cham.map((d) => d.giay)).toEqual(
				[...cham.map((d) => d.giay)].sort((a, b) => b - a),
			);
			expect(new Set(cham.map((d) => d.ten))).toEqual(
				new Set(xanh.map((d) => d.ten)),
			);
		},
		DO.caMs,
	);
});

describe("tep-do", () => {
	test(
		"tep-do: thoát bằng mã của bun test, gọi tên kèm mã và thời lượng, tệp sau không chạy",
		async () => {
			const goc = dung({
				"a-xanh.dom.tsx": MAU.xanh,
				"b-do.dom.tsx": MAU.do,
				"c-xanh.dom.tsx": MAU.dau,
			});
			const rieng = spawnSync("bun", ["test", "./test/b-do.dom.tsx"], {
				cwd: goc,
			});
			const kq = await chay(goc);
			khongBiCat(kq);
			expect(rieng.status).not.toBe(0);
			expect(kq.ma).toBe(rieng.status);
			expect(kq.err).toMatch(
				/chay-dom: test\/b-do\.dom\.tsx đỏ \(mã \d+\) sau \d+\.\d s/,
			);
			expect(existsSync(join(goc, TEP_DAU))).toBe(false);
		},
		DO.caMs,
	);
});
