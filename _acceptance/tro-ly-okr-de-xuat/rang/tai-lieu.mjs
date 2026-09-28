import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const TEP_CONTEXT = join(GOC, "CONTEXT.md");
const TEP_API = join(GOC, "docs", "api.md");
const TEP_AGENT = join(GOC, "docs", "agent.md");
const TEP_ROUTER = join(GOC, "apps", "api", "src", "okr", "okr.router.ts");

const MUC_CHE_DO_AN = "**Chế độ ẩn**";
const MUC_CHO_RE_9B = "## Chỗ rẽ: Trợ lý OKR (lượt 9b)";

function doc(tep) {
	return readFileSync(tep, "utf8");
}

function git(...thamSo) {
	return execFileSync("git", ["-C", GOC, ...thamSo], { encoding: "utf8" });
}

// Cắt một mục H2 (hoặc một đoạn bắt đầu bằng một chuỗi bất kỳ) tới ranh giới kế
// tiếp cùng cấp hoặc cao hơn — dùng cho cả tiêu đề "## " và tiêu đề từ điển "**".
function muc(noiDung, tieuDe, ranhGioi) {
	const batDau = noiDung.indexOf(tieuDe);
	if (batDau === -1) return null;
	const ket = noiDung.indexOf(ranhGioi, batDau + tieuDe.length);
	return noiDung.slice(batDau, ket === -1 ? undefined : ket);
}

function mucH2(noiDung, tieuDe) {
	const dong = noiDung.split("\n");
	const batDau = dong.findIndex((d) => d.startsWith(tieuDe));
	if (batDau === -1) return null;
	let ket = dong.length;
	for (let i = batDau + 1; i < dong.length; i += 1) {
		if (/^## /.test(dong[i])) {
			ket = i;
			break;
		}
	}
	return dong.slice(batDau, ket).join("\n");
}

// 1. CONTEXT.md — mục «Chế độ ẩn» phải có, kèm dòng _Avoid_ bên trong đúng mục đó
// (không phải _Avoid_ của mục từ điển kế tiếp).
function kiemContext() {
	const doan = muc(doc(TEP_CONTEXT), MUC_CHE_DO_AN, "\n\n**");
	if (doan === null) {
		return ["CONTEXT.md thieu muc «Che do an»"];
	}
	if (!doan.includes("_Avoid_")) {
		return ["CONTEXT.md muc «Che do an» thieu dong _Avoid_"];
	}
	return [];
}

// 2. Danh sách thủ tục rút từ okr.router.ts lúc chạy, không chép tay: mọi
// phương thức tên troLy* hoặc xuHuongKr được định nghĩa trong router (dòng bắt
// đầu bằng một tab rồi tới tên rồi dấu ngoặc mở — đúng khuôn `nestjs-trpc`
// dùng cho toàn bộ `okr.router.ts`).
function tenThuTucTuRouter() {
	const noiDung = doc(TEP_ROUTER);
	const ten = new Set();
	for (const m of noiDung.matchAll(/^\t(troLy[A-Za-z]+|xuHuongKr)\(/gm)) {
		ten.add(m[1]);
	}
	return ten;
}

// docs/api.md §OKR phải nêu đủ tên của từng thủ tục đó.
function kiemApiMd() {
	const okr = mucH2(doc(TEP_API), "## OKR");
	if (okr === null) return ["docs/api.md thieu muc «## OKR»"];
	const thieu = [...tenThuTucTuRouter()].filter((ten) => !okr.includes(ten));
	return thieu
		.sort()
		.map((ten) => `tai lieu thieu thu tuc: ${ten}`);
}

// 3. Tệp của hãng trong diff của lượt: git diff so với merge-base(HEAD,
// origin/onehub), giao với danh sách tệp có ở origin/release. CI checkout nông
// có thể thiếu một trong hai ref — khi đó bỏ qua phần kiểm này, không đỏ giả.
function tapTepHangTrongDiff() {
	try {
		const goc = git("merge-base", "HEAD", "origin/onehub").trim();
		const doi = git("diff", "--name-only", goc, "HEAD")
			.split("\n")
			.filter(Boolean);
		const coORelease = new Set(
			git("ls-tree", "-r", "--name-only", "origin/release")
				.split("\n")
				.filter(Boolean),
		);
		return new Set(doi.filter((tep) => coORelease.has(tep)));
	} catch (loi) {
		console.warn(
			`tai-lieu: khong tinh duoc git diff giao release (${String(loi.message ?? loi).split("\n")[0]}) — bo qua kiem cho re 9b`,
		);
		return null;
	}
}

function tapTepTrongMucChoRe(noiDung) {
	const doan = mucH2(noiDung, MUC_CHO_RE_9B);
	if (doan === null) return null;
	return new Set([...doan.matchAll(/^- `([^`]+)`/gm)].map((m) => m[1]));
}

// docs/agent.md phải có mục chỗ rẽ 9b, và mục đó phải liệt đúng — không thiếu,
// không thừa — tập tệp của hãng mà lượt này chạm.
function kiemAgentMd() {
	const tapDoc = tapTepTrongMucChoRe(doc(TEP_AGENT));
	if (tapDoc === null) {
		return [`docs/agent.md thieu muc «${MUC_CHO_RE_9B}»`];
	}
	const tapDiff = tapTepHangTrongDiff();
	if (tapDiff === null) return [];
	const thieu = [...tapDiff].filter((t) => !tapDoc.has(t));
	const thua = [...tapDoc].filter((t) => !tapDiff.has(t));
	return [
		...thieu.map((t) => `tai lieu thieu tep hang: ${t}`),
		...thua.map((t) => `tai lieu thua tep hang (khong con trong diff giao release): ${t}`),
	];
}

const loi = [...kiemContext(), ...kiemApiMd(), ...kiemAgentMd()];

if (loi.length > 0) {
	for (const dong of loi) console.error(dong);
	process.exit(1);
}

console.log(
	`tai-lieu: CONTEXT.md, docs/api.md (${tenThuTucTuRouter().size} thu tuc), docs/agent.md deu du.`,
);
