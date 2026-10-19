import { describe, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { laHongHet } from "../../tro-ly-okr-de-xuat/rang/do-tre.mjs";

const GOC = resolve(import.meta.dir, "../../..");
const SHA_TRUOC_VONG = "1be143a82d5332f8b63fbc78d38af9d179f3f342";
const TEP_DO_TRE = "_acceptance/tro-ly-okr-de-xuat/rang/do-tre.mjs";

type Luot = { hong: boolean; quaHan: boolean };
type O = { ten: string; so: Luot[]; chan: boolean; coQuaHan: boolean };

function hong(dieuKien: boolean, thongDiep: string) {
	if (dieuKien) throw new Error(thongDiep);
}

function luot(hongKhongQuaHan: number, quaHan: number, lanh: number): Luot[] {
	return [
		...Array.from({ length: hongKhongQuaHan }, () => ({
			hong: true,
			quaHan: false,
		})),
		...Array.from({ length: quaHan }, () => ({ hong: true, quaHan: true })),
		...Array.from({ length: lanh }, () => ({ hong: false, quaHan: false })),
	];
}

const MA_TRAN: O[] = [
	{
		ten: "20 hong khong qua han",
		so: luot(20, 0, 0),
		chan: true,
		coQuaHan: false,
	},
	{ ten: "20 qua han", so: luot(0, 20, 0), chan: false, coQuaHan: true },
	{
		ten: "10 qua han + 10 hong",
		so: luot(10, 10, 0),
		chan: true,
		coQuaHan: true,
	},
	{
		ten: "1 qua han + 19 hong",
		so: luot(19, 1, 0),
		chan: true,
		coQuaHan: true,
	},
	{ ten: "19 hong + 1 lanh", so: luot(19, 0, 1), chan: false, coQuaHan: false },
	{ ten: "0 luot", so: [], chan: false, coQuaHan: false },
];

describe("eqh-phan-loai", () => {
	test("chan som khi moi luot hong, tru khi moi luot hong deu vi qua han", () => {
		for (const o of MA_TRAN)
			hong(laHongHet(o.so) !== o.chan, `eqh: phan loai sai o ${o.ten}`);
	});

	test("chieu do: laHongHet cua ban truoc vong chi lech o qua han het", () => {
		const thuMuc = join(
			GOC,
			".acceptance-runs",
			"e24-qua-han-khong-phai-ha-tang",
			"kiem",
		);
		mkdirSync(thuMuc, { recursive: true });
		try {
			const r = spawnSync("git", ["show", `${SHA_TRUOC_VONG}:${TEP_DO_TRE}`], {
				cwd: GOC,
				encoding: "utf8",
			});
			hong(r.status !== 0, `eqh: khong doc duoc ban truoc vong (${r.stderr})`);
			const ham = r.stdout.match(
				/export function laHongHet\(so\) \{[\s\S]*?\n\}/,
			)?.[0];
			hong(!ham, "eqh: ban truoc vong khong co laHongHet");
			const tep = join(thuMuc, "la-hong-het-truoc-vong.mjs");
			writeFileSync(tep, `${ham}\n`);
			const chay = spawnSync(
				process.execPath,
				[
					"-e",
					`const { laHongHet } = await import(${JSON.stringify(tep)}); console.log(JSON.stringify(${JSON.stringify(MA_TRAN.map((o) => o.so))}.map(laHongHet)));`,
				],
				{ cwd: GOC, encoding: "utf8" },
			);
			hong(
				chay.status !== 0,
				`eqh: khong chay duoc ban truoc vong (${chay.stderr})`,
			);
			const ketCu: boolean[] = JSON.parse(chay.stdout.trim());
			const lech = MA_TRAN.filter((o, i) => ketCu[i] !== o.chan).map(
				(o) => o.ten,
			);
			const mongLech = MA_TRAN.filter(
				(o) => o.so.length > 0 && o.so.every((l) => l.quaHan),
			).map((o) => o.ten);
			hong(
				JSON.stringify(lech) !== JSON.stringify(mongLech),
				`eqh: ma tran khong phan biet ban truoc vong (lech ${lech.join(", ") || "khong o nao"})`,
			);
		} finally {
			rmSync(thuMuc, { recursive: true, force: true });
		}
	});
});
