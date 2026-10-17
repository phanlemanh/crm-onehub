#!/usr/bin/env bun
/**
 * E13 (AC-11): các eval máy của hồ sơ đã ký chạy những tệp kiểm lượt này sửa vẫn
 * thoát đúng mã kỳ vọng như lúc ký (khuôn `_acceptance/dieu-huong-khu-muc-tieu/rang/
 * ho-so-da-ky.mjs`).
 *
 * Tập tệp kiểm rút LÚC CHẠY: `git diff --name-only <merge-base với origin/onehub>` dưới
 * apps/app/test, apps/agent/test, apps/api/test — cộng mọi tệp kiểm của app nhập một
 * tệp trợ giúp bị sửa (vd okr-don-san.tsx). Tập eval rút từ `_acceptance/* /evals.yaml`
 * của hồ sơ `signed-off`/`machine-cleared`: executor test/script, không khai
 * `status: not-run`, lệnh `config:` giải ra chuỗi nhắc một tệp trong tập.
 *
 * Hai chiều: (1) mọi lệnh đạt mã kỳ vọng trên cây thật; (2) trong MỘT WORKTREE TẠM
 * tiêm `throw` vào cuối một tệp `.dom.tsx` của tập rồi chạy lại các lệnh nhắc nó →
 * mỗi lệnh phải lệch mã kỳ vọng. Cây thật không bị ghi.
 * Mã thoát: 0 hai chiều đúng · 1 sai · 2 không đo được (tập rỗng, đọc hỏng).
 */
import { execFileSync, spawn, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { parseEvals, stripComment, expectedExits } = await import(
	join(GOC, "lib/eval-yaml.cjs")
);
const HO_SO_NAY = "cua-toi-ba-phan";
const THU_MUC = ["apps/app/test", "apps/agent/test", "apps/api/test"];

function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

const git = (cwd, ...a) =>
	execFileSync("git", a, {
		cwd,
		encoding: "utf8",
		maxBuffer: 256 * 1024 * 1024,
	}).trim();
/**
 * Mốc so sánh: mốc mới nhất giữa `onehub` và nhánh DH1 mà DH3 dựng lên — khi DH1 chưa
 * gộp, tệp kiểm DH1 sửa đã được chính hồ sơ DH1 chấm và ký, không phải việc của lượt này.
 * DH1 gộp rồi thì hai mốc trùng nhau.
 */
function mocSoSanh() {
	if (process.env.CTBP_BASE) return process.env.CTBP_BASE;
	const ung = ["origin/onehub", "feat/dieu-huong-khu-muc-tieu"].flatMap((r) => {
		try {
			return [git(GOC, "merge-base", "HEAD", r)];
		} catch {
			return [];
		}
	});
	if (ung.length === 0) khongDo("khong tinh duoc moc so sanh");
	return ung.reduce((moi, x) => {
		try {
			git(GOC, "merge-base", "--is-ancestor", moi, x);
			return x;
		} catch {
			return moi;
		}
	});
}
const base = mocSoSanh();
console.log(`moc so sanh: ${base.slice(0, 9)}`);
const sua = git(GOC, "diff", "--name-only", base, "--", ...THU_MUC)
	.split("\n")
	.filter((f) => f && existsSync(join(GOC, f)));
const laKiem = (f) => /\.(dom\.tsx|spec\.ts|spec\.tsx)$/.test(f);
/** Tệp bản mẫu lượt này sửa — để bắt bộ đo bản mẫu của hồ sơ khác đọc thẳng chúng. */
const vatSua = git(
	GOC,
	"diff",
	"--name-only",
	base,
	"--",
	"apps/app/app/proto/_modules",
)
	.split("\n")
	.filter(Boolean);
const tap = new Set(sua.filter(laKiem).map((f) => basename(f)));
const troGiup = sua
	.filter((f) => f.startsWith("apps/app/test/") && !laKiem(f))
	.map((f) => basename(f).replace(/\.tsx?$/, ""));
for (const f of readdirSync(join(GOC, "apps/app/test"))) {
	if (!laKiem(f)) continue;
	const chu = readFileSync(join(GOC, "apps/app/test", f), "utf8");
	if (troGiup.some((t) => chu.includes(`./${t}"`))) tap.add(f);
}
if (tap.size === 0) khongDo("bo chon rong — khong tep kiem nao bi sua");

const cauHinh = Bun.YAML.parse(
	readFileSync(join(GOC, "_acceptance/config.yaml"), "utf8"),
);
const giaiRef = (cmd) => {
	if (!cmd.startsWith("config:")) return cmd;
	let o = cauHinh;
	for (const k of cmd.slice("config:".length).split(".")) o = o?.[k];
	const lenh = o == null ? "" : String(o);
	return lenh === "" || lenh.startsWith("[object") ? null : lenh;
};

/** Lệnh của eval hồ sơ đã ký KHÁC chạy một tệp kiểm trong `tapChon` (hoặc bộ đo nhắc tệp vật trong `vatChon`). */
function chonViec(tapChon, vatChon) {
	const viec = new Map();
	for (const slug of readdirSync(join(GOC, "_acceptance"))) {
		if (slug === HO_SO_NAY) continue;
		const hd = join(GOC, "_acceptance", slug, "contract.md");
		const ev = join(GOC, "_acceptance", slug, "evals.yaml");
		if (!existsSync(hd) || !existsSync(ev)) continue;
		const tt = /^status:\s*(\S+)/m.exec(readFileSync(hd, "utf8"))?.[1];
		if (tt !== "signed-off" && tt !== "machine-cleared") continue;
		const chuEv = readFileSync(ev, "utf8");
		const { byId: kyVong } = expectedExits(chuEv);
		for (const e of parseEvals(
			chuEv,
			["executor", "cmd", "status"],
			stripComment,
		)) {
			if (!["test", "script"].includes(e.executor) || e.status === "not-run")
				continue;
			const lenh = giaiRef(String(e.cmd ?? "").replace(/^["']|["']$/g, ""));
			if (!lenh) continue;
			let cham = [...tapChon].filter((t) => lenh.includes(t));
			// Lệnh gọi một bộ đo `_acceptance/<hồ sơ>/rang/*.mjs` không nhắc tên tệp kiểm trong
			// chuỗi lệnh — đọc chính script: nhắc một tệp kiểm bị sửa hoặc một tệp vật bị sửa thì
			// tính. Các lệnh này chạy TUẦN TỰ sau đợt song song (có bộ đo tiêm tại chỗ — DH1 r1).
			let tuanTu = false;
			if (cham.length === 0) {
				const rang = /_acceptance\/[\w-]+\/rang\/[\w.-]+\.mjs/.exec(lenh)?.[0];
				if (rang && existsSync(join(GOC, rang))) {
					const chu = readFileSync(join(GOC, rang), "utf8");
					// bộ đo tự chạy lại eval hồ sơ khác (đọc evals.yaml) bỏ — lượt này đã chạy chúng
					if (chu.includes("evals.yaml")) continue;
					cham = [
						...[...tapChon].filter((t) => chu.includes(t)),
						...vatChon.filter((f) => chu.includes(f)),
					];
					tuanTu = cham.length > 0;
				}
			}
			if (cham.length === 0) continue;
			const mong = kyVong.get(e.id) ?? 0;
			const v = viec.get(lenh) ?? { lenh, cham, ai: [], tuanTu };
			v.ai.push({ slug, id: e.id, mong });
			viec.set(lenh, v);
		}
	}
	return viec;
}

/** Đối chứng khi lượt này không chạm tệp nào eval hồ sơ khác chạy: một tệp .dom.tsx đã ký có lệnh chạy thẳng nó. */
const DOI_CHUNG = "gop-y-dung-cho.dom.tsx";
let viec = chonViec(tap, vatSua);
const rong = viec.size === 0;
if (rong) {
	console.log(
		`AC-11: khong eval ho so da ky khac chay ${[...tap].join(", ")} — 0 eval bi luot nay cham; doi chung duong va chieu do tren ${DOI_CHUNG}`,
	);
	viec = chonViec(new Set([DOI_CHUNG]), []);
	if (viec.size === 0)
		khongDo(
			`bo chon rong — doi chung ${DOI_CHUNG} khong con eval da ky nao chay`,
		);
}
console.log(`tep kiem bi cham: ${[...tap].join(", ")}`);
console.log(
	`lenh: ${viec.size} · eval: ${[...viec.values()].reduce((t, v) => t + v.ai.length, 0)}`,
);

function chay(lenh, cwd) {
	const r = spawnSync("bash", ["-c", lenh], {
		cwd,
		encoding: "utf8",
		env: { ...process.env, TZ: "Asia/Ho_Chi_Minh" },
		maxBuffer: 256 * 1024 * 1024,
		timeout: 15 * 60 * 1000,
	});
	return r.status ?? 2;
}

/** Chạy một lệnh không chặn — để bốn lệnh chạy cùng lúc. */
function chayNen(lenh, cwd) {
	return new Promise((xong) => {
		const p = spawn("bash", ["-c", lenh], {
			cwd,
			env: { ...process.env, TZ: "Asia/Ho_Chi_Minh" },
			stdio: "ignore",
		});
		const het = setTimeout(() => p.kill("SIGTERM"), 15 * 60 * 1000);
		p.on("close", (ma) => {
			clearTimeout(het);
			xong(ma ?? 2);
		});
	});
}
const SONG_SONG = 4;

let sai = 0;
let so = 0;
const dsViec = [...viec.values()];
const songSong = dsViec.filter((v) => !v.tuanTu);
const maCua = new Map();
let ke = 0;
await Promise.all(
	Array.from({ length: SONG_SONG }, async () => {
		while (ke < songSong.length) {
			const v = songSong[ke++];
			maCua.set(v.lenh, await chayNen(v.lenh, GOC));
		}
	}),
);
for (const v of dsViec.filter((x) => x.tuanTu))
	maCua.set(v.lenh, await chayNen(v.lenh, GOC));
/** Dựng worktree tạm ở `rev` (node_modules và .env trỏ cây thật); trả đường dẫn và hàm dọn. */
function dungSao(rev, tienTo) {
	const tam = mkdtempSync(join(tmpdir(), tienTo));
	const sao = join(tam, "crm");
	for (let lan = 1; ; lan += 1) {
		try {
			git(GOC, "worktree", "add", "--detach", "--quiet", sao, rev);
			break;
		} catch (e) {
			if (lan >= 6) throw e;
			Atomics.wait(
				new Int32Array(new SharedArrayBuffer(4)),
				0,
				0,
				500 * lan + Math.floor(Math.random() * 500),
			);
		}
	}
	for (const nm of git(
		GOC,
		"ls-files",
		"-o",
		"--directory",
		"--exclude-standard",
		"-i",
	)
		.split("\n")
		.filter(
			(d) =>
				/(^|\/)node_modules\/$/.test(d) &&
				!d.slice(0, -1).includes("node_modules/"),
		)) {
		const dich = join(sao, nm.slice(0, -1));
		if (!existsSync(dich)) symlinkSync(join(GOC, nm.slice(0, -1)), dich);
	}
	if (existsSync(join(GOC, ".env")))
		symlinkSync(join(GOC, ".env"), join(sao, ".env"));
	const don = () => {
		try {
			git(GOC, "worktree", "remove", "--force", sao);
		} catch {}
		rmSync(tam, { recursive: true, force: true });
		try {
			git(GOC, "worktree", "prune");
		} catch {}
	};
	return { sao, tam, don };
}

// Lệnh lệch mã: chạy lại trên CÂY GỐC (mốc so sánh). Gốc cũng lệch đúng mã đó → đỏ sẵn,
// không phải do lượt này — «không đọc được ở đây» (vd bộ đo đọc lịch sử git của onehub).
const lech = dsViec.filter((v) =>
	v.ai.some((a) => maCua.get(v.lenh) !== a.mong),
);
const maGoc = new Map();
if (lech.length > 0) {
	const goc = dungSao(base, "ctbp-goc-");
	try {
		for (const v of lech) maGoc.set(v.lenh, await chayNen(v.lenh, goc.sao));
	} finally {
		goc.don();
	}
}
/**
 * Eval «gắn lượt»: lệnh chỉ khẳng định một tệp KHÔNG đổi so với nhánh chính
 * (`git diff --quiet $(git merge-base HEAD origin/onehub) -- <tệp>`) — nó đo lượt của
 * chính hồ sơ đó, không đo hành vi; trên nhánh chính luôn xanh, trên mọi nhánh sửa tệp
 * ấy luôn đỏ. Ghi riêng, không tính — dòng sổ của lượt nêu rõ để người quyết ở Cổng 2.
 */
const ganLuot = (lenh) =>
	/^git diff --quiet \$\(git merge-base HEAD origin\/onehub\) -- \S+/.test(
		lenh,
	);
let doSan = 0;
for (const v of dsViec) {
	const ma = maCua.get(v.lenh);
	for (const a of v.ai) {
		so += 1;
		const dung = ma === a.mong;
		const san = !dung && maGoc.get(v.lenh) === ma;
		const gan = !dung && !san && ganLuot(v.lenh);
		if (san || gan) doSan += 1;
		else if (!dung) sai += 1;
		if (gan) {
			console.log(
				`GAN LUOT (chi so diff tep voi onehub, khong do hanh vi): ${a.slug}#${a.id}: ${ma} (mong ${a.mong})`,
			);
			continue;
		}
		console.log(
			`${dung ? "HO-SO" : san ? "DO SAN (khong doc duoc o day, goc cung " + ma + "):" : "SAI AC-11:"} ${a.slug}#${a.id}: ${ma} (mong ${a.mong})`,
		);
	}
}
console.log(
	sai === 0
		? rong
			? `DUNG AC-11: 0 eval ho so da ky khac bi luot nay cham · doi chung duong ${so - doSan}/${so - doSan} eval ${DOI_CHUNG}`
			: `DUNG AC-11: ${so - doSan}/${so - doSan} eval ho so da ky${doSan ? ` · ${doSan} do san tren goc hoac gan luot` : ""}`
		: `SAI AC-11: ${sai}/${so} eval lech ma ky vong`,
);

// Ứng viên chiều đỏ: lệnh chạy THẲNG một tệp .dom.tsx (không phải bộ đo rang/ đọc tĩnh)
// và đạt mã kỳ vọng trên cây thật.
const ungVien = dsViec.find(
	(v) =>
		!v.tuanTu &&
		v.ai.every((a) => maCua.get(v.lenh) === a.mong) &&
		v.cham.some((t) => t.endsWith(".dom.tsx") && v.lenh.includes(t)),
);
if (!ungVien) khongDo("chieu do: khong lenh nao cham mot tep .dom.tsx de tiem");
const tepTiem = ungVien.cham.find((t) => t.endsWith(".dom.tsx"));
const tam = mkdtempSync(join(tmpdir(), "ctbp-ho-so-"));
const sao = join(tam, "crm");
let doDung = false;
try {
	// Lượt chấm chạy nhiều bộ đo song song trên cùng kho — `git worktree add` có thể
	// giành khoá của nhau; thử lại có giãn cách thay vì báo «không đo được».
	for (let lan = 1; ; lan += 1) {
		try {
			git(GOC, "worktree", "add", "--detach", "--quiet", sao, "HEAD");
			break;
		} catch (e) {
			if (lan >= 6) throw e;
			Atomics.wait(
				new Int32Array(new SharedArrayBuffer(4)),
				0,
				0,
				500 * lan + Math.floor(Math.random() * 500),
			);
		}
	}
	const va = git(GOC, "diff", "HEAD", "--binary");
	if (va) {
		writeFileSync(join(tam, "va.patch"), `${va}\n`);
		git(sao, "apply", "--whitespace=nowarn", join(tam, "va.patch"));
	}
	for (const nm of git(
		GOC,
		"ls-files",
		"-o",
		"--directory",
		"--exclude-standard",
		"-i",
	)
		.split("\n")
		.filter(
			(d) =>
				/(^|\/)node_modules\/$/.test(d) &&
				!d.slice(0, -1).includes("node_modules/"),
		)) {
		const dich = join(sao, nm.slice(0, -1));
		if (!existsSync(dich)) symlinkSync(join(GOC, nm.slice(0, -1)), dich);
	}
	if (existsSync(join(GOC, ".env")))
		symlinkSync(join(GOC, ".env"), join(sao, ".env"));
	const tep = join(sao, "apps/app/test", tepTiem);
	writeFileSync(
		tep,
		`${readFileSync(tep, "utf8")}\nthrow new Error("ctbp-pha-ho-so");\n`,
	);
	const ma = chay(ungVien.lenh, sao);
	doDung = ungVien.ai.every((a) => ma !== a.mong);
	for (const a of ungVien.ai)
		console.log(
			`${ma !== a.mong ? "SAI AC-11 (pha thu, dung ky vong):" : "LOT pha thu:"} ${a.slug}#${a.id}: ${ma} (mong ${a.mong})`,
		);
} catch (e) {
	khongDo(`worktree tam: ${String(e).slice(0, 300)}`);
} finally {
	try {
		git(GOC, "worktree", "remove", "--force", sao);
	} catch {}
	rmSync(tam, { recursive: true, force: true });
	try {
		git(GOC, "worktree", "prune");
	} catch {}
}
console.log(
	doDung
		? `DUNG AC-11 chieu do: tiem loi vao ${tepTiem} (worktree tam) lam lenh lech ma`
		: "SAI AC-11 chieu do: tiem loi ma lenh van dat",
);
const ket = sai === 0 && doDung;
console.log(ket ? "KET LUAN: dat" : "KET LUAN: sai");
process.exit(ket ? 0 : 1);
