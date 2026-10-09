import nodeFs from "node:fs";
import { join } from "node:path";
import { setTimeout as ngu } from "node:timers/promises";
import { timThuMucDot } from "../dieu-phoi/dot.mjs";
import { KIEM_CHEO } from "./cau-hinh.mjs";

const { phien, slug, loai, tepPid, uocPhut } = KIEM_CHEO.khoa;
const TEN_DON = `${phien}-${loai}.json`;

function docJson(f, p) {
	try {
		return JSON.parse(f.readFileSync(p, "utf8"));
	} catch {
		return null;
	}
}

export function pidSong(f, thuMuc) {
	const pid = Number.parseInt(
		(() => {
			try {
				return f.readFileSync(join(thuMuc, tepPid), "utf8");
			} catch {
				return "";
			}
		})(),
		10,
	);
	if (!Number.isInteger(pid) || pid <= 0) return false;
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

function ghiNguyenTu(f, dich, noiDung) {
	const tam = join(
		join(dich, ".."),
		`.${TEN_DON}.tam-${process.pid}-${Date.now()}`,
	);
	f.writeFileSync(tam, noiDung);
	f.renameSync(tam, dich);
}

async function quaBoPhatLich({ f, thuMuc, cay, moc, now, cho, choToiDaMs }) {
	const don = join(thuMuc, "xin", TEN_DON);
	const chuTep = join(thuMuc, "khoa", loai, "chu.json");
	f.mkdirSync(join(thuMuc, "xin"), { recursive: true });
	f.mkdirSync(cay, { recursive: true });
	ghiNguyenTu(
		f,
		don,
		JSON.stringify({
			phien,
			slug,
			loai,
			luc: new Date(now()).toISOString(),
			worktree: cay,
			uoc_phut: uocPhut,
			...(moc ? { moc } : {}),
		}),
	);
	const het = now() + choToiDaMs;
	let chu = null;
	for (;;) {
		chu = docJson(f, chuTep);
		if (chu?.phien === phien) {
			return {
				loai: "dot",
				thuMuc,
				tra: () => {
					f.rmSync(join(thuMuc, "khoa", loai), {
						recursive: true,
						force: true,
					});
					f.rmSync(don, { force: true });
				},
			};
		}
		if (now() >= het) break;
		await cho();
	}
	f.rmSync(don, { force: true });
	return { ban: true, chu: chu?.phien ?? null };
}

function khoaTay({ f, thuMuc, cay, now }) {
	const dir = join(thuMuc, "khoa", loai);
	f.mkdirSync(join(thuMuc, "khoa"), { recursive: true });
	try {
		f.mkdirSync(dir);
	} catch {
		return { ban: true, chu: docJson(f, join(dir, "chu.json"))?.phien ?? null };
	}
	f.writeFileSync(
		join(dir, "chu.json"),
		JSON.stringify({
			phien,
			slug,
			loai,
			worktree: cay,
			cap_luc: new Date(now()).toISOString(),
		}),
	);
	return {
		loai: "tay",
		thuMuc,
		tra: () => f.rmSync(dir, { recursive: true, force: true }),
	};
}

export async function layKhoa({
	goc,
	cay,
	moc,
	timDot = timThuMucDot,
	fs: f = nodeFs,
	now = Date.now,
	cho = () => ngu(KIEM_CHEO.khoa.nghiMs),
	choToiDaMs = KIEM_CHEO.khoa.choToiDaMs,
}) {
	const dot = timDot(goc);
	if (dot && pidSong(f, dot)) {
		return quaBoPhatLich({ f, thuMuc: dot, cay, moc, now, cho, choToiDaMs });
	}
	const thuMuc = dot ?? join(goc, KIEM_CHEO.thuMuc);
	return khoaTay({ f, thuMuc, cay, now });
}

export async function voiKhoa(khoa, viec) {
	try {
		return await viec();
	} finally {
		khoa.tra();
	}
}
