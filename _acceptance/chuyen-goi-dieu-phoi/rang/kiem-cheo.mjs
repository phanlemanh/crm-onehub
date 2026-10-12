import { execFileSync, spawnSync } from "node:child_process";
import {
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	realpathSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { GOC, Ket, khongDoDuoc, moiTruongSach, thuMucTam } from "./chung.mjs";
import { BIEN, giaiGoi, napGoi } from "./goi.mjs";

const ket = new Ket();
const goi = giaiGoi();
process.env[BIEN] = goi.goc;
const KC = join(GOC, "scripts", "kiem-cheo");
const DON = "kiem-cheo-s4.json";
const [dotMod, nhipMod, hinh, lich, ghi, goiDot] = await Promise.all(
	["dot", "hook-nhip", "hinh-dang", "lich", "ghi", "goi-dot"].map((t) => napGoi(goi, `scripts/${t}.mjs`)),
);
const nap = (thuMuc, tep) => import(pathToFileURL(join(thuMuc, tep)).href);
const tamDon = [];
const tam = (ten) => {
	const d = thuMucTam(ten);
	tamDon.push(d);
	return d;
};

async function cungHam(thuMucKc) {
	const g = await (await nap(thuMucKc, "goi-dieu-phoi.mjs")).napGoiDieuPhoi();
	const doDs = [];
	if (g.timThuMucDot !== dotMod.timThuMucDot) doDs.push("DO khac-ham timThuMucDot");
	if (g.chamNhip !== nhipMod.chamNhip) doDs.push("DO khac-ham chamNhip");
	return doDs;
}

async function donKiemCheo(thuMucKc, { dot, cap = true }) {
	const { layKhoa } = await nap(thuMucKc, "khoa.mjs");
	const goc = join(dot, "..");
	const cay = join(goc, "cay-kiem-cheo");
	let don = null;
	const kq = await layKhoa({
		goc,
		cay,
		timDot: () => dot,
		choToiDaMs: 60_000,
		now: () => (!cap && don ? Number.MAX_SAFE_INTEGER : Date.now()),
		cho: async () => {
			const p = join(dot, "xin", DON);
			if (!don && existsSync(p)) don = JSON.parse(readFileSync(p, "utf8"));
			if (cap) {
				mkdirSync(join(dot, "khoa", "s4"), { recursive: true });
				writeFileSync(join(dot, "khoa", "s4", "chu.json"), JSON.stringify({ phien: "kiem-cheo", worktree: cay }));
			}
		},
	});
	if (!kq.ban) kq.tra();
	const doDs = [];
	if (!don) doDs.push("DO khong-co-don");
	else {
		try {
			hinh.kiemDon(don);
		} catch (e) {
			doDs.push(`DO don-sai-khuon ${e.message}`);
		}
		if ("moc" in don) doDs.push(`DO don-co-moc ${don.moc}`);
	}
	return { don, doDs };
}

function dotGia(ten) {
	const d = join(tam(ten), "dot");
	mkdirSync(join(d, "xin"), { recursive: true });
	mkdirSync(join(d, "khoa"), { recursive: true });
	writeFileSync(join(d, "phat-lich.pid"), String(process.pid));
	return d;
}

function banSao(ten, sua) {
	const goc = tam(`kc-${ten}`);
	const kc = join(goc, "scripts", "kiem-cheo");
	cpSync(KC, kc, { recursive: true });
	cpSync(join(GOC, "scripts", "resolve-plugin.mjs"), join(goc, "scripts", "resolve-plugin.mjs"));
	sua(kc, goc);
	return kc;
}

const suaTep = (p, f) => writeFileSync(p, f(readFileSync(p, "utf8")));

try {
	const ham = await cungHam(KC);
	ket.kiem(ham.length === 0, "cung-ham timThuMucDot, chamNhip", ham.join(" | "));

	const that = await donKiemCheo(KC, { dot: dotGia("don") });
	ket.kiem(!that.doDs.some((d) => d.startsWith("DO don-sai") || d.startsWith("DO khong")), "don-qua-kiemDon", that.doDs.join(" | "));
	ket.kiem(!that.doDs.some((d) => d.startsWith("DO don-co-moc")), "don-khong-moc", that.doDs.join(" | "));

	const t = spawnSync("node", ["--test", "scripts/kiem-cheo/test/*.test.mjs"], {
		cwd: GOC,
		encoding: "utf8",
		env: moiTruongSach(),
		maxBuffer: 64 * 1024 * 1024,
	});
	const so = (nhan) => Number((new RegExp(`^ℹ ${nhan} (\\d+)`, "m").exec(t.stdout) ?? [])[1] ?? Number.NaN);
	ket.kiem(t.status === 0 && so("fail") === 0 && so("tests") > 0, `bai kiem-cheo: ${so("tests")} ca, fail ${so("fail")}`, `ma ${t.status}; ${t.stdout.split("\n").filter((d) => /^not ok|✖/.test(d)).slice(0, 3).join(" | ")}`);

	const R = tam("xep");
	execFileSync("git", ["init", "-q", R], { env: moiTruongSach() });
	const r2 = goiDot.docGoi(join(GOC, "docs", "plan", "dot-r2"), { gocKho: GOC });
	const hv = structuredClone(r2.hangViec);
	if (hv.hang.length === 0 || hv.hang.some((h) => !h.moc)) khongDoDuoc("goi dot r2 co hang khong mang moc hoac khong co hang");
	for (const d of hv.day) {
		mkdirSync(join(R, d.id));
		d.worktree = realpathSync(join(R, d.id));
	}
	const D = join(R, ".acceptance-runs", "dieu-phoi-r2");
	mkdirSync(join(D, "xin"), { recursive: true });
	mkdirSync(join(D, "khoa"), { recursive: true });
	symlinkSync(D, join(R, ".acceptance-runs", "dieu-phoi-hien-tai"));
	writeFileSync(join(D, "hang-viec.json"), JSON.stringify(hv, null, 2));
	writeFileSync(join(D, "phat-lich.pid"), String(process.pid));
	const kc = await donKiemCheo(KC, { dot: realpathSync(D), cap: false });
	if (!kc.don) khongDoDuoc("khong chup duoc don kiem-cheo");
	await new Promise((x) => setTimeout(x, 20));
	const tho = [];
	for (const h of hv.hang) {
		const p = ghi.ghiDon(join(R, h.day), { loai: "s4", slug: h.slug });
		tho.push(JSON.parse(readFileSync(p, "utf8")));
		rmSync(p);
	}
	if (tho.some((d) => d.luc <= kc.don.luc)) khongDoDuoc("gio xin cua don tho khong sau don kiem-cheo");
	writeFileSync(join(D, "xin", DON), JSON.stringify(kc.don));
	const tuXin = readdirSync(join(D, "xin")).map((f) => JSON.parse(readFileSync(join(D, "xin", f), "utf8")));
	const thuTu = (ds) => lich.xepHang(ds, hv).map((d) => d.phien);
	const xep = thuTu([...tho, ...tuXin]);
	ket.kiem(xep.at(-1) === "kiem-cheo" && xep.length === tho.length + 1, `kiem-cheo-cuoi sau ${tho.length} don tho`, `thu tu: ${xep.join(",")}`);
	const coMoc = thuTu([...tho, { ...kc.don, moc: "2026-10-01" }]);
	ket.kiem(coMoc.indexOf("kiem-cheo") < coMoc.length - 1, "doi-chung-moc (kiem-cheo co moc som dung truoc mot don tho)", "thuoc hong: doi-chung-moc");
	const boSlug = thuTu([...tho.map(({ slug, ...con }) => con), kc.don]);
	ket.kiem(boSlug[0] === "kiem-cheo", "doi-chung-gio (don tho mat slug thi kiem-cheo dung dau)", `thuoc hong: doi-chung-gio — ${boSlug.join(",")}`);

	const kcMoc = banSao("moc", (thuMuc) =>
		suaTep(join(thuMuc, "khoa.mjs"), (x) => x.replace("\t\t\tuoc_phut: uocPhut,\n", '\t\t\tuoc_phut: uocPhut,\n\t\t\tmoc: "2026-10-01",\n')),
	);
	ket.bat("khoa-ghi-moc", (await donKiemCheo(kcMoc, { dot: dotGia("don-moc") })).doDs, "DO don-co-moc");
	const goiKhac = join(tam("goi-khac"), "goi");
	cpSync(goi.goc, goiKhac, { recursive: true });
	const kcKhac = banSao("khac", (thuMuc) =>
		suaTep(join(thuMuc, "goi-dieu-phoi.mjs"), (x) =>
			`import { timThuMucDot as khac } from ${JSON.stringify(pathToFileURL(join(goiKhac, "scripts", "dot.mjs")).href)};\n${x.replace("timThuMucDot: dot.timThuMucDot,", "timThuMucDot: khac,")}`,
		),
	);
	ket.bat("goi-khac-ham", await cungHam(kcKhac), "DO khac-ham timThuMucDot");
} finally {
	for (const d of tamDon) rmSync(d, { recursive: true, force: true });
}
ket.ket();
