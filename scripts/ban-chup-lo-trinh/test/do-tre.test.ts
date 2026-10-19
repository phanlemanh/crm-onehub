import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
	CO,
	docGhiChuTuGh,
	docJobsTuGh,
	docLuotTuGh,
	ganKetQuaLuot,
	type Luot,
	tinhDoTre,
} from "../do-tre.ts";

const MAU = path.join(import.meta.dir, "mau");
const mau = (ten: string): string => readFileSync(path.join(MAU, ten), "utf8");

const PHUT = 60_000;
const NHIP = 60_000;
const T0 = Date.parse("2026-10-14T05:00:00Z");
const iso = (ms: number) => new Date(ms).toISOString();
const SHA = {
	a: "a".repeat(40),
	b: "b".repeat(40),
	c: "c".repeat(40),
} as const;

let soLuot = 0;

function luotMau(o: {
	sha: string;
	headCommitLuc: number;
	conclusion: string;
	xongSau: number;
	ketQua: string | null;
}): Luot {
	soLuot += 1;
	const [run] = JSON.parse(mau("gh-run-list.json"));
	const jobs = JSON.parse(mau("gh-run-view-jobs.json"));
	const [chuThich] = JSON.parse(mau("gh-annotations.json"));
	const runJson = JSON.stringify([
		{
			...run,
			databaseId: soLuot,
			headSha: o.sha,
			conclusion: o.conclusion,
			updatedAt: iso(o.headCommitLuc + o.xongSau),
		},
	]);
	const [luot] = ganKetQuaLuot(docLuotTuGh(runJson), {
		jobsCua: () => JSON.stringify(jobs),
		chuThichCua: (jobId) =>
			jobId === jobs.jobs[0].databaseId && o.ketQua !== null
				? JSON.stringify([
						{
							...chuThich,
							annotation_level: "notice",
							title: "ban-chup-lo-trinh",
							message: o.ketQua,
						},
					])
				: JSON.stringify([chuThich]),
		commitLucCua: (sha) => (sha === o.sha ? iso(o.headCommitLuc) : ""),
	});
	if (!luot) throw new Error("mau gh-run-list.json rong");
	return luot;
}

describe("khuon-gh", () => {
	test("doc job tu mau that cua gh run view --json jobs", () => {
		expect(docJobsTuGh(mau("gh-run-view-jobs.json")).length).toBeGreaterThan(0);
	});

	test("doc luot va ghi chu tu dung khuon JSON that cua gh", () => {
		const [luot] = docLuotTuGh(mau("gh-run-list.json"));
		expect(luot?.headSha).toMatch(/^[0-9a-f]{40}$/);
		expect(luot?.conclusion).toBe("success");
		const chuThich = JSON.parse(mau("gh-annotations.json"));
		expect(docGhiChuTuGh(JSON.stringify(chuThich))).toBeNull();
		const voiGhiChu = [
			{
				...chuThich[0],
				annotation_level: "notice",
				title: "ban-chup-lo-trinh",
				message: "nhan",
			},
		];
		expect(docGhiChuTuGh(JSON.stringify(voiGhiChu))).toBe("nhan");
	});
});

describe("do-tre", () => {
	test("a tre 3 phut: dat", () => {
		const kq = tinhDoTre({
			doi: [{ sha: SHA.a, commitLuc: iso(T0) }],
			luot: [
				luotMau({
					sha: SHA.a,
					headCommitLuc: T0,
					conclusion: "success",
					xongSau: 3 * PHUT,
					ketQua: "nhan",
				}),
			],
			nhipMs: NHIP,
		});
		expect(kq.dong[0]?.co).toEqual([]);
		expect(kq.dong[0]?.treMs).toBe(3 * PHUT + NHIP);
		expect(kq.ketLuan).toBe("đạt");
	});

	test("b tre 12 phut: co > 10 phut, ket luan khong dat", () => {
		const kq = tinhDoTre({
			doi: [
				{ sha: SHA.a, commitLuc: iso(T0) },
				{ sha: SHA.b, commitLuc: iso(T0 + 60 * PHUT) },
			],
			luot: [
				luotMau({
					sha: SHA.a,
					headCommitLuc: T0,
					conclusion: "success",
					xongSau: 3 * PHUT,
					ketQua: "nhan",
				}),
				luotMau({
					sha: SHA.b,
					headCommitLuc: T0 + 60 * PHUT,
					conclusion: "success",
					xongSau: 12 * PHUT,
					ketQua: "nhan",
				}),
			],
			nhipMs: NHIP,
		});
		expect(kq.dong[1]?.co).toEqual([CO.quaMuoiPhut]);
		expect(kq.ketLuan).toBe("không đạt");
	});

	test("c luot do roi luot xanh sau 70 phut: co > 1 gio", () => {
		const kq = tinhDoTre({
			doi: [{ sha: SHA.a, commitLuc: iso(T0) }],
			luot: [
				luotMau({
					sha: SHA.a,
					headCommitLuc: T0,
					conclusion: "failure",
					xongSau: 5 * PHUT,
					ketQua: null,
				}),
				luotMau({
					sha: SHA.a,
					headCommitLuc: T0,
					conclusion: "success",
					xongSau: 70 * PHUT,
					ketQua: "nhan",
				}),
			],
			nhipMs: NHIP,
		});
		expect(kq.dong[0]?.co).toContain(CO.quaMotGio);
		expect(kq.dong[0]?.co).toContain(CO.quaMuoiPhut);
	});

	test("d khong co luot nao: > 1 gio va khong co luot day", () => {
		const kq = tinhDoTre({
			doi: [{ sha: SHA.a, commitLuc: iso(T0) }],
			luot: [],
			nhipMs: NHIP,
		});
		expect(kq.dong[0]?.co).toEqual([CO.quaMotGio, CO.khongCoLuot]);
		expect(kq.dong[0]?.xongLuc).toBeNull();
	});

	test("e luot xanh nhung chua-cai: khong tinh la da day", () => {
		const kq = tinhDoTre({
			doi: [{ sha: SHA.a, commitLuc: iso(T0) }],
			luot: [
				luotMau({
					sha: SHA.a,
					headCommitLuc: T0,
					conclusion: "success",
					xongSau: 2 * PHUT,
					ketQua: "chua-cai",
				}),
			],
			nhipMs: NHIP,
		});
		expect(`luot chua cai: ${kq.dong[0]?.co.join(",")}`).toBe(
			`luot chua cai: ${[CO.quaMotGio, CO.khongCoLuot].join(",")}`,
		);
	});

	test("f luot B bi huy, luot C moi hon phu B", () => {
		const doi = [
			{ sha: SHA.b, commitLuc: iso(T0) },
			{ sha: SHA.c, commitLuc: iso(T0 + PHUT) },
		];
		const huyB = luotMau({
			sha: SHA.b,
			headCommitLuc: T0,
			conclusion: "cancelled",
			xongSau: 30_000,
			ketQua: null,
		});
		const phu = tinhDoTre({
			doi,
			luot: [
				huyB,
				luotMau({
					sha: SHA.c,
					headCommitLuc: T0 + PHUT,
					conclusion: "success",
					xongSau: 3 * PHUT,
					ketQua: "nhan",
				}),
			],
			nhipMs: NHIP,
		});
		expect(`luot bi thay cho: ${phu.dong[0]?.co.join(",") || "khong co"}`).toBe(
			"luot bi thay cho: khong co",
		);
		expect(phu.dong[0]?.treMs).toBe(PHUT + 3 * PHUT + NHIP);
		const khongPhu = tinhDoTre({
			doi,
			luot: [
				huyB,
				luotMau({
					sha: SHA.c,
					headCommitLuc: T0 + PHUT,
					conclusion: "failure",
					xongSau: 3 * PHUT,
					ketQua: null,
				}),
			],
			nhipMs: NHIP,
		});
		expect(khongPhu.dong[0]?.co).toContain(CO.khongCoLuot);
	});
});
