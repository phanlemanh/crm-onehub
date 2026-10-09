import { ma, TIEN_TO } from "../../../apps/agent-okr/test/support/gieo";

const MOC = [1791498237630, 1_700_000_000_000, 1_893_456_000_000];
const LAN = 10_000;
const SAU_TIEN_TO = /^[a-z]+$/;

function kiem(cacChuoi: string[]): void {
	for (const chuoi of cacChuoi) {
		if (!chuoi.startsWith(TIEN_TO)) throw new Error("ma mat tien to");
		if (!SAU_TIEN_TO.test(chuoi.slice(TIEN_TO.length)))
			throw new Error(`ma co chu so: ${chuoi}`);
	}
	if (new Set(cacChuoi).size !== cacChuoi.length)
		throw new Error("ma trung lap");
}

function sinh(moc: number, ham: () => string): string[] {
	const goc = Date.now;
	Date.now = () => moc;
	try {
		return Array.from({ length: LAN }, ham);
	} finally {
		Date.now = goc;
	}
}

let demCu = 0;
const congThucCu = () => `${TIEN_TO}${Date.now().toString(36)}x${++demCu}`;
let batDuoc = false;
try {
	kiem(sinh(1791498237630, congThucCu));
} catch (loi) {
	batDuoc = loi instanceof Error && loi.message.startsWith("ma co chu so");
}
if (!batDuoc) {
	console.log("doi chung hong: cong thuc cu khong bi bat «ma co chu so»");
	process.exit(1);
}

let tong = 0;
for (const moc of MOC) {
	const chuoi = sinh(moc, ma);
	kiem(chuoi);
	tong += chuoi.length;
}
if (MOC.length !== 3) throw new Error(`khai 3 moc, co ${MOC.length}`);
console.log(`MA: ${MOC.length} moc, ${tong} chuoi, 0 chu so`);
