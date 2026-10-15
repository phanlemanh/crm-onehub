#!/usr/bin/env bun
/**
 * E16 (AC-14): mười hồ sơ đã ký đo trên trang đơn vị cũ được sửa phép đo rồi ghim
 * lại xanh tại một commit đã có trang mới.
 *
 *   bun _acceptance/trang-don-vi-mot-bang/rang/ghim-nam.mjs
 *
 * 1. Tập hồ sơ rút LÚC CHẠY trên cây tại gốc so (merge-base với origin/onehub,
 *    hoặc `DVB_BASE`): hồ sơ `signed-off` có tệp `rang/` mang dấu cũ, hoặc có eval
 *    mà lệnh `config:` (đọc ở gốc so) chạy một tệp như thế; cộng
 *    `dieu-huong-khu-muc-tieu` (bài `dhk-giu-don`, AC-13). `data-nut-cay` chỉ tính
 *    khi tệp nói tới `theo-don-vi` (cây cài đặt tổ chức vẫn mang dấu này); hợp với
 *    hồ sơ có `rang/` hoặc `evals.yaml` đổi trong commit RIÊNG của lượt (`git rev-list
 *    --no-merges HEAD ^origin/onehub ^feat/dieu-huong-khu-muc-tieu`, thiếu ref → mã 2).
 *    Lệch tập mười hồ sơ khai trong AC-14 → mã 2, gọi tên.
 * 2. Mỗi hồ sơ: dòng `repin` CUỐI của run-log.jsonl có `suites_exit` và
 *    `evals_exit` toàn 0, và `sha` của nó chứa commit đầu tiên của lượt đổi
 *    theo-don-vi.tsx tính từ gốc lượt (`git merge-base --is-ancestor`).
 * 3. Mỗi hồ sơ: diff `rang/` của từng commit riêng của lượt (cùng rev-list ở 1) cộng
 *    thay đổi chưa commit không xoá dòng nào ngoài dòng mang dấu cũ — trừ khối diff
 *    khai tại chỗ bằng một dòng thêm `// AC-14 cach-toi: …`, `// AC-14 loi-hua-moi: …`
 *    hoặc `// F8 neo: …` (thước neo cặp gộp). Dòng chỉ có dấu ngoặc và dòng
 *    `import … from "…"` một dòng không tính (không mang khẳng định).
 *    Gốc lượt (cho mốc trang mới) = merge-base với nhánh DH1 khi nhánh đó chưa vào
 *    onehub, không thì gốc so.
 * 4. Notes của muc-tieu-va-kr/contract.md trỏ trang-don-vi-mot-bang AC-3.
 *
 * Mã thoát: 0 đúng («DUNG AC-14: 10/10») · 1 sai («SAI AC-14: …») · 2 không đo được.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { parseEvals, stripComment } = await import(
	join(GOC, "lib/eval-yaml.cjs")
);

/** Mười hồ sơ AC-14 khai (no-sau-luot-5-okr thêm 15/10: thanh lọc [data-loc-okr] cũ;
 * khung-trang-cai-dat: cau-truc.mjs + evals.yaml đổi trong lượt, okr-soat-anh-luot-3 E11). */
const KHAI = [
	"dat-okr-trong-crm",
	"khung-okr-truoc-r1",
	"muc-tieu-va-kr",
	"okr-to-chuc-va",
	"toan-canh-okr",
	"okr-soat-anh-luot-3",
	"soan-okr-trong-khung",
	"dieu-huong-khu-muc-tieu",
	"no-sau-luot-5-okr",
	"khung-trang-cai-dat",
];
const CONG_THEM = "dieu-huong-khu-muc-tieu";
const TRANG = "apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx";
/** Dấu của trang đơn vị cũ (cây, thẻ đơn vị, hàng nút, nhóm soạn trong thân, thanh lọc, khoá thu). */
const DAU_CU =
	/data-nut-cay|data-hang-nut|data-nhom-soan|data-loc-okr|thuMucTieu|data-don-vi(?![\w-])|cayDonVi|CHU\.donVi|aria-label=['"]?(Cây )?Đơn vị/;
const DAU_GREP =
	"data-nut-cay|data-hang-nut|data-nhom-soan|data-loc-okr|thuMucTieu|data-don-vi|cayDonVi|CHU\\.donVi|Đơn vị";
const KHAI_TAI_CHO = /\/\/ (AC-14 (cach-toi|loi-hua-moi)|F8 neo): \S/;
const CHI_NGOAC = /^[\s()[\]{};,]*$/;
/** Dòng nhập module không mang khẳng định nào. */
const DONG_NHAP = /^\s*import\s.+\sfrom\s+["'][^"']+["'];?\s*$/;

function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}
const git = (...a) => {
	try {
		return execFileSync("git", a, {
			cwd: GOC,
			encoding: "utf8",
			maxBuffer: 256 * 1024 * 1024,
		}).trim();
	} catch (e) {
		khongDo(`git ${a.join(" ")}: ${String(e.message).split("\n")[0]}`);
	}
};
const coRef = (r) =>
	spawnSync("git", ["rev-parse", "--verify", "-q", r], { cwd: GOC }).status ===
	0;
const laToTien = (a, b) =>
	spawnSync("git", ["merge-base", "--is-ancestor", a, b], { cwd: GOC })
		.status === 0;
const tepOGoc = (base, f) => {
	const r = spawnSync("git", ["show", `${base}:${f}`], {
		cwd: GOC,
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	});
	return r.status === 0 ? r.stdout : null;
};

const nhanh = ["origin/onehub", "onehub"].find(coRef);
if (!process.env.DVB_BASE && !nhanh)
	khongDo("khong co origin/onehub hay onehub de rut goc so");
const base = process.env.DVB_BASE ?? git("merge-base", "HEAD", nhanh);
const NHANH_DH1 = "feat/dieu-huong-khu-muc-tieu";
const gocLuot =
	process.env.DVB_BASE ??
	(coRef(NHANH_DH1) && !laToTien(NHANH_DH1, nhanh)
		? git("merge-base", "HEAD", NHANH_DH1)
		: base);
console.log(`goc so: ${base} · goc luot: ${gocLuot}`);
for (const r of [nhanh, NHANH_DH1])
	if (!r || !coRef(r))
		khongDo(`thieu ref ${r ?? "onehub"} de rut commit rieng cua luot`);
const rieng = git(
	"rev-list",
	"--no-merges",
	"HEAD",
	`^${nhanh}`,
	`^${NHANH_DH1}`,
)
	.split("\n")
	.filter(Boolean);
console.log(`commit rieng cua luot: ${rieng.length}`);
const TU_HO_SO = "trang-don-vi-mot-bang";

// 1. Tập hồ sơ rút lúc chạy trên cây tại gốc so.
const ungVien = spawnSync(
	"git",
	["grep", "-l", "-E", DAU_GREP, base, "--", "_acceptance/*/rang/*"],
	{
		cwd: GOC,
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	},
);
if (ungVien.status !== 0 && ungVien.status !== 1)
	khongDo(`git grep dau cu: ${ungVien.stderr}`);
const tepCu = new Set();
for (const dong of ungVien.stdout.split("\n").filter(Boolean)) {
	const f = dong.slice(base.length + 1);
	const chu = tepOGoc(base, f) ?? "";
	const khop = chu.split("\n").filter((l) => DAU_CU.test(l));
	if (khop.length === 0) continue;
	const chiCay = khop.every(
		(l) => !DAU_CU.test(l.replaceAll("data-nut-cay", "")),
	);
	if (chiCay && !chu.includes("theo-don-vi")) continue;
	tepCu.add(f);
}
const cauHinhGoc = tepOGoc(base, "_acceptance/config.yaml");
if (cauHinhGoc === null)
	khongDo("khong doc duoc _acceptance/config.yaml o goc so");
const cauHinh = Bun.YAML.parse(cauHinhGoc);
const giaiRef = (cmd) => {
	if (!cmd.startsWith("config:")) return cmd;
	let o = cauHinh;
	for (const k of cmd.slice("config:".length).split(".")) o = o?.[k];
	return o == null ? "" : String(o);
};
const rut = new Map();
const slugGoc = new Set(
	git("ls-tree", "--name-only", `${base}:_acceptance`)
		.split("\n")
		.filter(Boolean),
);
for (const slug of slugGoc) {
	const hd = tepOGoc(base, `_acceptance/${slug}/contract.md`);
	if (hd === null || !/^status:\s*signed-off\s*$/m.test(hd)) continue;
	const tep = new Set(
		[...tepCu].filter((f) => f.startsWith(`_acceptance/${slug}/rang/`)),
	);
	const ev = tepOGoc(base, `_acceptance/${slug}/evals.yaml`) ?? "";
	for (const e of parseEvals(ev, ["cmd"], stripComment)) {
		const lenh = giaiRef(String(e.cmd ?? "").replace(/^["']|["']$/g, ""));
		for (const f of tepCu) if (lenh.includes(f)) tep.add(f);
	}
	if (tep.size > 0) rut.set(slug, [...tep]);
}
rut.set(CONG_THEM, rut.get(CONG_THEM) ?? ["bai dhk-giu-don (AC-13)"]);
// Hồ sơ đã ký mà lượt này đổi rang/ hoặc evals.yaml trong commit riêng.
for (const c of rieng)
	for (const f of git(
		"diff-tree",
		"--no-commit-id",
		"--name-only",
		"-r",
		c,
	).split("\n")) {
		const m = /^_acceptance\/([^/]+)\/(rang\/.+|evals\.yaml)$/.exec(f);
		if (!m || m[1] === TU_HO_SO) continue;
		const hd = join(GOC, "_acceptance", m[1], "contract.md");
		if (
			!existsSync(hd) ||
			!/^status:\s*signed-off\s*$/m.test(readFileSync(hd, "utf8"))
		)
			continue;
		const ds = rut.get(m[1]) ?? [];
		if (!ds.includes(f)) rut.set(m[1], [...ds, f]);
	}
for (const [slug, tep] of rut) console.log(`HO-SO ${slug}: ${tep.join(", ")}`);
const thua = [...rut.keys()].filter((s) => !KHAI.includes(s));
const thieu = KHAI.filter((s) => !rut.has(s));
if (thua.length > 0 || thieu.length > 0)
	khongDo(
		`tap ho so lech AC-14 — rut them: ${thua.join(", ") || "-"} · thieu: ${thieu.join(", ") || "-"}`,
	);

// Commit đầu tiên của lượt đổi theo-don-vi.tsx.
const moc = git(
	"log",
	"--reverse",
	"--no-merges",
	"--format=%H",
	`${gocLuot}..HEAD`,
	"--",
	TRANG,
).split("\n")[0];
if (!moc) khongDo(`khong co commit nao doi ${TRANG} sau goc luot`);
console.log(`moc trang moi: ${moc}`);

const sai = [];

// 2. Ghim xanh trên một commit có trang mới.
for (const slug of KHAI) {
	const tep = join(GOC, "_acceptance", slug, "run-log.jsonl");
	const dong = existsSync(tep)
		? readFileSync(tep, "utf8")
				.split("\n")
				.filter(Boolean)
				.map((l) => {
					try {
						return JSON.parse(l);
					} catch {
						return null;
					}
				})
				.filter((d) => d?.kind === "repin")
		: [];
	const cuoi = dong.at(-1);
	if (!cuoi) {
		sai.push(`${slug} chua co dong repin`);
		console.log(`SAI AC-14: ${slug} chua co dong repin trong run-log.jsonl`);
		continue;
	}
	const suites = Array.isArray(cuoi.suites_exit) ? cuoi.suites_exit : [];
	const evals = Object.entries(cuoi.evals_exit ?? {});
	const xanh = suites.every((m) => m === 0) && evals.every(([, m]) => m === 0);
	const coTrang =
		/^[0-9a-f]{40}$/.test(String(cuoi.sha ?? "")) && laToTien(moc, cuoi.sha);
	if (!coTrang) {
		sai.push(`${slug} ghim tren ${cuoi.sha} chua co trang moi`);
		console.log(`SAI AC-14: ${slug} ghim tren ${cuoi.sha} chua co trang moi`);
	} else if (!xanh) {
		const maDo = [
			...suites.flatMap((m, i) => (m === 0 ? [] : [`suite#${i}=${m}`])),
			...evals.filter(([, m]) => m !== 0).map(([id, m]) => `${id}=${m}`),
		];
		sai.push(`${slug} ghim do`);
		console.log(`SAI AC-14: ${slug} ghim ${cuoi.sha} do: ${maDo.join(" ")}`);
	} else console.log(`GHIM ${slug}: ${cuoi.sha} xanh`);
}

// 3. Dòng xoá trong rang/ ngoài dấu cũ phải khai tại chỗ.
for (const slug of KHAI) {
	const duong = `_acceptance/${slug}/rang`;
	const cacDiff = [
		...rieng.map((c) => git("diff", `${c}^`, c, "--", duong)),
		git("diff", "HEAD", "--", duong),
	];
	let ngoai = 0;
	const khongKhai = [];
	const khaiTaiCho = [];
	for (const khoi of cacDiff.flatMap((diff) =>
		diff.split(/\n(?=@@ )/).filter((k) => k.startsWith("@@ ")),
	)) {
		const dong = khoi.split("\n");
		const xoa = dong.filter(
			(d) =>
				d.startsWith("-") &&
				!d.startsWith("---") &&
				!DAU_CU.test(d) &&
				!CHI_NGOAC.test(d.slice(1)) &&
				!DONG_NHAP.test(d.slice(1)),
		);
		if (xoa.length === 0) continue;
		ngoai += xoa.length;
		const khai = dong.find((d) => d.startsWith("+") && KHAI_TAI_CHO.test(d));
		if (khai) khaiTaiCho.push(khai.slice(1).trim());
		else khongKhai.push(...xoa.map((d) => d.slice(1).trim()));
	}
	console.log(
		`XOA ${slug}: ${ngoai} dong xoa ngoai dau cu · ${ngoai - khongKhai.length} trong khoi khai tai cho · ${khongKhai.length} khong khai`,
	);
	for (const k of khaiTaiCho) console.log(`  KHAI ${k.slice(3, 200)}`);
	if (khongKhai.length > 0) {
		sai.push(`${slug} xoa ${khongKhai.length} dong ngoai dau cu khong khai`);
		console.log(
			`SAI AC-14: ${slug} xoa ${khongKhai.length} dong ngoai dau cu khong khai`,
		);
		for (const d of khongKhai) console.log(`  - ${d.slice(0, 160)}`);
	}
}

// 4. Notes của muc-tieu-va-kr trỏ AC thay thế.
const hdMtkr = readFileSync(
	join(GOC, "_acceptance/muc-tieu-va-kr/contract.md"),
	"utf8",
);
const notes = hdMtkr.split(/^## Notes\s*$/m)[1]?.split(/^## /m)[0] ?? "";
const coNotes = notes
	.split("\n")
	.some((l) => l.includes("trang-don-vi-mot-bang") && l.includes("AC-3"));
console.log(
	`NOTES muc-tieu-va-kr: ${coNotes ? "co" : "thieu"} dong tro trang-don-vi-mot-bang AC-3`,
);
if (!coNotes)
	sai.push("muc-tieu-va-kr thieu dong Notes tro trang-don-vi-mot-bang AC-3");

if (sai.length === 0) {
	console.log(`DUNG AC-14: ${KHAI.length}/${KHAI.length}`);
	process.exit(0);
}
console.log(`SAI AC-14: ${sai.join(" · ")}`);
process.exit(1);
