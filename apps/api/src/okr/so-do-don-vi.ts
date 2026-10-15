import { tinhTrang } from "@crm/validation/okr-muc-tieu";
import type { MucTieuOutput } from "./okr.contracts";
import type { CoChuY, NutSoDo, SoDoDonViOutput } from "./okr-xem.contracts";
import type { CayGon } from "./toan-canh";

type NguoiGon = { id: string; name: string };

export type DauVaoSoDo = {
	cay: CayGon;
	tenGoc: string;
	truongGoc: NguoiGon | null;
	cycleId: string;
	mts: MucTieuOutput[];
	gioiHan: ReadonlySet<string>;
};

type DonVi = {
	khoa: string;
	ten: string;
	cap: NutSoDo["cap"];
	cha: string | null;
	truong: NguoiGon | null;
};

function khoaCua(m: Pick<MucTieuOutput, "level" | "unitId">): string | null {
	switch (m.level) {
		case "onehub":
			return "goc";
		case "bo-phan":
			return m.unitId ? `bp:${m.unitId}` : null;
		case "phong-ban":
			return m.unitId ? `pb:${m.unitId}` : null;
		default:
			return null;
	}
}

function donViCua(vao: DauVaoSoDo): DonVi[] {
	const goc: DonVi = {
		khoa: "goc",
		ten: vao.tenGoc,
		cap: "goc",
		cha: null,
		truong: vao.truongGoc,
	};
	const phongBan =
		(cha: string) =>
		(p: CayGon["chuaXep"][number]): DonVi => ({
			khoa: `pb:${p.id}`,
			ten: p.name,
			cap: "phong-ban",
			cha,
			truong: p.head,
		});
	return [
		goc,
		...vao.cay.divisions.flatMap((b) => [
			{
				khoa: `bp:${b.id}`,
				ten: b.name,
				cap: "bo-phan" as const,
				cha: "goc",
				truong: b.head,
			},
			...b.departments.map(phongBan(`bp:${b.id}`)),
		]),
		...vao.cay.chuaXep.map(phongBan("goc")),
	];
}

const trungBinh = (so: number[]): number | null =>
	so.length === 0 ? null : so.reduce((t, x) => t + x, 0) / so.length;

export function gopSoDoDonVi(vao: DauVaoSoDo): SoDoDonViOutput {
	const donVi = donViCua(vao);
	const chaCua = new Map(donVi.map((d) => [d.khoa, d.cha]));
	const tenDonVi = new Map(donVi.map((d) => [d.khoa, d.ten]));
	const khoaMucTieu = new Map<string, string>();
	const tenMucTieu = new Map<string, string>();
	for (const m of vao.mts) {
		const k = khoaCua(m);
		if (k) khoaMucTieu.set(m.id, k);
		tenMucTieu.set(m.id, m.title);
	}
	const coDichThay = (m: MucTieuOutput) =>
		m.alignments.some((a) => khoaMucTieu.has(a.targetObjectiveId));
	const tinh = vao.mts.filter(
		(m) =>
			m.cycleId === vao.cycleId &&
			m.status === "cong-bo" &&
			khoaMucTieu.has(m.id) &&
			(!vao.gioiHan.has(m.id) || coDichThay(m)),
	);
	const cuaDonVi = new Map<string, MucTieuOutput[]>();
	for (const m of tinh) {
		const k = khoaMucTieu.get(m.id) as string;
		cuaDonVi.set(k, [...(cuaDonVi.get(k) ?? []), m]);
	}

	const duong = new Map<
		string,
		{ tu: string; den: string; ids: Set<string> }
	>();
	const nut: NutSoDo[] = donVi.map((d) => {
		const ds = cuaDonVi.get(d.khoa) ?? [];
		const dem = { dungNhip: 0, chamNhip: 0, truot: 0 };
		let soKr = 0;
		let gopRa = 0;
		let chuaGop = 0;
		const mucTieu = ds.map((m) => {
			soKr += m.keyResults.length;
			for (const kr of m.keyResults) {
				if (kr.kind === "moc") continue;
				const t = tinhTrang(kr.progress, m.expected, m.kind);
				if (t === "dung-nhip") dem.dungNhip += 1;
				else if (t === "cham-nhip") dem.chamNhip += 1;
				else if (t === "truot") dem.truot += 1;
			}
			if (m.alignments.length === 0) chuaGop += 1;
			const gop = m.alignments.flatMap((a) => {
				const dich = a.targetKeyResultId ?? a.targetObjectiveId;
				const donViDich = khoaMucTieu.get(a.targetObjectiveId);
				if (!donViDich) return [];
				return [
					{
						dich,
						tenDich:
							a.keyResultTitle ??
							tenMucTieu.get(a.targetObjectiveId) ??
							a.objectiveTitle,
						donViDich: tenDonVi.get(donViDich) ?? a.unitName,
						lyDo: a.lyDo,
						mucTin: a.mucTin,
						lyDoTuKara: a.lyDoTuKara,
						khoaDich: donViDich,
					},
				];
			});
			let raNgoai = false;
			for (const g of gop) {
				if (g.khoaDich === d.khoa) continue;
				raNgoai = true;
				const id = `${g.khoaDich}->${d.khoa}`;
				const cu = duong.get(id) ?? {
					tu: g.khoaDich,
					den: d.khoa,
					ids: new Set(),
				};
				cu.ids.add(m.id);
				duong.set(id, cu);
			}
			if (raNgoai) gopRa += 1;
			return {
				id: m.id,
				ten: m.title,
				gop: gop.map(({ khoaDich: _, ...g }) => g),
			};
		});
		const co: CoChuY[] = [];
		if (d.cap !== "goc") {
			if (d.truong === null) co.push("chua-truong");
			if (ds.length === 0) co.push("chua-okr");
			if (ds.length > 0 && gopRa === 0) co.push("chua-noi");
			if (chuaGop > 0) co.push("muc-tieu-chua-gop");
			if (dem.truot > 0) co.push("kr-truot");
		}
		return {
			khoa: d.khoa,
			ten: d.ten,
			cap: d.cap,
			cha: d.cha,
			truong: d.truong ? { id: d.truong.id, name: d.truong.name } : null,
			soMucTieu: ds.length,
			soKr,
			tienDo: trungBinh(ds.map((m) => m.progress)),
			tinhTrang: dem,
			chuaGop,
			co,
			canChuY: co.length > 0,
			mucTieu,
		};
	});

	return {
		nut,
		duong: [...duong.values()].map((x) => ({
			tu: x.tu,
			den: x.den,
			loai: chaCua.get(x.den) === x.tu ? ("lien" as const) : ("dut" as const),
			soMucTieu: x.ids.size,
		})),
	};
}
