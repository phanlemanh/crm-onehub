import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
	banGom,
	cauHinhGom,
	type NhomMay,
	prDeXuat,
} from "../../packages/validation/src/tin-hieu-gom.ts";
import { GOM, GOM_DO } from "./gom-cau-hinh.ts";
import { gocKit } from "./gom-lich.ts";
import { docKhoiMay } from "./gom-than-pr.ts";

const chay = (lenh: string, thamSo: string[], cwd: string) => {
	const r = spawnSync(lenh, thamSo, { cwd, encoding: "utf8" });
	return { ma: r.status ?? 1, ra: r.stdout ?? "", loi: r.stderr ?? "" };
};

const soGio = (ms: number): number => Math.round((ms / GOM_DO.gioMs) * 10) / 10;

export function dongTong(o: {
	choLonNhatMs: number;
	quaNguong: string[];
	daSua: number;
	tongNhom: number;
}): string {
	const gioDat = o.choLonNhatMs <= GOM_DO.nguongMs && !o.quaNguong.length;
	const suaDat = !o.tongNhom || o.daSua / o.tongNhom < GOM_DO.nguongSua;
	return [
		`chờ lâu nhất ${soGio(o.choLonNhatMs)} giờ — ${gioDat ? GOM_DO.dat : GOM_DO.chuaDat} (ngưỡng ${soGio(GOM_DO.nguongMs)} giờ)`,
		...(o.quaNguong.length
			? [`${GOM_DO.quaNguong}: ${o.quaNguong.join(", ")}`]
			: []),
		`chủ kho sửa ${o.daSua}/${o.tongNhom} nhóm — ${suaDat ? GOM_DO.dat : GOM_DO.chuaDat} (ngưỡng dưới 1/5)`,
	].join("\n");
}

export function demSua(may: NhomMay[], gop: NhomMay[]): number {
	const khoa = (n: NhomMay) => [...n.tinHieu].sort().join(",");
	const theoMa = new Map(gop.map((n) => [n.ma, n]));
	let sua = 0;
	for (const n of may) {
		const m = theoMa.get(n.ma);
		if (!m || m.ten !== n.ten || khoa(m) !== khoa(n)) sua++;
		theoMa.delete(n.ma);
	}
	return sua + theoMa.size;
}

export async function doGom(o: {
	goc: string;
	env: Record<string, string | undefined>;
	gh: string;
	now: Date;
}): Promise<{ ma: 0 | 1; dong: string[] }> {
	const git = (...thamSo: string[]) => chay("git", thamSo, o.goc);
	const chinh = `origin/${GOM.nhanhChinh}`;
	git("fetch", "--quiet", "origin", GOM.nhanhChinh);
	const ch = cauHinhGom.parse(
		Bun.YAML.parse(
			readFileSync(path.join(o.goc, "_acceptance", "config.yaml"), "utf8"),
		),
	);
	const nguon = [ch.tin_hieu.nguon ?? []].flat();
	const tep = nguon.flatMap((n) =>
		git("ls-tree", "-r", "--name-only", chinh, "--", n)
			.ra.split("\n")
			.filter((t) => t.endsWith(".json")),
	);
	if (!tep.length) return { ma: 0, dong: [GOM_DO.khongCo] };

	const ds = chay(
		o.gh,
		[
			"pr",
			"list",
			"--head",
			GOM.nhanhDeXuat,
			"--base",
			GOM.nhanhChinh,
			"--state",
			"all",
			"--json",
			"number,state,body,mergedAt",
		],
		o.goc,
	);
	const prs = prDeXuat.safeParse(JSON.parse(ds.ra || "null"));
	if (ds.ma !== 0 || !prs.success)
		return { ma: 1, dong: [GOM.thongDiep.danhSachLa] };

	const deXuatDau = new Map<string, number>();
	const quaPhuQuyet = new Set<string>();
	for (const p of prs.data) {
		const k = docKhoiMay(p.body);
		for (const [id, luc] of Object.entries(k.gio)) {
			const t = Date.parse(luc);
			if (!Number.isNaN(t) && t < (deXuatDau.get(id) ?? Infinity))
				deXuatDau.set(id, t);
			if (p.state === "CLOSED" && !p.mergedAt) quaPhuQuyet.add(id);
		}
	}

	const dong: string[] = [];
	const quaNguong: string[] = [];
	let choLonNhat = 0;
	for (const t of tep.sort()) {
		const id = path.basename(t, ".json");
		const len = git(
			"log",
			"--first-parent",
			"--diff-merges=first-parent",
			"--diff-filter=A",
			"--name-only",
			"--format=%cI",
			chinh,
			"--",
			t,
		)
			.ra.split("\n")
			.filter((d) => /^\d{4}-\d{2}-\d{2}T/.test(d))
			.pop();
		if (!len) continue;
		const den = deXuatDau.get(id) ?? o.now.getTime();
		const cho = Math.max(0, den - Date.parse(len));
		choLonNhat = Math.max(choLonNhat, cho);
		if (!deXuatDau.has(id) && cho > GOM_DO.nguongMs) quaNguong.push(id);
		dong.push(
			`${id}: ${soGio(cho)} giờ${deXuatDau.has(id) ? "" : " (chưa có đề xuất)"}${quaPhuQuyet.has(id) ? ` · ${GOM_DO.quaPhuQuyet}` : ""}`,
		);
	}

	let daSua = 0;
	let tongNhom = 0;
	const gop = prs.data.filter((p) => p.state === "MERGED");
	if (gop.length) {
		const ag = gocKit(o.goc, o.env);
		if (!ag) return { ma: 1, dong: [GOM.thongDiep.thieuKit] };
		const kit = (await import(
			pathToFileURL(path.join(ag, GOM.kit.tinHieu)).href
		)) as { docBanGom: (txt: string) => unknown };
		for (const p of gop) {
			const k = docKhoiMay(p.body);
			if (!k.tep || !k.nhom.length) continue;
			const tho = git("show", `${chinh}:${k.tep}`);
			if (tho.ma !== 0) continue;
			const bg = banGom.parse(kit.docBanGom(tho.ra));
			const sua = demSua(k.nhom, bg.nhom);
			daSua += sua;
			tongNhom += k.nhom.length;
			dong.push(`đề xuất #${p.number}: đã sửa ${sua}/${k.nhom.length} nhóm`);
		}
	}
	dong.push(dongTong({ choLonNhatMs: choLonNhat, quaNguong, daSua, tongNhom }));
	return { ma: 0, dong };
}

if (import.meta.main) {
	const kq = await doGom({
		goc: path.resolve(import.meta.dir, "..", ".."),
		env: process.env,
		gh: "gh",
		now: new Date(),
	});
	for (const d of kq.dong) console.log(d);
	process.exit(kq.ma);
}
