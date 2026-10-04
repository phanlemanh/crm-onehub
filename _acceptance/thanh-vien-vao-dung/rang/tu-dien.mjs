import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { thanhVienMessages } from "../../../apps/app/lib/messages/settings-thanh-vien.ts";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const doc = (tep) =>
	readFileSync(
		process.env[`TU_DIEN_${tep.replace(/\W/g, "_")}`] ?? join(GOC, tep),
		"utf8",
	);

const dong = [];
let sai = 0;
function kiem(nhan, dat) {
	dong.push(`${dat ? "DUNG" : "SAI"} ${nhan}`);
	if (!dat) sai += 1;
}

const tuDien = doc("CONTEXT.md");
const batDau = tuDien.indexOf("**Tên miền nội bộ**");
const muc =
	batDau === -1
		? ""
		: tuDien.slice(
				batDau,
				tuDien.indexOf("\n\n**", batDau + 1) === -1
					? undefined
					: tuDien.indexOf("\n\n**", batDau + 1),
			);
kiem("CONTEXT.md co muc «Tên miền nội bộ»", batDau !== -1);
kiem("muc co dong _Avoid_", /^_Avoid_:/m.test(muc));
kiem("muc co dong «Vì sao»", /^Vì sao:/m.test(muc));

const vi = thanhVienMessages("vi").tenMienNoiBo ?? {};
const en = thanhVienMessages("en").tenMienNoiBo ?? {};
const khoaVi = Object.keys(vi).sort();
const khoaEn = Object.keys(en).sort();
kiem(`nhom tenMienNoiBo co khoa (${khoaVi.length})`, khoaVi.length > 0);
kiem("khoa vi khop khoa en", JSON.stringify(khoaVi) === JSON.stringify(khoaEn));
const rong = khoaVi.filter(
	(k) =>
		typeof vi[k] !== "string" ||
		vi[k].trim() === "" ||
		typeof en[k] !== "string" ||
		en[k].trim() === "",
);
kiem(
	rong.length === 0
		? "moi khoa co chuoi vi va en"
		: `khoa rong: ${rong.join(", ")}`,
	rong.length === 0,
);

const api = doc("docs/api.md");
kiem(
	"docs/api.md noi tu choi nguoi da la thanh vien («already a member»)",
	api.includes("already a member"),
);
kiem(
	"docs/api.md noi dong treo doc thanh accepted",
	/pending[^\n]*accepted|accepted[^\n]*pending/.test(
		api.slice(api.indexOf("## One organization"), api.indexOf("## API keys")),
	) && api.includes("staffDomains"),
);

const moiTruong = doc("docs/environment.md");
const doan = moiTruong.slice(
	moiTruong.indexOf("appSetting.staffEmailDomains"),
	moiTruong.indexOf("## Where things are"),
);
kiem(
	"docs/environment.md noi dat o Settings → Members",
	doan.includes("Settings → Members"),
);

for (const d of dong) console.log(d);
console.log(`KET LUAN: ${dong.length - sai} DUNG, ${sai} SAI`);
process.exit(sai === 0 ? 0 : 1);
