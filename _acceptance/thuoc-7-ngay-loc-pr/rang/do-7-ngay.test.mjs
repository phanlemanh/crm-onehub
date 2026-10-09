import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import {
	cuaSo,
	ganPr,
	ketLuan,
	LoiDo,
	tongHopCuaSo,
	tongHopLuot,
	trungVi,
	xepDung,
} from "../../ci-ma-tran-ba-o/rang/do-7-ngay.mjs";

const mau = (id) =>
	JSON.parse(readFileSync(join(import.meta.dirname, "mau", `luot-${id}.json`), "utf8"));

const DA_GOP = mau(37895940297);
const KHONG_PR = mau(37860355090);
const CHAY_LAI = mau(37841386976);
const BI_DE = mau(37877228894);
const MA_TRAN_XANH = mau(37909138411);

const jobDung = (m) => m.jobs.find((j) => j.conclusion === "cancelled");
const anCua = (m, j) => m.annotations[String(j.id)];

describe("ganPr", () => {
	test("luot cua PR da gop co pull_requests rong van vao mau qua commits/<sha>/pulls", () => {
		assert.equal(DA_GOP.run.pull_requests.length, 0);
		assert.equal(ganPr(DA_GOP.run, DA_GOP.pulls, "onehub"), "mau");
	});
	test("doi chung do: doc pull_requests cua luot thi luot PR da gop roi khoi mau", () => {
		const banSao = (run, _pulls, nhanh) =>
			run.pull_requests.some((p) => p.base.ref === nhanh) ? "mau" : "khong-gan";
		assert.equal(banSao(DA_GOP.run, DA_GOP.pulls, "onehub"), "khong-gan");
	});
	test("PR base khac -> base-khac", () => {
		assert.equal(ganPr(DA_GOP.run, DA_GOP.pulls, "release"), "base-khac");
	});
	test("khong PR nao (PR dong khong gop) -> khong-gan", () => {
		assert.deepEqual(KHONG_PR.pulls, []);
		assert.equal(ganPr(KHONG_PR.run, KHONG_PR.pulls, "onehub"), "khong-gan");
	});
	test("PR khac branch cua luot khong tinh", () => {
		const pulls = DA_GOP.pulls.map((p) => ({ ...p, head: { ...p.head, ref: "nhanh-khac" } }));
		assert.equal(ganPr(DA_GOP.run, pulls, "onehub"), "khong-gan");
	});
	test("hai PR cung branch, mot base onehub -> vao mau", () => {
		const pulls = [{ ...DA_GOP.pulls[0], base: { ref: "release" } }, DA_GOP.pulls[0]];
		assert.equal(ganPr(DA_GOP.run, pulls, "onehub"), "mau");
	});
});

describe("xepDung", () => {
	test("cau that «exceeded the maximum execution time» -> tran", () => {
		const j = jobDung(CHAY_LAI);
		assert.equal(xepDung(j, anCua(CHAY_LAI, j)), "tran");
	});
	test("cau that «higher priority waiting request» -> de", () => {
		const j = jobDung(BI_DE);
		assert.equal(xepDung(j, anCua(BI_DE, j)), "de");
	});
	test("«The run was canceled by @…» -> tay", () => {
		const j = jobDung(BI_DE);
		assert.equal(
			xepDung(j, [{ message: "The run was canceled by @phanlemanh." }, { message: "The operation was canceled." }]),
			"tay",
		);
	});
	test("job chua bat dau (started_at null) -> chua-chay", () => {
		const j = { ...jobDung(BI_DE), started_at: null };
		assert.equal(xepDung(j, []), "chua-chay");
	});
	test("job da chay chi co «The operation was canceled.» -> LoiDo goi ten job", () => {
		const j = jobDung(BI_DE);
		assert.throws(
			() => xepDung(j, [{ message: "The operation was canceled." }]),
			(e) => e instanceof LoiDo && e.message.includes("khong xep duoc") && e.message.includes(j.name),
		);
	});
	test("job da chay khong annotation -> LoiDo", () => {
		assert.throws(() => xepDung(jobDung(BI_DE), []), LoiDo);
	});
	test("doi chung do: xep theo thoi luong >= tran - 1 phut coi job bi de 16 phut la khong tran nhung job de 30 phut la tran", () => {
		const theoThoiLuong = (j) =>
			(Date.parse(j.completed_at) - Date.parse(j.started_at)) / 60000 >= 29 ? "tran" : "de";
		const j = { ...jobDung(BI_DE), started_at: "2026-10-09T03:00:00Z", completed_at: "2026-10-09T03:30:00Z" };
		assert.equal(theoThoiLuong(j), "tran");
		assert.equal(xepDung(j, anCua(BI_DE, jobDung(BI_DE))), "de");
	});
});

describe("tongHopLuot", () => {
	test("luot chay lai: dung vi tran o attempt 1 van dem, dai nhat chi tinh attempt cuoi", () => {
		const t = tongHopLuot(CHAY_LAI.run, CHAY_LAI.jobs, (j) => xepDung(j, anCua(CHAY_LAI, j)));
		assert.equal(CHAY_LAI.run.run_attempt, 2);
		assert.equal(t.dung.tran, 1);
		assert.equal(t.maTran, false);
		assert.equal(t.xanh, false);
		const cuoi = CHAY_LAI.jobs.filter((j) => j.run_attempt === 2);
		const mong = Math.max(...cuoi.map((j) => (Date.parse(j.completed_at) - Date.parse(j.started_at)) / 60000));
		assert.equal(t.daiNhatPhut, mong);
	});
	test("doi chung do: bo loc attempt (jobs mac dinh chi lan cuoi) thi dem 0 tran", () => {
		const chiLanCuoi = CHAY_LAI.jobs.filter((j) => j.run_attempt === CHAY_LAI.run.run_attempt);
		const t = tongHopLuot(CHAY_LAI.run, chiLanCuoi, (j) => xepDung(j, anCua(CHAY_LAI, j)));
		assert.equal(t.dung.tran, 0);
	});
	test("luot hinh ma tran xanh: ci-ok success, dai nhat 10,25 phut", () => {
		const t = tongHopLuot(MA_TRAN_XANH.run, MA_TRAN_XANH.jobs, () => assert.fail("khong job dung"));
		assert.equal(t.maTran, true);
		assert.equal(t.xanh, true);
		assert.equal(t.daiNhatPhut, 10.25);
	});
	test("ci-ok that bai -> khong xanh", () => {
		const jobs = MA_TRAN_XANH.jobs.map((j) => (j.name === "ci-ok" ? { ...j, conclusion: "failure" } : j));
		assert.equal(tongHopLuot(MA_TRAN_XANH.run, jobs, () => "de").xanh, false);
	});
	test("luot dang chay -> dangChay, khong xanh", () => {
		const run = { ...MA_TRAN_XANH.run, status: "in_progress", conclusion: null };
		const jobs = MA_TRAN_XANH.jobs.map((j) => (j.name === "ci-ok" ? { ...j, conclusion: null, completed_at: null, status: "queued" } : j));
		const t = tongHopLuot(run, jobs, () => "de");
		assert.equal(t.dangChay, true);
		assert.equal(t.xanh, false);
	});
	test("luot dang chay chua co job ci-ok -> khong xep vao hinh nao (maTran null)", () => {
		const run = { ...MA_TRAN_XANH.run, status: "in_progress", conclusion: null };
		const jobs = MA_TRAN_XANH.jobs.filter((j) => j.name !== "ci-ok");
		assert.equal(tongHopLuot(run, jobs, () => "de").maTran, null);
		assert.equal(tongHopLuot(MA_TRAN_XANH.run, jobs, () => "de").maTran, false);
	});
	test("job thieu completed_at bi bo khoi max, khong nem", () => {
		const jobs = MA_TRAN_XANH.jobs.map((j) => (j.name === "test (app-ui)" ? { ...j, completed_at: null } : j));
		const t = tongHopLuot(MA_TRAN_XANH.run, jobs, () => "de");
		const mong = Math.max(
			...jobs.filter((j) => j.completed_at).map((j) => (Date.parse(j.completed_at) - Date.parse(j.started_at)) / 60000),
		);
		assert.ok(mong < 10.25);
		assert.equal(t.daiNhatPhut, mong);
	});
});

describe("trungVi", () => {
	test("so le", () => assert.equal(trungVi([3, 1, 2]), 2));
	test("so chan lay trung binh hai gia tri giua: 14 va 16,5 -> 15,25", () => {
		assert.equal(trungVi([10, 11, 12, 13, 14, 16.5, 17, 18, 19, 20]), 15.25);
	});
	test("rong -> null", () => assert.equal(trungVi([]), null));
});

describe("ketLuan — ma tran bien viet truoc", () => {
	const MUOI = (v) => Array.from({ length: 10 }, () => v);
	const CHIN = (v) => Array.from({ length: 9 }, () => v);
	const O = [
		["10 xanh, 15, 0 tran, dong", MUOI(15), 0, true, "SONG", 0],
		["10 xanh, 15.01, 0 tran, dong", MUOI(15.01), 0, true, "giua", 0],
		["10 xanh, 20, 0 tran, dong", MUOI(20), 0, true, "giua", 0],
		["10 xanh, 20.01, 0 tran, dong", MUOI(20.01), 0, true, "CHET", 0],
		["10 xanh, 15, 1 tran, dong", MUOI(15), 1, true, "CHET", 0],
		["10 xanh, 20, 1 tran, dong", MUOI(20), 1, true, "CHET", 0],
		["9 xanh, 15, 0 tran, dong", CHIN(15), 0, true, "chua", 3],
		["9 xanh, 20.01, 1 tran, dong", CHIN(20.01), 1, true, "chua", 3],
		["10 xanh, 15, 0 tran, chua dong", MUOI(15), 0, false, "chua", 3],
		["10 xanh, 20.01, 1 tran, chua dong", MUOI(20.01), 1, false, "chua", 3],
	];
	for (const [ten, xanh, tran, dong, nhan, ma] of O) {
		test(ten, () => {
			const k = ketLuan({ xanh, tran, dong });
			assert.equal(k.nhan, nhan);
			assert.equal(k.ma, ma);
		});
	}
	test("so assert = so o", () => assert.equal(O.length, 10));
	test("trung vi chi tren luot xanh: 10 xanh 10 phut + 11 luot dung 30 phut -> 10, SONG", () => {
		const xanh = MUOI(10);
		assert.equal(ketLuan({ xanh, tran: 0, dong: true }).trungVi, 10);
		assert.equal(ketLuan({ xanh, tran: 0, dong: true }).nhan, "SONG");
		const moiLuot = [...xanh, ...Array.from({ length: 11 }, () => 30)];
		assert.equal(trungVi(moiLuot), 30, "trung vi lan luot khong xanh");
		assert.equal(ketLuan({ xanh: moiLuot, tran: 0, dong: true }).nhan, "CHET", "trung vi lan luot khong xanh");
	});
	test("so luot chan 14/16,5 -> giua hai nguong", () => {
		const k = ketLuan({ xanh: [10, 11, 12, 13, 14, 16.5, 17, 18, 19, 20], tran: 0, dong: true });
		assert.equal(k.trungVi, 15.25);
		assert.equal(k.nhan, "giua");
	});
});

describe("cuaSo", () => {
	const BAY_GIO = Date.parse("2026-10-10T00:00:00Z");
	test("moc gop +07:00 -> UTC, dai 7 ngay, chua dong", () => {
		const c = cuaSo({ mocGop: "2026-10-09T12:42:52+07:00", bayGio: BAY_GIO });
		assert.equal(c.tu, "2026-10-09T05:42:52Z");
		assert.equal(c.den, "2026-10-16T05:42:52Z");
		assert.equal(c.dong, false);
	});
	test("--tu/--den ghi de, den qua -> dong", () => {
		const c = cuaSo({ tu: "2026-10-08T16:00:00Z", den: "2026-10-09T04:00:00Z", mocGop: "2026-10-09T12:42:52+07:00", bayGio: BAY_GIO });
		assert.equal(c.tu, "2026-10-08T16:00:00Z");
		assert.equal(c.den, "2026-10-09T04:00:00Z");
		assert.equal(c.dong, true);
	});
	test("chi --tu -> den = tu + 7 ngay", () => {
		assert.equal(cuaSo({ tu: "2026-10-01T00:00:00Z", bayGio: BAY_GIO }).den, "2026-10-08T00:00:00Z");
	});
	test("ngay hong -> LoiDo", () => {
		assert.throws(() => cuaSo({ tu: "hom qua", bayGio: BAY_GIO }), LoiDo);
	});
});

describe("tongHopCuaSo", () => {
	const luot = (xanh, phut, dung = {}) => ({
		xanh,
		maTran: true,
		dangChay: false,
		daiNhatPhut: phut,
		dung: { tran: 0, de: 0, tay: 0, "chua-chay": 0, ...dung },
	});
	test("trung vi chi lay luot xanh: 10 xanh 10 phut + 11 luot khong xanh 30 phut -> 10, SONG", () => {
		const mau = [...Array.from({ length: 10 }, () => luot(true, 10)), ...Array.from({ length: 11 }, () => luot(false, 30, { de: 1 }))];
		const t = tongHopCuaSo(mau, true);
		assert.equal(t.kl.trungVi, 10, "trung vi lan luot khong xanh");
		assert.equal(t.kl.nhan, "SONG");
		assert.equal(t.dung.de, 11);
	});
	test("dung vi tran cong tu moi luot -> CHET du trung vi thap", () => {
		const mau = [...Array.from({ length: 10 }, () => luot(true, 10)), luot(false, 30, { tran: 1 })];
		assert.equal(tongHopCuaSo(mau, true).kl.nhan, "CHET");
	});
});
