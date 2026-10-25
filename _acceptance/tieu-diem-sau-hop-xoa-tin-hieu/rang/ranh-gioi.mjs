import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const VUNG_CAM = [
	/^apps\/api\//,
	/^packages\/ui\//,
	/^packages\/db\//,
	/^packages\/validation\//,
];

function git(...thamSo) {
	return execFileSync("git", ["-C", GOC, ...thamSo], {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	});
}

function doc(ten) {
	const i = process.argv.indexOf(ten);
	return i > 0 ? process.argv[i + 1] : undefined;
}

let goc;
try {
	goc = git("merge-base", "HEAD", doc("--base") ?? "origin/onehub").trim();
} catch (e) {
	console.log(
		`KHONG DO DUOC: khong tim duoc merge-base (${e.message.split("\n")[0]})`,
	);
	process.exit(2);
}

const tep = git("diff", "--name-only", `${goc}...HEAD`)
	.split("\n")
	.filter(Boolean);
const tepGia = doc("--tep");
if (tepGia) tep.push(...tepGia.split(",").filter(Boolean));

const ngoaiHoSo = tep.filter((t) => !t.startsWith("_acceptance/")).length;
const cham = tep.filter((t) => VUNG_CAM.some((v) => v.test(t)));
for (const t of cham) console.log(`SAI vong sua tieu diem cham vung cam: ${t}`);
if (cham.length === 0)
	console.log(
		`DUNG khong cham vung cam — da xet ${tep.length} tep, ${ngoaiHoSo} tep ngoai _acceptance`,
	);

console.log(`KET LUAN: ${cham.length === 0 ? "ma 0" : "ma 1"}`);
process.exit(cham.length === 0 ? 0 : 1);
