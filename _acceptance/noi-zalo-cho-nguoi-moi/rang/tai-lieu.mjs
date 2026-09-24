import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const NHANH_CHINH = process.env.NHANH_CHINH ?? "origin/onehub";

const docTep = (tep) => readFileSync(join(GOC, tep), "utf8");
const docNhanhChinh = (tep) =>
	execFileSync("git", ["-C", GOC, "show", `${NHANH_CHINH}:${tep}`], {
		encoding: "utf8",
	});

const doan = (chu) => chu.split(/\n\s*\n/);

function mucZalo(chu) {
	const dau = chu.search(/^#{2,} .*Zalo/m);
	if (dau < 0) return "";
	const phanSau = chu.slice(dau + 1);
	const ke = phanSau.search(/^## /m);
	return ke < 0 ? chu.slice(dau) : chu.slice(dau, dau + 1 + ke);
}

const CAU_ENV_CHINH =
	/(sửa|đặt|put|set)[^.\n]*`?\.env`?[^.\n]*(khởi động lại|restart)/i;

function coBienDuPhong(chu) {
	return ["ZALO_BOT_TOKEN", "ZALO_WEBHOOK_SECRET"].every((bien) =>
		doan(chu).some((d) => d.includes(bien) && d.includes("AppSetting")),
	);
}

const DIEU = [
	[
		"connections-dan-token",
		"docs/connections.md",
		(chu) => {
			const muc = mucZalo(chu);
			const doanToken = doan(muc).filter((d) => d.includes("Bot Token"));
			return (
				doanToken.some(
					(d) => d.includes("Kết nối › Zalo") && /dán/i.test(d),
				) && !CAU_ENV_CHINH.test(muc)
			);
		},
	],
	["environment-appsetting", "docs/environment.md", coBienDuPhong],
	["env-example-appsetting", ".env.example", coBienDuPhong],
	[
		"proto-reui",
		"docs/proto.md",
		(chu) => /^#{2,} .*ReUI/m.test(chu) && chu.includes("tham chiếu"),
	],
];

let thieu = 0;
for (const [ten, tep, dat] of DIEU) {
	if (dat(docNhanhChinh(tep))) {
		console.error(`doi chung hong: ${ten} da dat san tren ${NHANH_CHINH}`);
		process.exit(2);
	}
	if (!dat(docTep(tep))) {
		console.error(`thieu: ${ten} (${tep})`);
		thieu += 1;
	}
}
if (thieu === 0) console.log(`tai lieu du ${DIEU.length} dieu`);
process.exit(thieu ? 1 : 0);
