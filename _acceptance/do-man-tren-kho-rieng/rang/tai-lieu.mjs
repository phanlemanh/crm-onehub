import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

export function muc(van, tieuDe) {
	const i = van.indexOf(tieuDe);
	if (i === -1) return null;
	const cap = tieuDe.match(/^#+/)[0].length;
	const sau = van.slice(i + tieuDe.length);
	const ke = sau.search(new RegExp(`\\n#{1,${cap}} `));
	return ke === -1 ? sau : sau.slice(0, ke);
}

export function thieu(van, moc) {
	const phang = (van ?? "").replace(/\s+/g, " ");
	return moc.filter((m) => !phang.includes(m));
}

const MOC_SETUP = [
	"db:do --tao",
	"--xoa",
	"--quet",
	"do:man",
	"template",
	"maxAgeMs",
	"tien-de",
];
const MOC_CLAUDE = ["do:man", "kho chung"];

let sai = 0;
function khang(dieu, cau) {
	console.log(`  ${dieu ? "DUNG" : "SAI "} ${cau}`);
	if (!dieu) sai += 1;
}

const setup = readFileSync(join(GOC, "docs/setup.md"), "utf8");
const mucSetup = muc(setup, "### Screen measurements");
const giaThieu = thieu((mucSetup ?? "").replaceAll("--quet", ""), MOC_SETUP);
khang(
	giaThieu.includes("--quet"),
	"doi chung: bo --quet thi bi goi ten --quet",
);

khang(mucSetup !== null, "docs/setup.md co muc ### Screen measurements");
const t1 = thieu(mucSetup, MOC_SETUP);
khang(
	t1.length === 0,
	`docs/setup.md muc Screen measurements thieu: ${t1.join(", ") || "-"}`,
);
const claude = readFileSync(join(GOC, "CLAUDE.md"), "utf8");
const t2 = thieu(muc(claude, "## Cách chứng minh nó chạy"), MOC_CLAUDE);
khang(
	t2.length === 0,
	`CLAUDE.md muc Cach chung minh thieu: ${t2.join(", ") || "-"}`,
);
const env = readFileSync(join(GOC, ".env.example"), "utf8");
khang(/^#.*PHIEN_DO\b/m.test(env), ".env.example co dong ghi PHIEN_DO");
console.log(`tai-lieu: ${sai === 0 ? "du" : `${sai} SAI`}`);
process.exit(sai > 0 ? 1 : 0);
