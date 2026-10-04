import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const NGAY_MS = 24 * 60 * 60 * 1000;
const CUA_SO_MAC_DINH_NGAY = 30;

function docNgay(ten: string): Date | null {
	const i = process.argv.indexOf(ten);
	const gia = i >= 0 ? process.argv[i + 1] : undefined;
	if (!gia) return null;
	const d = new Date(gia);
	if (Number.isNaN(d.getTime())) {
		console.log(`KHONG DO DUOC: ${ten} ${gia} khong phai ngay`);
		process.exit(2);
	}
	return d;
}

const den = docNgay("--den") ?? new Date();
const tu =
	docNgay("--tu") ?? new Date(den.getTime() - CUA_SO_MAC_DINH_NGAY * NGAY_MS);

const { db } = await import(join(GOC, "packages/db/src/index.ts"));
const { demBaoSai, demHoiKho } = await import(
	join(GOC, "packages/db/src/tai-lieu-hoi.ts")
);

try {
	const hoi = await demHoiKho(db, tu, den);
	const bao = await demBaoSai(db, tu, den);
	console.log(`cua so: ${tu.toISOString()} -> ${den.toISOString()}`);
	console.log(
		`hoi kho: traLoi ${hoi.traLoi}, tuChoi ${hoi.tuChoi}, loi ${hoi.loi}, ti le tra loi co trich ${hoi.tiLe === null ? "— (chua co cau nao)" : `${(hoi.tiLe * 100).toFixed(1)}%`}`,
	);
	console.log(
		`bao sai: tong ${bao.tong}, da xu ly ${bao.daXuLy}, chu trang xac nhan sai ${bao.xacNhanSai}`,
	);
	await db.$disconnect();
} catch (e) {
	await db.$disconnect().catch(() => null);
	console.log(`KHONG DO DUOC: ${String(e).slice(0, 400)}`);
	process.exit(2);
}
