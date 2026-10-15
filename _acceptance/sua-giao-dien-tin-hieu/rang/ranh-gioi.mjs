import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const VUNG_CAM = [
	/^apps\/api\//,
	/^packages\/db\//,
	/^packages\/validation\//,
	/^packages\/ui\//,
];
const BAI_LT2 = "apps/app/test/tin-hieu.dom.tsx";

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

function demExpect(noiDung) {
	return (noiDung.match(/\bexpect\(/g) ?? []).length;
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
if (tepGia) tep.push(tepGia);

let sai = 0;
const cham = tep.filter((t) => VUNG_CAM.some((v) => v.test(t)));
if (cham.length > 0) {
	for (const t of cham)
		console.log(`SAI vong sua giao dien cham vung cam: ${t}`);
	sai += 1;
} else {
	console.log(`DUNG khong cham vung cam — da xet ${tep.length} tep`);
}

let truoc = 0;
try {
	truoc = demExpect(git("show", `${goc}:${BAI_LT2}`));
} catch {
	truoc = 0;
}
const giaSau = doc("--so-expect");
const sau =
	giaSau !== undefined
		? Number(giaSau)
		: demExpect(git("show", `HEAD:${BAI_LT2}`));
if (sau < truoc) {
	console.log(`SAI bai cua LT2 bot khang dinh: expect( ${truoc} -> ${sau}`);
	sai += 1;
} else {
	console.log(
		`DUNG bai cua LT2 khong bot khang dinh: expect( ${truoc} -> ${sau}`,
	);
}

console.log(`KET LUAN: ${sai === 0 ? "ma 0" : "ma 1"}`);
process.exit(sai === 0 ? 0 : 1);
