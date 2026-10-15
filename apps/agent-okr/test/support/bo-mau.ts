import { join } from "node:path";
import type { db } from "@crm/db";

type Db = typeof db;
type SanMau = {
	napMau: (moc: Date) => Promise<unknown>;
	lamSachOkr: () => Promise<void>;
};
type NapMau = {
	xoaBoOkrMau: (client: Db) => Promise<unknown>;
	idMau: (loai: string, ma: string) => string;
};

const GOC_API = join(import.meta.dir, "..", "..", "..", "api");

export async function boMau() {
	const san = (await import(join(GOC_API, "test", "okr-mau-san.ts"))) as SanMau;
	const nap = (await import(
		join(GOC_API, "scripts", "okr-mau", "nap.ts")
	)) as NapMau;
	return {
		napMau: san.napMau,
		lamSachOkr: san.lamSachOkr,
		xoaBoOkrMau: nap.xoaBoOkrMau,
		idMau: nap.idMau,
	};
}
