import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../..",
);
const APP = path.join(GOC, "apps/app");
const DIST = ".next-tin-hieu-ban-dung";
const TEP = path.join(GOC, "LO-TRINH.html");
const nftCua = (duong) =>
	path.join(APP, DIST, `server/app/(app)/[slug]/${duong}/page.js.nft.json`);
const dungLai = process.argv.includes("--khong-dung");

let sai = 0;
const dong = (dung, nhan, chiTiet = "") => {
	console.log(
		`${dung ? "DUNG" : "SAI"} ${nhan}${chiTiet ? ` — ${chiTiet}` : ""}`,
	);
	if (!dung) sai++;
};

if (!dungLai || !existsSync(nftCua("tin-hieu"))) {
	rmSync(path.join(APP, DIST), { recursive: true, force: true });
	try {
		execFileSync("bunx", ["next", "build"], {
			cwd: APP,
			stdio: ["ignore", "inherit", "inherit"],
			env: {
				...process.env,
				PROTO_DIST_DIR: DIST,
				NEXT_TELEMETRY_DISABLED: "1",
			},
		});
	} catch {
		console.log("KHONG DO DUOC: khong dung duoc ban dung");
		process.exit(2);
	}
}

function mangTep(duong) {
	const nft = nftCua(duong);
	if (!existsSync(nft)) return null;
	const j = JSON.parse(readFileSync(nft, "utf8"));
	return j.files.map((f) => path.resolve(path.dirname(nft), f)).includes(TEP);
}

const tinHieu = mangTep("tin-hieu");
if (tinHieu === null) {
	console.log("KHONG DO DUOC: khong dung duoc ban dung");
	process.exit(2);
}
dong(
	tinHieu,
	tinHieu
		? "ban dung mang LO-TRINH.html cho trang tin hieu"
		: "ban dung khong mang LO-TRINH.html cho trang tin hieu",
);
const loTrinh = mangTep("lo-trinh");
dong(
	loTrinh === true,
	"doi chung: duong lo-trinh trong cung ban dung mang LO-TRINH.html",
);
console.log(`KET LUAN: ${sai === 0 ? "moi dong DUNG" : `${sai} dong SAI`}`);
process.exit(sai === 0 ? 0 : 1);
