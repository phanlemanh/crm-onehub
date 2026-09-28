import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const NHANH_CHINH = "origin/onehub";
const THU_MUC_CAM = [
	"_acceptance/nguon-keo-tha-reui/",
	"_acceptance/may-soan-de-xuat/",
];
const TEP_CAM = [
	"packages/ui/test/nguon-keo-tha.dom.tsx",
	"packages/ui/test/nguon-canh-nhau.dom.tsx",
	"apps/app/test/nguon-keo-tha-chu.dom.tsx",
	"apps/app/test/tai-lieu-nguon.dom.tsx",
];

function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

function git(...thamSo) {
	return execFileSync("git", thamSo, {
		cwd: GOC,
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	});
}

function sha(ref) {
	try {
		return git("rev-parse", "--verify", "--quiet", `${ref}^{commit}`).trim();
	} catch {
		return khongDo(`khong phan giai duoc ${ref}`);
	}
}

function doiSo(ten) {
	const i = process.argv.indexOf(ten);
	return i < 0 ? null : (process.argv[i + 1] ?? null);
}

function tepDoi() {
	const tu = doiSo("--tu");
	const den = doiSo("--den");
	if (tu || den) {
		if (!tu || !den) khongDo("--tu va --den phai di cung nhau");
		return git("diff", "--name-only", sha(tu), sha(den));
	}
	const diemRe = (() => {
		try {
			return git("merge-base", sha(NHANH_CHINH), "HEAD").trim();
		} catch {
			return khongDo(`khong tinh duoc merge-base voi ${NHANH_CHINH}`);
		}
	})();
	return (
		git("diff", "--name-only", diemRe) +
		git("ls-files", "--others", "--exclude-standard")
	);
}

const doi = [...new Set(tepDoi().split("\n").filter(Boolean))];
const biCham = doi.filter(
	(t) => THU_MUC_CAM.some((d) => t.startsWith(d)) || TEP_CAM.includes(t),
);

if (biCham.length > 0) {
	console.log(`cham thuoc da ky: ${biCham.join(", ")}`);
	process.exit(1);
}
console.log(`khong cham thuoc da ky: ${doi.length} tep doi, 0 tep bi cam`);
