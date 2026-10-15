import { describe, test } from "bun:test";
import { spawnSync } from "node:child_process";
import {
	chmodSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { measureDatabaseName } from "../../../packages/db/src/measure-database.ts";
import { hongHet, laHongHet } from "../../tro-ly-okr-de-xuat/rang/do-tre.mjs";
import {
	chanSoDu,
	soDuGateway,
} from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";

const GOC = resolve(import.meta.dir, "../../..");
const SHA_TRUOC_VONG = "38300b3c818662207cb640052f9f2f9de746a9f6";
const TEP_PHIEN = "_acceptance/tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
const MAU = join(import.meta.dir, "mau");
const CREDITS_THAT = readFileSync(join(MAU, "credits-that.json"), "utf8");
const NHAT_KY_KHOA_SAI = join(MAU, "tac-tu-khoa-sai.log");
const ENV = { AI_GATEWAY_API_KEY: "khoa-thu" };

function hong(dieuKien: boolean, thongDiep: string) {
	if (dieuKien) throw new Error(thongDiep);
}

function fetchVoiThan(than: string, status = 200) {
	return (async () =>
		new Response(than, { status })) as unknown as typeof fetch;
}

function thanVoiSoDu(so: string) {
	return JSON.stringify({ ...JSON.parse(CREDITS_THAT), balance: so });
}

async function voiCanhBao<T>(viec: () => Promise<T>) {
	const dong: string[] = [];
	const goc = console.error;
	console.error = (...a: unknown[]) => dong.push(a.join(" "));
	try {
		return { ket: await viec(), dong };
	} finally {
		console.error = goc;
	}
}

describe("tlk-so-du", () => {
	test("phan hoi that cua /v1/credits doc ra dung mot so", async () => {
		const ket = await soDuGateway(ENV, fetchVoiThan(CREDITS_THAT));
		hong(
			!("soDu" in ket) || ket.soDu !== Number(JSON.parse(CREDITS_THAT).balance),
			"tlk: khong doc duoc phan hoi that",
		);
	});

	test("so du am hay bang 0 thi chan, so du duong thi qua", async () => {
		const MA_TRAN = [
			{ so: "-0.00986931", chan: true },
			{ so: "0", chan: true },
			{ so: "0.01", chan: false },
			{ so: "49.99", chan: false },
		];
		for (const o of MA_TRAN) {
			const ket = await chanSoDu(ENV, fetchVoiThan(thanVoiSoDu(o.so)));
			hong(
				o.chan && !ket?.includes(`so du AI Gateway ${Number(o.so)} USD`),
				`tlk: so du ${o.so} khong bi chan`,
			);
			hong(!o.chan && ket !== null, `tlk: so du ${o.so} bi chan oan`);
		}
	});

	test("khong doc duoc so du thi canh bao dung cau, khong chan; thieu khoa thi khong goi mang", async () => {
		for (const [than, status, ly] of [
			["", 401, "HTTP 401"],
			[thanVoiSoDu("khong-phai-so"), 200, "balance khong phai so"],
		] as const) {
			const { ket, dong } = await voiCanhBao(() =>
				chanSoDu(ENV, fetchVoiThan(than, status)),
			);
			hong(ket !== null, `tlk: ${ly} bi chan`);
			hong(
				!dong.includes(`khong doc duoc so du AI Gateway (${ly}) — van do`),
				`tlk: canh bao ${ly} sai cau`,
			);
		}
		let goi = 0;
		const dem = (async () => {
			goi += 1;
			return new Response(CREDITS_THAT);
		}) as unknown as typeof fetch;
		const ket = await soDuGateway({}, dem);
		hong(!("khongDoc" in ket) || goi !== 0, "tlk: thieu khoa van goi mang");
	});
});

describe("tlk-hong-het", () => {
	test("chi chan khi moi luot hong", () => {
		const luot = (soHong: number, tong: number) =>
			Array.from({ length: tong }, (_, i) => ({ hong: i < soHong }));
		const MA_TRAN = [
			{ ten: "20/20 hong", so: luot(20, 20), chan: true },
			{ ten: "19/20 hong", so: luot(19, 20), chan: false },
			{ ten: "1/20 hong", so: luot(1, 20), chan: false },
			{ ten: "0/20 hong", so: luot(0, 20), chan: false },
			{ ten: "0 luot", so: [], chan: false },
		];
		for (const o of MA_TRAN)
			hong(laHongHet(o.so) !== o.chan, `tlk: hong het sai o ${o.ten}`);
	});

	test("hong het in so luot theo ket cuc va dong loi model nguyen van", () => {
		const so = [
			{ hong: true, outcome: "hong:turn-failed", lyDo: null },
			{ hong: true, outcome: "hong:turn-failed", lyDo: null },
			{ hong: true, outcome: null, lyDo: "qua 180 s chua dong" },
		];
		const cau = hongHet(so, NHAT_KY_KHOA_SAI);
		hong(!cau.startsWith("3/3 luot hong"), "tlk: hong het sai so luot");
		hong(
			!cau.includes("hong:turn-failed 2") ||
				!cau.includes("qua 180 s chua dong 1"),
			"tlk: hong het thieu ket cuc",
		);
		hong(
			!cau.includes("AI Gateway rejected the provided API key"),
			"tlk: hong het thieu dong loi model",
		);
		hong(
			!hongHet(so, NHAT_KY_KHOA_SAI, () => "khong co gi\n").includes(
				"khong co dong loi model",
			),
			"tlk: hong het bia dong loi",
		);
	});
});

describe("tlk-kho-theo-cay", () => {
	function bunGia(thuMuc: string) {
		const tep = join(thuMuc, "bun");
		writeFileSync(
			tep,
			'#!/bin/sh\nwhile [ "$1" != "--ten" ] && [ $# -gt 0 ]; do shift; done\necho "postgresql://gia@localhost:5432/ten=$2"\n',
		);
		chmodSync(tep, 0o755);
	}

	function tenKhoCuaCay(tepPhien: string, cay: string, thuMucGia: string) {
		const r = spawnSync(
			process.execPath,
			[
				"-e",
				`const m = await import(${JSON.stringify(tepPhien)}); console.log(m.taoKho("tdx-e22"));`,
			],
			{
				cwd: GOC,
				encoding: "utf8",
				env: {
					...process.env,
					PHIEN_DO_TEN_CAY: cay,
					PATH: `${thuMucGia}:${process.env.PATH}`,
				},
			},
		);
		const ten = r.stdout.trim().split("ten=").at(-1) ?? "";
		if (r.status !== 0 || !ten)
			throw new Error(`tlk: khong goi duoc taoKho (${r.stderr.slice(-300)})`);
		return measureDatabaseName(ten);
	}

	test("hai cay goi taoKho that ra hai kho khac nhau; ban truoc vong ra cung mot kho chung", () => {
		const thuMuc = mkdtempSync(join(tmpdir(), "tlk-kho-"));
		try {
			bunGia(thuMuc);
			const moiA = tenKhoCuaCay(join(GOC, TEP_PHIEN), "cay-a", thuMuc);
			const moiB = tenKhoCuaCay(join(GOC, TEP_PHIEN), "cay-b", thuMuc);
			const chungCu = measureDatabaseName("tdx-e22");
			hong(moiA === moiB, "tlk: hai cay chung mot kho");
			hong(moiA === chungCu || moiB === chungCu, "tlk: van dung kho chung cu");

			const thuMucCu = join(GOC, ".acceptance-runs", "tlk-kho", "x");
			mkdirSync(thuMucCu, { recursive: true });
			const cu = join(thuMucCu, "phien-tro-ly-truoc-vong.mjs");
			writeFileSync(
				cu,
				spawnSync("git", ["show", `${SHA_TRUOC_VONG}:${TEP_PHIEN}`], {
					cwd: GOC,
					encoding: "utf8",
				}).stdout,
			);
			const cuA = tenKhoCuaCay(cu, "cay-a", thuMuc);
			const cuB = tenKhoCuaCay(cu, "cay-b", thuMuc);
			hong(
				cuA !== cuB || cuA !== chungCu,
				"tlk: thuoc khong phan biet ban truoc vong",
			);
		} finally {
			rmSync(thuMuc, { recursive: true, force: true });
			rmSync(join(GOC, ".acceptance-runs", "tlk-kho"), {
				recursive: true,
				force: true,
			});
		}
	});
});
