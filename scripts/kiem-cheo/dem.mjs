import { execFileSync, spawn } from "node:child_process";
import nodeFs, {
	existsSync,
	mkdirSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { timThuMucDot } from "../dieu-phoi/dot.mjs";
import { chamNhip } from "../dieu-phoi/hook-nhip.mjs";
import { bao, ngayLuot } from "./bao.mjs";
import { KIEM_CHEO } from "./cau-hinh.mjs";
import { duongLan } from "./doc-lan.mjs";
import { layKhoa, pidSong, voiKhoa } from "./khoa.mjs";
import { canMoc, docMoc, ghiMoc, lanGop, tepDoi } from "./moc.mjs";
import { maKyVong, tapCham } from "./tap-cham.mjs";
import { laTepChinh } from "./tep-chinh.mjs";
import { docKetLan, lech } from "./phan-xu.mjs";
import { phanLoai } from "./thu-pham.mjs";

const KQ = KIEM_CHEO.ketQua;
const DUNG_CAY_MAC_DINH =
	"bun install --frozen-lockfile && bun run db:generate";

export function tachCo(argv) {
	const co = {};
	for (let i = 0; i < argv.length; i++) {
		const m = /^--(tu|nhanh|goc)$/.exec(argv[i]);
		if (m) {
			co[m[1]] = argv[i + 1];
			i += 1;
		}
	}
	return co;
}

class VuotTran extends Error {}

function taoChay({ tranMs }) {
	const batDau = Date.now();
	let con = null;
	let vuot = false;
	const hen = setTimeout(() => {
		vuot = true;
		if (con?.pid) {
			try {
				process.kill(-con.pid, "SIGTERM");
			} catch {}
			setTimeout(() => {
				try {
					process.kill(-con.pid, "SIGKILL");
				} catch {}
			}, KIEM_CHEO.luot.dungMemMs).unref();
		}
	}, tranMs);
	hen.unref();
	const chay = (lenh, cwd, { tep } = {}) =>
		new Promise((xong) => {
			if (vuot) throw new VuotTran();
			let ra = "";
			let dau = "";
			con = spawn("bash", ["-c", lenh], {
				cwd,
				detached: true,
				env: process.env,
			});
			const nhan = (b) => {
				ra += b;
			};
			con.stdout.on("data", (b) => {
				dau += b;
				nhan(b);
			});
			con.stderr.on("data", nhan);
			con.on("close", (ma) => {
				con = null;
				if (tep) writeFileSync(tep, ra);
				xong({ ma: ma ?? 1, ra, dau, vuot });
			});
		});
	return {
		chay,
		vuot: () => vuot,
		dong: () => clearTimeout(hen),
		phut: () => (Date.now() - batDau) / KIEM_CHEO.donVi.phutMs,
	};
}

function hoSoTai({ goc, sha }) {
	const dich = join(goc, KIEM_CHEO.thuMuc, `ho-so-${sha.slice(0, 12)}`);
	rmSync(dich, { recursive: true, force: true });
	mkdirSync(dich, { recursive: true });
	execFileSync(
		"bash",
		[
			"-c",
			'set -o pipefail; g="$1" s="$2" d="$3"; shift 3; git -C "$g" archive "$s" -- "$@" | tar -x -C "$d"',
			"kiem-cheo",
			goc,
			sha,
			dich,
			...KIEM_CHEO.tepHoSo,
		],
		{ stdio: ["ignore", "ignore", "pipe"] },
	);
	return dich;
}

function taoKyVong(git) {
	const nho = new Map();
	return (sha, slug, id) => {
		const khoa = `${sha} ${slug}`;
		if (!nho.has(khoa)) {
			let bang = new Map();
			try {
				bang = maKyVong(git("show", `${sha}:_acceptance/${slug}/evals.yaml`));
			} catch {}
			nho.set(khoa, bang);
		}
		return nho.get(khoa).get(id) ?? 0;
	};
}

function coOTai(git, slug, id) {
	return async (sha) => {
		const evals = (() => {
			try {
				return git("show", `${sha}:_acceptance/${slug}/evals.yaml`);
			} catch {
				return null;
			}
		})();
		if (!evals) return false;
		const hopDong = (() => {
			try {
				return git("show", `${sha}:_acceptance/${slug}/contract.md`);
			} catch {
				return "";
			}
		})();
		const trangThai = hopDong.match(/^status:\s*(\S+)/m)?.[1] ?? "";
		return (
			KIEM_CHEO.daKy.includes(trangThai) &&
			new RegExp(`^\\s*- id: ${id}\\s*$`, "m").test(evals)
		);
	};
}

async function dungCay({ git, goc, cay, sha, chay }) {
	if (existsSync(cay)) {
		try {
			git("worktree", "remove", "--force", cay);
		} catch {
			rmSync(cay, { recursive: true, force: true });
			git("worktree", "prune");
		}
	}
	git("worktree", "add", "--detach", "-q", cay, sha);
	const env = join(goc, ".env");
	if (existsSync(env)) symlinkSync(env, join(cay, ".env"));
	const lenh = process.env.KIEM_CHEO_DUNG_CAY ?? DUNG_CAY_MAC_DINH;
	const r = await chay(lenh, cay);
	if (r.vuot) throw new VuotTran();
	if (r.ma !== 0) throw new Error(`dung cay: \`${lenh}\` thoat ${r.ma}`);
}

async function datCay({ git, cay, sha, chay }) {
	git("-C", cay, "checkout", "--detach", "-q", sha);
	const lenh = process.env.KIEM_CHEO_DUNG_CAY ?? DUNG_CAY_MAC_DINH;
	const r = await chay(lenh, cay);
	if (r.vuot) throw new VuotTran();
	if (r.ma !== 0)
		throw new Error(`dung cay o ${sha.slice(0, 9)}: thoat ${r.ma}`);
}

function lenhLan({ goc, tap, cay }) {
	const lan = process.env.KIEM_CHEO_LAN ?? duongLan(goc).tep;
	const slug = tap.flatMap((h) => ["--slug", h.slug]);
	return [
		"node",
		lan,
		"--root",
		cay,
		...slug,
		"--reason",
		"kiem-cheo-sau-gop: luot dem",
	]
		.map((p) => `'${String(p).replace(/'/g, "'\\''")}'`)
		.join(" ");
}

function thongBaoTheoMoiTruong() {
	const lenh = process.env.KIEM_CHEO_THONG_BAO;
	if (!lenh) return undefined;
	return (tieuDe, noiDung) =>
		execFileSync("bash", ["-c", lenh], {
			env: { ...process.env, KCS_TIEU_DE: tieuDe, KCS_NOI_DUNG: noiDung },
		});
}

export async function luot(argv, { now = Date.now } = {}) {
	const co = tachCo(argv);
	const goc = resolve(
		co.goc ??
			execFileSync("git", ["rev-parse", "--show-toplevel"], {
				encoding: "utf8",
			}).trim(),
	);
	const dot = (() => {
		try {
			const d = timThuMucDot(goc);
			return d && pidSong(nodeFs, d) ? d : null;
		} catch {
			return null;
		}
	})();
	const ket = (ketQua) =>
		bao({ goc, ketQua, dot, thongBao: thongBaoTheoMoiTruong(), now });
	try {
		return await luotTho({ co, goc, dot, ket, now });
	} catch (e) {
		ket({
			ket_qua: KQ.loi,
			ly_do: `loi bat ngo: ${String(e.message).split("\n")[0]}`,
		});
		return KIEM_CHEO.ma.loi;
	}
}

async function luotTho({ co, goc, ket, now }) {
	const git = (...a) =>
		execFileSync("git", ["-C", goc, ...a], {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
		}).trim();
	const nhanh = co.nhanh ?? KIEM_CHEO.nhanhChinh;
	const ref = `${KIEM_CHEO.remote}/${nhanh}`;
	let T;
	let D;
	try {
		git("fetch", "-q", KIEM_CHEO.remote, nhanh);
		D = git("rev-parse", ref);
	} catch (e) {
		ket({
			ket_qua: KQ.loi,
			ly_do: `git fetch ${ref} loi: ${String(e.message).split("\n")[0]}`,
		});
		return KIEM_CHEO.ma.loi;
	}
	let lucTruoc = null;
	if (co.tu) {
		T = git("rev-parse", co.tu);
	} else {
		const moc = docMoc({ goc, git, ref });
		if (moc.loi) {
			ket({
				ket_qua: KQ.loi,
				den: D,
				ly_do: `${moc.loi} — chay \`kiem-cheo:chay -- --tu <sha>\` mot lan`,
			});
			return KIEM_CHEO.ma.mocVang;
		}
		T = moc.sha;
		lucTruoc = moc.luc;
	}
	const gop = lanGop(git, T, D);
	const coSo = { tu: T, den: D, lan_gop: gop };
	if (gop.length === 0) {
		ket({ ...coSo, ket_qua: KQ.khongGopMoi, ho_so: [], do: [] });
		if (co.tu) ghiMoc(goc, { sha: D, luc: new Date(now()).toISOString() });
		return KIEM_CHEO.ma.xong;
	}
	const hoSoD = hoSoTai({ goc, sha: D });
	const tap = tapCham({ goc: hoSoD, tepDoi: tepDoi(git, T, D) });
	rmSync(hoSoD, { recursive: true, force: true });
	const ho_so = tap.map((h) => h.slug);
	if (tap.length === 0) {
		ket({ ...coSo, ket_qua: KQ.xanh, ho_so, do: [] });
		ghiMoc(goc, { sha: D, luc: new Date(now()).toISOString() });
		return KIEM_CHEO.ma.xong;
	}
	const cay = join(goc, KIEM_CHEO.thuMuc, KIEM_CHEO.tep.cay);
	const moc = lucTruoc
		? canMoc({
				lucTruoc,
				now: now(),
				lanGop: gop,
				ngayCua: (s) => git("show", "-s", "--format=%cs", s),
			})
		: null;
	const khoa = await layKhoa({ goc, cay, moc });
	if (khoa.ban) {
		ket({
			...coSo,
			ket_qua: KQ.khoaBan,
			ho_so,
			do: [],
			ly_do: `khoa s4 dang o ${khoa.chu}`,
		});
		return KIEM_CHEO.ma.xong;
	}
	const tranMs =
		Number(process.env.KIEM_CHEO_TRAN_PHUT ?? KIEM_CHEO.luot.tranPhut) *
		KIEM_CHEO.donVi.phutMs;
	const may = taoChay({ tranMs });
	const nhip = setInterval(() => {
		try {
			chamNhip({ cwd: cay });
		} catch {}
	}, KIEM_CHEO.khoa.nghiMs);
	try {
		return await voiKhoa(khoa, async () => {
			try {
				await dungCay({ git, goc, cay, sha: D, chay: may.chay });
				const log = join(goc, KIEM_CHEO.thuMuc, `lan-${ngayLuot(now())}.log`);
				const lan = await may.chay(lenhLan({ goc, tap, cay }), cay, {
					tep: log,
				});
				if (lan.vuot) throw new VuotTran();
				if (!KIEM_CHEO.lan.maHopLe.includes(lan.ma)) {
					throw new Error(`lan dung som (ma ${lan.ma}, log ${log})`);
				}
				let doc;
				try {
					doc = docKetLan(lan.dau);
				} catch (e) {
					throw new Error(`${e.message} (ma ${lan.ma}, log ${log})`);
				}
				const suiteDo = doc.suite.filter((s) => s.ma !== 0);
				if (suiteDo.length > 0) {
					throw new Error(
						`suite do o D: ${suiteDo.map((s) => `${s.i} (${s.lenh}) ma ${s.ma}`).join("; ")}`,
					);
				}
				const kyVong = taoKyVong(git);
				const do_ = [];
				for (const e of doc.lech) {
					const chay = async (sha) => {
						await datCay({ git, cay, sha, chay: may.chay });
						const r = await may.chay(e.lenh, cay);
						if (r.vuot) throw new VuotTran();
						return lech(r.ma, kyVong(sha, e.slug, e.id)) ? 1 : 0;
					};
					const kq = await phanLoai({
						D,
						T,
						lanGop: gop,
						chay,
						coO: coOTai(git, e.slug, e.id),
					});
					do_.push({ ho_so: e.slug, eval: e.id, ...kq, lenh: e.lenh });
				}
				if (lan.ma !== 0 && doc.lech.length === 0) {
					throw new Error(
						`lan thoat ${lan.ma} nhung khong doc duoc eval lech nao (log ${log})`,
					);
				}
				const ket_qua = do_.some((d) => d.loai === KIEM_CHEO.loaiDo.doMoi)
					? KQ.do
					: KQ.xanh;
				ket({ ...coSo, ket_qua, ho_so, do: do_ });
				ghiMoc(goc, { sha: D, luc: new Date(now()).toISOString() });
				return KIEM_CHEO.ma.xong;
			} catch (e) {
				const lyDo =
					e instanceof VuotTran || may.vuot()
						? `vuot tran ${KIEM_CHEO.luot.tranPhut} phut`
						: String(e.message).split("\n")[0];
				ket({ ...coSo, ket_qua: KQ.khongChayDuoc, ho_so, do: [], ly_do: lyDo });
				return KIEM_CHEO.ma.xong;
			} finally {
				try {
					git("worktree", "remove", "--force", cay);
				} catch {}
			}
		});
	} finally {
		clearInterval(nhip);
		may.dong();
	}
}

if (laTepChinh(import.meta.url)) {
	luot(process.argv.slice(2))
		.then((ma) => {
			process.exitCode = ma;
		})
		.catch((e) => {
			process.stderr.write(`kiem-cheo: ${e.stack ?? e}\n`);
			process.exitCode = KIEM_CHEO.ma.loi;
		});
}
