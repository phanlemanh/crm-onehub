import type { MucTieuOutput } from "./okr.contracts";
import type { QuanhMucTieuOutput } from "./okr-xem.contracts";

type Nut = QuanhMucTieuOutput["nut"][number];
type Canh = QuanhMucTieuOutput["canh"][number];
type Kr = MucTieuOutput["keyResults"][number];

export function gopQuanhMucTieu(
	mts: readonly MucTieuOutput[],
	tamId: string,
): QuanhMucTieuOutput | null {
	const mt = new Map(mts.map((m) => [m.id, m]));
	const tam = mt.get(tamId);
	if (!tam) return null;
	const chuKr = new Map(
		mts.flatMap((m) => m.keyResults.map((k) => [k.id, m] as const)),
	);
	const congTy = (m: MucTieuOutput) => m.level === "onehub";
	const nut = new Map<string, Nut>();
	const canh = new Map<string, Canh>();
	const themMt = (m: MucTieuOutput, phia: Nut["phia"]) => {
		if (nut.has(m.id)) return;
		nut.set(m.id, {
			id: m.id,
			loai: "muc-tieu",
			phia,
			tieuDe: m.title,
			donVi: m.unitName,
			congTy: congTy(m),
			tienDo: m.progress,
			mucTieuId: m.id,
		});
	};
	const themKr = (k: Kr, m: MucTieuOutput, phia: Nut["phia"]) => {
		if (nut.has(k.id)) return;
		nut.set(k.id, {
			id: k.id,
			loai: "kr",
			phia,
			tieuDe: k.title,
			donVi: m.unitName,
			congTy: congTy(m),
			tienDo: k.progress,
			mucTieuId: m.id,
		});
	};
	const noi = (tu: string, den: string, loai: Canh["loai"]) =>
		canh.set(`${tu}->${den}`, { tu, den, loai });
	const gopLen: QuanhMucTieuOutput["gopLenCongTy"] = [];
	const daGop = new Set<string>();
	const ghiGop = (kr: Kr | null, p: MucTieuOutput) => {
		const khoa = kr?.id ?? p.id;
		if (!congTy(p) || daGop.has(khoa)) return;
		daGop.add(khoa);
		gopLen.push({
			kr: kr ? { id: kr.id, tieuDe: kr.title } : null,
			mucTieu: { id: p.id, tieuDe: p.title },
		});
	};

	themMt(tam, "tam");
	const tren = new Set<string>([tam.id]);
	const hang: MucTieuOutput[] = [tam];
	for (let x = hang.shift(); x; x = hang.shift()) {
		for (const a of x.alignments) {
			if (a.targetKeyResultId) {
				const chu = chuKr.get(a.targetKeyResultId);
				const kr = chu?.keyResults.find((k) => k.id === a.targetKeyResultId);
				if (!chu || !kr) continue;
				themMt(chu, "tren");
				themKr(kr, chu, "tren");
				noi(chu.id, kr.id, "cua");
				noi(kr.id, x.id, "gop");
				ghiGop(kr, chu);
				if (!tren.has(chu.id)) {
					tren.add(chu.id);
					hang.push(chu);
				}
				continue;
			}
			const p = a.targetObjectiveId ? mt.get(a.targetObjectiveId) : undefined;
			if (!p) continue;
			themMt(p, "tren");
			noi(p.id, x.id, "gop");
			ghiGop(null, p);
			if (!tren.has(p.id)) {
				tren.add(p.id);
				hang.push(p);
			}
		}
	}

	const krTam = new Set(tam.keyResults.map((k) => k.id));
	for (const k of tam.keyResults) {
		themKr(k, tam, "duoi");
		noi(tam.id, k.id, "cua");
	}
	for (const c of mts) {
		if (tren.has(c.id)) continue;
		for (const a of c.alignments) {
			const den = a.targetKeyResultId
				? krTam.has(a.targetKeyResultId)
					? a.targetKeyResultId
					: null
				: a.targetObjectiveId === tam.id
					? tam.id
					: null;
			if (!den) continue;
			themMt(c, "duoi");
			noi(den, c.id, "gop");
		}
	}

	return {
		tamId: tam.id,
		laCongTy: congTy(tam),
		nut: [...nut.values()],
		canh: [...canh.values()],
		gopLenCongTy: congTy(tam) ? [] : gopLen,
	};
}
