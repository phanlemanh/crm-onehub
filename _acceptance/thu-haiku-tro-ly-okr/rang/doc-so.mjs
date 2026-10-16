export const NGUONG = Object.freeze({
	e24Hong: 0,
	e22Dung: 28,
	gopYThua: 0,
	judge: 0.9,
	tacNhanQua: 3,
});

export const SO_LUOT_BO_DUNG = 3;

const DONG_LUOT_E24 =
	/^(\d+)\. (\d+) ms(?: — hong \(([^)]*)\), tinh \d+)? · (\S+)$/;
const DONG_PHAN_VI = /^p50 (\d+) ms .* · p90 (\d+) ms /;
const DONG_CA_E22 = /^(DUNG|SAI) (gy-\d+)(.*)$/;
const DONG_MA_E22 = /^ma: (\d+)\/(\d+) · judge: ([\d.]+)/;
const DONG_CHI_E22 = /^chi: ([\d.]+) USD/;
const KHONG_DO = /^KHONG DO DUOC: (.*)$/m;
const CA_MAT_BAN_GHI = "khong co ban ghi";
const CA_GOP_Y_THUA = "khongGopY nhung co";

function dong(text) {
	return text.split("\n").map((d) => d.trimEnd());
}

function khongDo(lyDo) {
	return { khongDo: lyDo };
}

export function docE24(text) {
	const chan = text.match(KHONG_DO);
	if (chan) return khongDo(chan[1]);
	const luot = [];
	let phanVi = null;
	for (const d of dong(text)) {
		const l = d.match(DONG_LUOT_E24);
		if (l) {
			luot.push({ ms: Number(l[2]), ketCuc: l[3] ?? "da-nop", mucTieu: l[4] });
			continue;
		}
		const p = d.match(DONG_PHAN_VI);
		if (p) phanVi = { p50: Number(p[1]), p90: Number(p[2]) };
	}
	if (luot.length === 0) return khongDo("khong co dong luot nao");
	if (!phanVi) return khongDo("khong co dong p50/p90");
	const theoKetCuc = {};
	for (const l of luot) theoKetCuc[l.ketCuc] = (theoKetCuc[l.ketCuc] ?? 0) + 1;
	return {
		soLuot: luot.length,
		soHong: luot.filter((l) => l.ketCuc !== "da-nop").length,
		theoKetCuc,
		...phanVi,
	};
}

export function docE22(text) {
	const ca = [];
	let ma = null;
	let chiUsd = null;
	for (const d of dong(text)) {
		const c = d.match(DONG_CA_E22);
		if (c) {
			ca.push({ dung: c[1] === "DUNG", id: c[2], ghiChu: c[3] });
			continue;
		}
		const m = d.match(DONG_MA_E22);
		if (m) ma = { dung: Number(m[1]), tong: Number(m[2]), judge: Number(m[3]) };
		const chi = d.match(DONG_CHI_E22);
		if (chi) chiUsd = Number(chi[1]);
	}
	const matBanGhi = ca.filter((c) => c.ghiChu.includes(CA_MAT_BAN_GHI));
	if (matBanGhi.length > 0)
		return khongDo(
			`${matBanGhi.length} ca khong co ban ghi (${matBanGhi[0].id}…)`,
		);
	const chan = text.match(KHONG_DO);
	if (chan) return khongDo(chan[1]);
	if (ca.length === 0 || !ma) return khongDo("khong co dong ca hay dong ma");
	return {
		dung: ca.filter((c) => c.dung).length,
		tong: ca.length,
		gopYThua: ca
			.filter((c) => !c.dung && c.ghiChu.includes(CA_GOP_Y_THUA))
			.map((c) => c.id),
		judge: ma.judge,
		chiUsd,
	};
}

export const TRANG_THAI_EVE = Object.freeze({
	"✓": "passed",
	"✗": "failed",
	"○": "scored",
	"–": "skipped",
});

export function docKetQuaEval(text, id) {
	const dau = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const kyHieu = Object.keys(TRANG_THAI_EVE).join("");
	const m = text.match(
		new RegExp(`^([${kyHieu}])\\s+${dau}(?:\\s|$)`, "mu"),
	);
	if (!m) return khongDo(`khong co dong ket qua cua ${id}`);
	const trangThai = TRANG_THAI_EVE[m[1]];
	if (trangThai === "skipped") return khongDo(`${id} bi bo qua (skipped)`);
	return { qua: trangThai === "passed", trangThai };
}

function ve(ten, dat) {
	return dat ? [] : [ten];
}

export function ketLuan(so, nguong = NGUONG) {
	const truotTroLy = [
		...ve("e24", so.e24Hong <= nguong.e24Hong),
		...ve("e22", so.e22Dung >= nguong.e22Dung),
		...ve("gop-y-thua", so.gopYThua <= nguong.gopYThua),
		...ve("judge", so.judge >= nguong.judge),
	];
	const tacNhan =
		so.tacNhanQua === undefined
			? null
			: so.tacNhanQua >= nguong.tacNhanQua
				? { ket: "dat", truot: [] }
				: { ket: "khong-dat", truot: ["tac-nhan"] };
	return {
		troLyOkr: {
			ket: truotTroLy.length === 0 ? "dat" : "khong-dat",
			truot: truotTroLy,
		},
		tacNhan,
	};
}
