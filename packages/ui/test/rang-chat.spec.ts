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
	ho_so: string;
	runsIn: string;
	runner: string;
	dir: string;
	checks: Khai[];
	notInGate: KhaiNgoai[];
};

function docKhoiRang(): KhoiRang[] {
	const hinh = JSON.parse(readFileSync(HINH_DANG, "utf8")) as {
		checkers?: { id?: string; rang?: KhoiRang | KhoiRang[] }[];
	};
	const cong = (hinh.checkers ?? []).find((c) => c.id === "test");
	if (!cong?.rang) {
		throw new Error(
			`.githooks/gate-shape.json không khai khối "rang" trong checker 'test'. AC-9 và AC-10 đòi răng phải có khai ở đó; không khai thì không ai biết răng nào đang chặn.`,
		);
	}
	const danh = Array.isArray(cong.rang) ? cong.rang : [cong.rang];
	if (danh.length === 0) {
		throw new Error(
			`.githooks/gate-shape.json khai "rang" là danh sách RỖNG. Một danh sách rỗng đi qua mọi vòng lặp dưới đây mà không chạy răng nào, nên nó trông y hệt một cổng đang chặn.`,
		);
	}
	return danh;
}

const cacKhoi = docKhoiRang();

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

for (const khoi of cacKhoi) {
	describe(`răng ${khoi.ho_so} — khai ở gate-shape.json`, () => {
		test("khối rang khai đúng chỗ nó chạy", () => {
			expect(khoi.ho_so.trim().length).toBeGreaterThan(0);
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
			if (chuaKhai.length > 0) {
				throw new Error(
					`hồ sơ ${khoi.ho_so}: ${chuaKhai.length} tệp trong ${khoi.dir} chưa có định đoạt — ${chuaKhai.join(", ")}. Khai nó vào checks (chạy ở cổng) hoặc notInGate (kèm lý do và nơi nó được đo).`,
				);
			}
			expect(chuaKhai).toEqual([]);
		});

		test("mỗi răng khai đều có tệp thật và có lý do đọc được", () => {
			for (const k of [...khoi.checks, ...khoi.notInGate]) {
				if (!existsSync(duongRang(k.script))) {
					throw new Error(
						`hồ sơ ${khoi.ho_so}: khai răng ${k.id} nhưng ${k.script} không có trên cây.`,
					);
				}
				expect(k.vi_sao.trim().length).toBeGreaterThan(0);
			}
		});

		test("răng đứng ngoài cổng phải nói ra nó được đo ở đâu", () => {
			for (const k of khoi.notInGate) {
				expect(k.do_o.trim().length).toBeGreaterThan(0);
			}
		});
	});

	describe(`răng ${khoi.ho_so} — chạy trong cổng`, () => {
		for (const k of khoi.checks) {
			test(`${k.id} xanh trên cây này`, () => {
				const ket = chay(k.script);
				if (ket.ma !== 0) {
					throw new Error(
						`hồ sơ ${khoi.ho_so}: răng ${k.id} đỏ, mã thoát ${ket.ma}.\n${k.script} — ${k.vi_sao}\n\n${ket.ra}\n`,
					);
				}
				expect(ket.ma).toBe(0);
			});
		}
	});
}
