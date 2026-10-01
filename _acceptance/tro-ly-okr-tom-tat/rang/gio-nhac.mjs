const GIO_MS = 60 * 60 * 1000;
const PHUT_MS = 60 * 1000;
const NGAY_MS = 24 * GIO_MS;

export function gioNhacSau(luc, { gio, phut, gioVN }) {
	const ngayVN = new Date(luc.getTime() + gioVN * GIO_MS)
		.toISOString()
		.slice(0, 10);
	const dauNgay = Date.parse(`${ngayVN}T00:00:00Z`) - gioVN * GIO_MS;
	const ung = dauNgay + gio * GIO_MS + phut * PHUT_MS;
	return new Date(ung - PHUT_MS < luc.getTime() ? ung + NGAY_MS : ung);
}

const hienVN = (d, gioVN) =>
	new Date(d.getTime() + gioVN * GIO_MS)
		.toISOString()
		.slice(0, 16)
		.replace("T", " ");

function tuKiem() {
	const cauHinh = { gio: 8, phut: 31, gioVN: 7 };
	const ca = [
		["2026-11-13T04:20:00+07:00", "2026-11-13 08:31"],
		["2026-11-13T08:30:00+07:00", "2026-11-13 08:31"],
		["2026-11-13T08:30:30+07:00", "2026-11-14 08:31"],
		["2026-11-13T09:00:00+07:00", "2026-11-14 08:31"],
		["2026-11-13T23:50:00+07:00", "2026-11-14 08:31"],
		["2026-11-13T00:00:00+07:00", "2026-11-13 08:31"],
	];
	let sai = 0;
	for (const [tao, mong] of ca) {
		const ra = gioNhacSau(new Date(tao), cauHinh);
		const thuc = hienVN(ra, cauHinh.gioVN);
		const dong =
			ra.getTime() - PHUT_MS >= new Date(tao).getTime()
				? "trong-cua-so"
				: "ngoai-cua-so";
		const dau = thuc === mong && dong === "trong-cua-so" ? "ok" : "SAI";
		if (dau === "SAI") sai += 1;
		console.log(`gio-nhac ${dau}: tao ${tao} -> nhac ${thuc} VN (${dong})`);
	}
	return sai === 0 ? 0 : 1;
}

if (import.meta.main && process.argv.includes("--tu-kiem"))
	process.exit(tuKiem());
