import { ZALO } from "./zalo-config";

export type Lenh =
	| { lenh: "xong"; so: number[] }
	| { lenh: "xong-thieu-so" }
	| { lenh: "moi" };

const KHUON = new RegExp(`^(?:${ZALO.lenh.tu.join("|")})(?:\\s+(.*))?$`, "u");
const SO = /^[1-9]\d*$/;

export function docLenh(text: string): Lenh | null {
	const gon = text.replaceAll(" ", " ").trim().toLowerCase();
	if ((ZALO.lenh.moi as readonly string[]).includes(gon)) return { lenh: "moi" };
	const khop = KHUON.exec(gon);
	if (!khop) return null;
	const duoi = khop[1]?.trim() ?? "";
	if (duoi === "") return { lenh: "xong-thieu-so" };
	const manh = duoi.split(/[\s,]+/u).filter((m) => m !== "");
	if (manh.length > ZALO.lenh.toiDaSo) return null;
	const so: number[] = [];
	for (const m of manh) {
		const n = Number(m);
		if (!SO.test(m) || !Number.isSafeInteger(n)) return null;
		so.push(n);
	}
	return { lenh: "xong", so: [...new Set(so)].sort((a, b) => a - b) };
}
