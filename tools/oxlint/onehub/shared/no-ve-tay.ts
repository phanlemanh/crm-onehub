import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const GOC_KHO = resolve(
	dirname(fileURLToPath(import.meta.url)),
	"../../../..",
);

export const DUONG_NO = "tools/oxlint/onehub/rules/khong-ve-tay-no-cu.json";

export const DAU_HIEU = [
	"table",
	"clipboard",
	"tieu-de",
	"divide-y",
	"cham",
	"chip-dinh",
	"alert-dialog",
] as const;

export type DauHieu = (typeof DAU_HIEU)[number];

export type DongNo = { tep: string; dauHieu: DauHieu; so: number; lyDo: string };

export type NoVeTay = { dong: DongNo[]; loi: string[] };

function laDauHieu(x: string): x is DauHieu {
	return DAU_HIEU.some((d) => d === x);
}

export function phanTichNo(nguon: string, coTep: (tep: string) => boolean): NoVeTay {
	const tho: unknown = JSON.parse(nguon);
	if (!Array.isArray(tho)) return { dong: [], loi: ["no ve tay: tep khong phai mang"] };
	const dong: DongNo[] = [];
	const loi: string[] = [];
	const daCo = new Set<string>();
	for (const muc of tho) {
		const m = new Map<string, unknown>(Object.entries(Object(muc)));
		const tep = String(m.get("tep") ?? "");
		const dau = String(m.get("dau_hieu") ?? "");
		const so = Number(m.get("so"));
		const lyDo = String(m.get("ly_do") ?? "");
		const nhan = `no ve tay ${tep.split("/").pop()}/${dau}`;
		if (!coTep(tep)) {
			loi.push(`${nhan}: tep khong co`);
			continue;
		}
		if (!laDauHieu(dau)) {
			loi.push(`${nhan}: dau hieu la`);
			continue;
		}
		if (!Number.isInteger(so) || so < 1) {
			loi.push(`${nhan}: so khong phai so nguyen duong`);
			continue;
		}
		if (!lyDo.trim()) loi.push(`${nhan}: thieu ly do`);
		const khoa = `${tep}|${dau}`;
		if (daCo.has(khoa)) {
			loi.push(`${nhan}: trung cap`);
			continue;
		}
		daCo.add(khoa);
		dong.push({ tep, dauHieu: dau, so, lyDo });
	}
	return { dong, loi };
}

export function docNoVeTay(goc: string = GOC_KHO): NoVeTay {
	return phanTichNo(readFileSync(join(goc, DUONG_NO), "utf8"), (tep) => {
		try {
			readFileSync(join(goc, tep));
			return true;
		} catch {
			return false;
		}
	});
}
