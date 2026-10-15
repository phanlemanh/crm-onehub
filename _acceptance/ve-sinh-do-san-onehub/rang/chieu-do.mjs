import { spawnSync } from "node:child_process";
import {
	appendFileSync,
	cpSync,
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const LAYOUT = "apps/app/app/(app)/[slug]/layout.tsx";
const DUOI_LOG = 20;

function git(goc, ...thamSo) {
	const r = spawnSync("git", ["-C", goc, ...thamSo], { encoding: "utf8" });
	if (r.status !== 0)
		throw new Error(`git ${thamSo.join(" ")}: ${r.stderr.trim()}`);
	return r.stdout;
}

function thayMotLan(chu, cu, moi, ca) {
	const lan = chu.split(cu).length - 1;
	if (lan !== 1) {
		console.log(
			`KHONG DO DUOC: dot bien ${ca} khong ap duoc (${lan} cho khop thay vi 1)`,
		);
		process.exit(2);
	}
	return chu.replace(cu, moi);
}

function suaTep(goc, tep, ham) {
	const duong = join(goc, tep);
	writeFileSync(duong, ham(readFileSync(duong, "utf8")));
}

const CA = {
	hydrat: {
		caiDayDu: true,
		ap: (sao) => {
			const mb = git(GOC, "merge-base", "HEAD", "origin/onehub").trim();
			writeFileSync(join(sao, LAYOUT), git(GOC, "show", `${mb}:${LAYOUT}`));
		},
		lenh: [
			"bun",
			"scripts/lan-do/tien-de.mjs",
			"--chay",
			"bun _acceptance/ve-sinh-do-san-onehub/rang/hydrat-record.mjs --mong-do",
		],
		dat: (r) => r.status === 0 && /MONG DO: k=[1-9]/.test(r.out),
		baoDat: (r) => {
			const m = r.out.match(/MONG DO: k=(\d+) tai-hien=(.*)/);
			return `CHIEU DO DAT: ${m?.[1]} loi hydrat tren ban sao khong nap san; o tai hien: ${m?.[2]}`;
		},
		baoHong: "CHIEU DO HONG: ban sao khong nap san ma khong o nao tai hien",
	},
	"nap-san": {
		ap: (sao) =>
			suaTep(sao, "apps/app/lib/ngan-ban-ghi-nap-san.ts", (s) =>
				thayMotLan(
					s,
					'dayDu: ["okr.access", "users.list", "giaiDoan.list"]',
					'dayDu: ["okr.access", "giaiDoan.list"]',
					"nap-san",
				),
			),
		lenh: [
			"bash",
			"-c",
			"cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/ngan-ban-ghi-nap-san.dom.tsx",
		],
		dat: (r) =>
			r.status !== 0 &&
			r.out.includes("trang doc rong luc hydrate: users.list"),
	},
	403: {
		ap: (sao) =>
			suaTep(sao, "apps/app/app/(app)/[slug]/okr/soan/dung-cuoc-soan.ts", (s) =>
				thayMotLan(s, " && laNguoiMo,", ",", "403"),
			),
		lenh: [
			"bash",
			"-c",
			"cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/soan-okr-nguoi-xem-khong-mo.dom.tsx",
		],
		dat: (r) => r.status !== 0 && r.out.includes("tai luong cuoc nguoi khac"),
	},
	"moi-chuoi-khai": {
		ap: (sao) =>
			suaTep(
				sao,
				"_acceptance/man-cai-dat-noi-tieng-viet/rang/khong-phai-chu-nguoi-doc.json",
				(s) => {
					const khai = JSON.parse(s);
					const truoc = khai.thuoc_jsx_ky_thuat.length;
					khai.thuoc_jsx_ky_thuat = khai.thuoc_jsx_ky_thuat.filter(
						(t) => t !== "hinh",
					);
					if (khai.thuoc_jsx_ky_thuat.length !== truoc - 1) {
						console.log(
							"KHONG DO DUOC: dot bien moi-chuoi-khai khong ap duoc (ban khai chua co hinh)",
						);
						process.exit(2);
					}
					return `${JSON.stringify(khai, null, "\t")}\n`;
				},
			),
		lenh: ["node", "_acceptance/man-cai-dat-noi-tieng-viet/rang/moi-chuoi.mjs"],
		dat: (r) =>
			r.status === 1 &&
			r.out.includes('settings/page.tsx:39 [thuoc:hinh] "the"') &&
			r.out.includes('settings/currencies/page.tsx:36 [thuoc:hinh] "the"'),
	},
	"moi-chuoi-that": {
		ap: (sao) =>
			suaTep(sao, "apps/app/app/(app)/[slug]/settings/page.tsx", (s) =>
				thayMotLan(
					s,
					'<Suspense fallback={<KhungXuong hinh="the" />}>',
					'<p>Loading settings</p>\n\t\t\t\t<Suspense fallback={<KhungXuong hinh="the" />}>',
					"moi-chuoi-that",
				),
			),
		lenh: ["node", "_acceptance/man-cai-dat-noi-tieng-viet/rang/moi-chuoi.mjs"],
		dat: (r) =>
			r.status === 1 &&
			/CON TIENG ANH: .*settings\/page\.tsx:\d+ .*"Loading settings"/.test(
				r.out,
			),
	},
};

function chupCay(goc) {
	const trangThai = git(goc, "status", "--porcelain", "-uall");
	const tep = trangThai
		.split("\n")
		.filter(Boolean)
		.map((d) => d.slice(3).replace(/^"|"$/g, ""))
		.filter((d) => existsSync(join(goc, d)));
	const bam = tep.length
		? git(goc, "hash-object", "--", ...tep)
				.trim()
				.split("\n")
		: [];
	return new Map([
		["#trang-thai", trangThai],
		...tep.map((d, i) => [d, bam[i]]),
	]);
}

function khacCay(truoc, sau) {
	const khoa = new Set([...truoc.keys(), ...sau.keys()]);
	return [...khoa].filter((k) => truoc.get(k) !== sau.get(k));
}

function tuThuCay() {
	const o = mkdtempSync(join(tmpdir(), "chieu-do-tu-thu-"));
	try {
		git(o, "init", "-q");
		writeFileSync(join(o, "a.txt"), "goc\n");
		git(o, "add", "a.txt");
		git(o, "-c", "user.email=t@t", "-c", "user.name=t", "commit", "-qm", "goc");
		writeFileSync(join(o, "a.txt"), "goc\nsua\n");
		const truoc = chupCay(o);
		appendFileSync(join(o, "a.txt"), "x");
		const lech = khacCay(truoc, chupCay(o));
		if (!lech.includes("a.txt")) {
			console.log(
				"HONG tu kiem cay: ghi mot byte vao tep dang sua ma khong thay",
			);
			return false;
		}
		console.log(
			`CHIEU DO GHI CAY ${lech.filter((k) => k !== "#trang-thai").join(", ")} (tu kiem)`,
		);
		console.log("OK tu kiem cay");
		return true;
	} finally {
		rmSync(o, { recursive: true, force: true });
	}
}

function noiNodeModules(sao) {
	const tim = (thuMuc, sau) => {
		if (sau > 3) return [];
		return readdirSync(join(GOC, thuMuc), { withFileTypes: true })
			.filter((m) => m.isDirectory() && !m.name.startsWith("."))
			.flatMap((m) => {
				const con = thuMuc ? `${thuMuc}/${m.name}` : m.name;
				if (m.name === "node_modules") return [con];
				return tim(con, sau + 1);
			});
	};
	for (const d of tim("", 0))
		if (!existsSync(join(sao, d))) symlinkSync(join(GOC, d), join(sao, d));
}

function dungBanSao(caiDayDu) {
	const sao = mkdtempSync(join(tmpdir(), "chieu-do-"));
	rmSync(sao, { recursive: true, force: true });
	git(GOC, "worktree", "add", "--detach", sao, "HEAD");
	symlinkSync(join(GOC, ".env"), join(sao, ".env"));
	cpSync(
		join(GOC, "packages/db/src/generated"),
		join(sao, "packages/db/src/generated"),
		{ recursive: true },
	);
	if (caiDayDu) {
		const cai = spawnSync("bun", ["install", "--frozen-lockfile"], {
			cwd: sao,
			encoding: "utf8",
		});
		if (cai.status !== 0) {
			console.log(`KHONG DO DUOC: bun install trong ban sao ma ${cai.status}`);
			go(sao);
			process.exit(2);
		}
	} else noiNodeModules(sao);
	return sao;
}

function go(sao) {
	spawnSync("git", ["-C", GOC, "worktree", "remove", "--force", sao]);
	rmSync(sao, { recursive: true, force: true });
	spawnSync("git", ["-C", GOC, "worktree", "prune"]);
}

const chon = process.argv.flatMap((a, i) =>
	process.argv[i - 1] === "--ca" ? [a] : [],
);

if (process.argv.includes("--tu-thu-cay")) process.exit(tuThuCay() ? 0 : 1);

if (chon.length === 0 || chon.some((c) => !(c in CA))) {
	console.log(
		`KHONG DO DUOC: --ca phai la mot trong ${Object.keys(CA).join(", ")}`,
	);
	process.exit(2);
}

const truoc = chupCay(GOC);
let hong = 0;

for (const ten of chon) {
	const ca = CA[ten];
	const sao = dungBanSao(ca.caiDayDu === true);
	try {
		ca.ap(sao);
		const r = spawnSync(ca.lenh[0], ca.lenh.slice(1), {
			cwd: sao,
			encoding: "utf8",
			maxBuffer: 256 * 1024 * 1024,
		});
		const kq = { status: r.status, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
		for (const d of kq.out.split("\n"))
			if (/^(O D\d|HONG |MONG DO)/.test(d)) console.log(`  ${d}`);
		if (ca.dat(kq))
			console.log(ca.baoDat ? ca.baoDat(kq) : `CHIEU DO DAT: ${ten}`);
		else {
			hong += 1;
			console.log(`${ca.baoHong ?? `CHIEU DO HONG: ${ten}`} (ma ${kq.status})`);
			console.log(kq.out.trim().split("\n").slice(-DUOI_LOG).join("\n"));
		}
	} finally {
		go(sao);
	}
}

const lech = khacCay(truoc, chupCay(GOC));
for (const t of lech) console.log(`CHIEU DO GHI CAY ${t}`);

process.exit(hong > 0 || lech.length > 0 ? 1 : 0);
