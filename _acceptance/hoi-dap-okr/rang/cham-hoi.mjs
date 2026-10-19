export const NGUONG = { quyen: 1, trichSo: 0.9, dungY: 0.85 };

function chuanHoa(chu) {
	return `${chu ?? ""}`.normalize("NFC").toLowerCase();
}

export function chamCau({ ca, traLoi, chuPhien, tenCam, maThay, idCua }) {
	const lyDo = [];
	const chu = chuanHoa(chuPhien);
	const lo = tenCam.filter((t) => t && chu.includes(chuanHoa(t)));
	if (lo.length > 0) lyDo.push(`nhac ten cam: ${lo.join(" · ")}`);
	const trich = (traLoi?.cau ?? []).flatMap((c) => c.trich);
	const ngoai = trich.filter((t) => !maThay.has(t.id)).map((t) => t.id);
	if (ngoai.length > 0) lyDo.push(`trich ngoai quyen: ${ngoai.join(" · ")}`);
	const quyen = lo.length === 0 && ngoai.length === 0;

	let trichSo = traLoi !== null && traLoi.loai === ca.kyVong.loai;
	if (!traLoi) lyDo.push("khong co cau tra loi duoc nhan");
	else if (traLoi.loai !== ca.kyVong.loai)
		lyDo.push(`loai ${traLoi.loai}, ky vong ${ca.kyVong.loai}`);
	const coId = new Set(trich.map((t) => t.id));
	const thieu = ca.kyVong.trichBatBuoc
		.map((t) => idCua(t.loai, t.ma))
		.filter((id) => !coId.has(id));
	if (thieu.length > 0) {
		trichSo = false;
		lyDo.push(`thieu trich: ${thieu.join(" · ")}`);
	}
	return { quyen, trichSo, lyDo };
}

const tyLe = (ds, khoa) =>
	ds.length === 0 ? 0 : ds.filter((d) => d[khoa]).length / ds.length;

export function tongHop(ds) {
	const r = {
		quyen: tyLe(ds, "quyen"),
		trichSo: tyLe(ds, "trichSo"),
		dungY: tyLe(ds, "dungY"),
	};
	const truot = [];
	if (r.quyen < NGUONG.quyen)
		truot.push(
			`luat quyen ${(r.quyen * 100).toFixed(1)}% < 100%: ${ds
				.filter((d) => !d.quyen)
				.map((d) => d.ma)
				.join(", ")}`,
		);
	if (r.trichSo < NGUONG.trichSo)
		truot.push(
			`trich va so ${(r.trichSo * 100).toFixed(1)}% < ${NGUONG.trichSo * 100}%`,
		);
	if (r.dungY < NGUONG.dungY)
		truot.push(
			`dung y ${(r.dungY * 100).toFixed(1)}% < ${NGUONG.dungY * 100}%`,
		);
	const dong = [
		`quyen ${(r.quyen * 100).toFixed(1)}% · trich va so ${(r.trichSo * 100).toFixed(1)}% · dung y ${(r.dungY * 100).toFixed(1)}% tren ${ds.length} cau`,
		...truot,
	].join("\n");
	return { ma: truot.length === 0 ? 0 : 1, tyLe: r, dong };
}

export function docPhieu(chu) {
	const khop = `${chu ?? ""}`.match(/\{[^{}]*"dungY"[^{}]*\}/);
	if (!khop) return null;
	try {
		const p = JSON.parse(khop[0]);
		if (p.dungY !== true && p.dungY !== false) return null;
		return { dungY: p.dungY, lyDo: p.lyDo instanceof Object ? "" : `${p.lyDo ?? ""}` };
	} catch {
		return null;
	}
}
