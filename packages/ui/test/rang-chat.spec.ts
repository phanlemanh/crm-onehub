import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const GOC_KHO = resolve(import.meta.dir, "..", "..", "..");
const HINH_DANG = join(GOC_KHO, ".githooks", "gate-shape.json");
const CHAY_TRONG = "@crm/ui#test";

type Khai = {
	id: string;
	script: string;
	vi_sao: string;
};

type KhaiNgoai = Khai & { do_o: string };

type KetChay = {
	ma: number;
	ra: string;
};

type KhoiRang = {
	runsIn: string;
	runner: string;
	dir: string;
	checks: Khai[];
	notInGate: KhaiNgoai[];
};

function docKhoiRang(): KhoiRang {
	const hinh = JSON.parse(readFileSync(HINH_DANG, "utf8")) as {
		checkers?: { id?: string; rang?: KhoiRang }[];
	};
	const cong = (hinh.checkers ?? []).find((c) => c.id === "test");
	if (!cong?.rang) {
		throw new Error(
			`.githooks/gate-shape.json không khai khối "rang" trong checker 'test'. AC-9 và AC-10 đòi răng phải có khai ở đó; không khai thì không ai biết răng nào đang chặn.`,
		);
	}
	return cong.rang;
}

const khoi = docKhoiRang();

function duongRang(script: string): string {
	return join(GOC_KHO, script);
}

function chay(script: string): KetChay {
	const ket = spawnSync("node", [duongRang(script)], {
		cwd: GOC_KHO,
		encoding: "utf8",
	});
	if (ket.error) {
		throw new Error(`không chạy được ${script}: ${ket.error.message}`);
	}
	const ma = ket.status ?? 1;
	const ra = `${ket.stdout ?? ""}${ket.stderr ?? ""}`.trimEnd();
	return { ma, ra } satisfies KetChay;
}

describe("răng nền chat — khai ở gate-shape.json", () => {
	test("khối rang khai đúng chỗ nó chạy", () => {
		expect(khoi.runsIn).toBe(CHAY_TRONG);
		expect(khoi.runner).toBe("packages/ui/test/rang-chat.spec.ts");
		expect(existsSync(join(GOC_KHO, khoi.runner))).toBe(true);
		expect(khoi.checks.length).toBeGreaterThan(0);
	});

	test("mọi răng trong thư mục hồ sơ đều có định đoạt", () => {
		const trongThuMuc = readdirSync(join(GOC_KHO, khoi.dir))
			.filter((ten) => ten.endsWith(".mjs"))
			.sort();
		const daKhai = new Set(
			[...khoi.checks, ...khoi.notInGate].map((k) => `${k.id}.mjs`),
		);
		const chuaKhai = trongThuMuc.filter((ten) => !daKhai.has(ten));
		expect(chuaKhai).toEqual([]);
	});

	test("mỗi răng khai đều có tệp thật và có lý do đọc được", () => {
		for (const k of [...khoi.checks, ...khoi.notInGate]) {
			expect(existsSync(duongRang(k.script))).toBe(true);
			expect(k.vi_sao.trim().length).toBeGreaterThan(0);
		}
	});

	test("răng đứng ngoài cổng phải nói ra nó được đo ở đâu", () => {
		for (const k of khoi.notInGate) {
			expect(k.do_o.trim().length).toBeGreaterThan(0);
		}
	});
});

describe("răng nền chat — chạy trong cổng", () => {
	for (const k of khoi.checks) {
		test(`${k.id} xanh trên cây này`, () => {
			const ket = chay(k.script);
			if (ket.ma !== 0) {
				throw new Error(
					`răng ${k.id} đỏ, mã thoát ${ket.ma}.\n${k.script} — ${k.vi_sao}\n\n${ket.ra}\n`,
				);
			}
			expect(ket.ma).toBe(0);
		});
	}
});
