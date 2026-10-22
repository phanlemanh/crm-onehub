import { spawnSync } from "node:child_process";
import { docDuLieu } from "../../apps/app/lib/lo-trinh/doc-du-lieu.js";
import type { Db } from "../../packages/db/src/client.ts";
import { TIN_HIEU } from "../../packages/validation/src/tin-hieu.ts";
import {
	choTinHieu,
	doiCho,
	type KetQuaCho,
} from "../../packages/validation/src/tin-hieu-cho.ts";
import { BAO_DOI_CHO_DO, PHUT_MS } from "./gom-cau-hinh.ts";

export type LanDoi = {
	ma: string;
	khoa: string;
	sha: string;
	commitLuc: string;
};

export type ThongBaoDo = { ma: string; sha: string; taoLuc: string };

export type DongDoiCho = LanDoi & {
	baoLuc: string | null;
	treMs: number | null;
	co: string[];
};

const chayGit = (kho: string, thamSo: string[]) => {
	const r = spawnSync("git", ["-C", kho, ...thamSo], { encoding: "utf8" });
	if (r.status !== 0)
		throw new Error(`git ${thamSo.join(" ")} thoát ${r.status}: ${r.stderr}`);
	return r.stdout;
};

function choTaiCommit(kho: string, rev: string): KetQuaCho {
	const r = spawnSync(
		"git",
		["-C", kho, "show", `${rev}:${BAO_DOI_CHO_DO.tep}`],
		{ encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
	);
	if (r.status !== 0) return { kieu: "khong-co" };
	const { duLieu } = docDuLieu(r.stdout);
	return duLieu ? choTinHieu(duLieu) : { kieu: "khong-co" };
}

export type CommitDo = { sha: string; commitLuc: string };

export function lanDoiTuGit(
	kho: string,
	nhanh: string,
	tu: string,
): { lanDoi: LanDoi[]; commit: CommitDo[] } {
	const dong = chayGit(kho, [
		"log",
		"--first-parent",
		"--reverse",
		`--since=${tu}T00:00:00${BAO_DOI_CHO_DO.muiGio}`,
		"--format=%H %cI",
		nhanh,
		"--",
		BAO_DOI_CHO_DO.tep,
	])
		.trim()
		.split("\n")
		.filter(Boolean)
		.map((d) => {
			const [sha = "", luc = ""] = d.split(" ");
			return { sha, commitLuc: new Date(luc).toISOString() };
		});
	const ra: LanDoi[] = [];
	let truoc = dong[0] ? choTaiCommit(kho, `${dong[0].sha}^1`) : null;
	for (const c of dong) {
		const nay = choTaiCommit(kho, c.sha);
		if (truoc)
			for (const d of doiCho(truoc, nay))
				ra.push({
					ma: d.ma,
					khoa: d.cho.khoa,
					sha: c.sha,
					commitLuc: c.commitLuc,
				});
		truoc = nay;
	}
	return { lanDoi: ra, commit: dong };
}

export function ghepLanDoi(
	lanDoi: LanDoi[],
	thongBao: ThongBaoDo[],
	coNguoiNhan: ReadonlySet<string>,
	commit: CommitDo[],
): DongDoiCho[] {
	const lucCommit = new Map(
		commit.map((c) => [c.sha, Date.parse(c.commitLuc)]),
	);
	return lanDoi
		.filter((l) => coNguoiNhan.has(l.ma))
		.map((l) => {
			const goc = Date.parse(l.commitLuc);
			const phu = thongBao
				.filter((t) => {
					if (t.ma !== l.ma) return false;
					const sau = lucCommit.get(t.sha);
					return (
						t.sha === l.sha ||
						(sau !== undefined &&
							sau >= goc &&
							sau - goc <= BAO_DOI_CHO_DO.cuaSoMs)
					);
				})
				.map((t) => Date.parse(t.taoLuc))
				.sort((a, b) => a - b);
			const dau = phu[0];
			if (dau === undefined)
				return { ...l, baoLuc: null, treMs: null, co: [BAO_DOI_CHO_DO.thieu] };
			const treMs = dau - goc;
			return {
				...l,
				baoLuc: new Date(dau).toISOString(),
				treMs,
				co: treMs > BAO_DOI_CHO_DO.cuaSoMs ? [BAO_DOI_CHO_DO.quaMotNgay] : [],
			};
		});
}

export function inBang(dong: DongDoiCho[]): { chu: string; dat: boolean } {
	if (dong.length === 0) return { chu: BAO_DOI_CHO_DO.khongCo, dat: true };
	const dat = dong.every((d) => d.co.length === 0);
	const dongIn = dong.map((d) =>
		[
			d.ma,
			d.khoa,
			`commit ${d.commitLuc}`,
			`thông báo ${d.baoLuc ?? "—"}`,
			`trễ ${d.treMs === null ? "—" : `${Math.round(d.treMs / PHUT_MS)} phút`}`,
			...d.co,
		].join(" · "),
	);
	const phu = dong.filter((d) => d.co.length === 0).length;
	dongIn.push(
		`KẾT LUẬN: ${dat ? BAO_DOI_CHO_DO.dat : BAO_DOI_CHO_DO.khongDat} — ${phu}/${dong.length} lần đổi chỗ có thông báo trong vòng một ngày`,
	);
	return { chu: dongIn.join("\n"), dat };
}

export async function docTuKho(
	db: Db,
	tu: string,
): Promise<{ thongBao: ThongBaoDo[]; coNguoiNhan: Set<string> }> {
	const tuLuc = new Date(`${tu}T00:00:00${BAO_DOI_CHO_DO.muiGio}`);
	const hang = await db.thongBao.findMany({
		where: {
			khoa: { startsWith: `${BAO_DOI_CHO_DO.loai}:` },
			taoLuc: { gte: tuLuc },
		},
		select: { khoa: true, taoLuc: true },
	});
	const thongBao = hang.flatMap((h) => {
		const [, ma, sha] = h.khoa.split(":");
		return ma && sha ? [{ ma, sha, taoLuc: h.taoLuc.toISOString() }] : [];
	});
	const tinHieu = await db.tinHieu.findMany({
		where: { archivedAt: null, nguoiGui: { members: { some: {} } } },
		select: { so: true },
	});
	return {
		thongBao,
		coNguoiNhan: new Set(tinHieu.map((t) => `${TIN_HIEU.phien}-${t.so}`)),
	};
}

export async function doBaoDoiCho(o: {
	db: Db;
	kho: string;
	nhanh: string;
	tu: string;
}): Promise<{ chu: string; dat: boolean }> {
	const { lanDoi, commit } = lanDoiTuGit(o.kho, o.nhanh, o.tu);
	const { thongBao, coNguoiNhan } = await docTuKho(o.db, o.tu);
	return inBang(ghepLanDoi(lanDoi, thongBao, coNguoiNhan, commit));
}

if (import.meta.main) {
	const thamSo = process.argv.slice(2);
	const lay = (ten: string) => {
		const i = thamSo.indexOf(ten);
		return i >= 0 ? thamSo[i + 1] : undefined;
	};
	const tu = lay("--tu");
	if (!tu || !/^\d{4}-\d{2}-\d{2}$/.test(tu)) {
		console.error(
			"dùng: bun scripts/tin-hieu/do-bao-doi-cho.ts --tu <YYYY-MM-DD> [--kho <đường>] [--nhanh <nhánh>]",
		);
		process.exit(2);
	}
	const { db } = await import("../../packages/db/src/client.ts");
	const kq = await doBaoDoiCho({
		db,
		kho: lay("--kho") ?? process.cwd(),
		nhanh: lay("--nhanh") ?? `origin/${BAO_DOI_CHO_DO.nhanh}`,
		tu,
	});
	console.log(kq.chu);
	process.exit(kq.dat ? 0 : 1);
}
