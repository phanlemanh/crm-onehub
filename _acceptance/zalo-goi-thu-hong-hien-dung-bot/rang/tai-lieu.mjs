import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const BAN_GOC = "090bd517e6e143ac00e1015d2ec570959c02d5e3";
const CONNECTIONS = "docs/connections.md";
const LO_TRINH = "docs/plan/lo-trinh-zalo.md";
const SLUG = "`zalo-goi-thu-hong-hien-dung-bot`";
const VONG_2 = "`noi-zalo-cho-nguoi-moi`";

const gon = (chu) => chu.replace(/\s+/g, " ");

function mucGiua(chu, dau, ke) {
	const i = chu.search(dau);
	if (i < 0) return "";
	const sau = chu.slice(i + 1);
	const j = sau.search(ke);
	return j < 0 ? chu.slice(i) : chu.slice(i, i + 1 + j);
}

function mucZalo(chu) {
	return mucGiua(chu, /^## .*Zalo/m, /^## /m);
}

function bangMuc7(chu) {
	return mucGiua(chu, /^## 7\./m, /^## 8\./m)
		.split("\n")
		.filter((d) => d.startsWith("|"));
}

const MOC = [
	[
		"connections-goi-thu-hong",
		CONNECTIONS,
		(chu) =>
			mucZalo(chu)
				.split(/\n(?=- )/)
				.map(gon)
				.some(
					(muc) =>
						muc.includes("gọi thử") &&
						muc.includes("bot mới") &&
						muc.includes("Đăng ký lại"),
				),
	],
	[
		"lo-trinh-dong-slug",
		LO_TRINH,
		(chu) => bangMuc7(chu).some((d) => d.includes(SLUG)),
	],
	[
		"lo-trinh-vong-2-da-len",
		LO_TRINH,
		(chu) =>
			bangMuc7(chu).some(
				(d) =>
					d.includes(VONG_2) &&
					d.includes("#118") &&
					d.includes("đã lên `onehub`") &&
					!d.includes("PR mở"),
			),
	],
];

const docTep = (tep) => readFileSync(join(GOC, tep), "utf8");

function docGoc(tep) {
	try {
		return execFileSync("git", ["-C", GOC, "show", `${BAN_GOC}:${tep}`], {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
		});
	} catch (loiGit) {
		console.error(
			`khong doc duoc ${tep} o ban goc ${BAN_GOC}: ${loiGit.stderr ?? loiGit.message}`,
		);
		process.exit(1);
	}
}

const PHA = {
	"connections-goi-thu-hong": (chu) => chu.replaceAll("bot mới", "bot"),
	"lo-trinh-dong-slug": (chu) => chu.replaceAll(SLUG, "`khac`"),
	"lo-trinh-vong-2-da-len": (chu) => chu.replaceAll("#118", "#1"),
};

let loi = 0;
const bao = (dong) => {
	console.error(dong);
	loi += 1;
};

for (const [ten, tep, dat] of MOC) {
	const that = docTep(tep);
	if (!dat(that)) bao(`thieu moc ${ten} trong ${tep}`);
	if (dat(docGoc(tep))) {
		bao(`doi chung hong: moc ${ten} da dat san o ban goc ${BAN_GOC}`);
	}
	if (dat(PHA[ten](that))) {
		bao(`tu kiem hong: pha moc ${ten} ma thuoc van xanh`);
	}
}

if (loi > 0) process.exit(1);
console.log(`tai-lieu: ${MOC.length} moc dat, ban goc va ban pha deu do`);
