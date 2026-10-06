import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC =
	process.env.GOC_KHO ??
	join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SLUG = "tra-loi-tin-nhac";
const REF = process.env.TTN_REF;

function doc(tep, ref) {
	if (!ref) return readFileSync(join(GOC, tep), "utf8");
	return execFileSync("git", ["-C", GOC, "show", `${ref}:${tep}`], {
		encoding: "utf8",
	});
}

function mucBotZalo(text) {
	const dau = text.indexOf("**Bot Zalo**");
	if (dau < 0) return "";
	const sau = text.slice(dau);
	const het = sau.search(/\n\n/);
	return het < 0 ? sau : sau.slice(0, het);
}

const dauHoSo = execFileSync(
	"git",
	[
		"-C",
		GOC,
		"log",
		"--diff-filter=A",
		"--format=%H",
		"--",
		`_acceptance/${SLUG}/contract.md`,
	],
	{ encoding: "utf8" },
)
	.trim()
	.split("\n")
	.at(-1);
if (!dauHoSo) {
	console.error(`khong tim thay commit dau cua ho so ${SLUG}`);
	process.exit(2);
}
const truocHoSo = `${dauHoSo}^`;
const ket = [];
const moc = (ten, dat) => ket.push({ ten, dat });

const botNhanh = mucBotZalo(doc("CONTEXT.md", REF));
const botTruoc = mucBotZalo(doc("CONTEXT.md", truocHoSo));
moc(
	"CONTEXT Bot Zalo neu lenh xong",
	/`?xong`?/.test(botNhanh) && botNhanh.includes("đánh dấu"),
);
moc("CONTEXT ban truoc ho so chua neu lenh xong", !/`?xong`?/.test(botTruoc));

const agent = doc("docs/agent.md", REF);
const doan = agent.split(/\n{2,}/);
moc(
	"docs/agent.md co doan ta lenh xong",
	doan.some(
		(d) =>
			d.includes("`xong`") &&
			d.includes("được cả hoặc không") &&
			d.includes("hôm nay") &&
			d.includes('`source: "zalo"`'),
	),
);

const keHoach = doc("docs/plan/lo-trinh-zalo.md", REF);
const muc7 = keHoach.slice(keHoach.indexOf("## 7."), keHoach.indexOf("## 8."));
const tap = (muc7.match(/giá trị:([\s\S]*?)\. Cột Ngày/)?.[1] ?? "")
	.split("·")
	.map((s) => s.replace(/[`\s]+/g, " ").trim())
	.filter(Boolean);
const dong = muc7
	.split("\n")
	.filter((d) => d.startsWith("|") && d.includes(`\`${SLUG}\``));
const trangThai =
	(dong[0] ?? "")
		.split("|")[3]
		?.replace(/[`\s]+/g, " ")
		.trim() ?? "";
moc(
	"lo-trinh muc 7 dong tra-loi-tin-nhac hop le va khac cho dieu kien",
	dong.length === 1 && tap.includes(trangThai) && trangThai !== "chờ điều kiện",
);

for (const m of ket) console.log(`${m.dat ? "dat" : "KHONG DAT"}: ${m.ten}`);
const hong = ket.filter((m) => !m.dat);
if (hong.length > 0) {
	console.error(`moc khong dat: ${hong.map((m) => m.ten).join("; ")}`);
	process.exit(1);
}
