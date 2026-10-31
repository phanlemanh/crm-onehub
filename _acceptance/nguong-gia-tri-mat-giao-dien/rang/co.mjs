import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { GOC, goiKit, HS, khongDo, napNguong } from "./chung.mjs";
import { dongMien } from "./mien.mjs";

const ag = goiKit();
const { n, tpl } = napNguong(ag);

const mau = (timebox, song) =>
	`## Ngưỡng chết / ngưỡng UAT\n\n- Câu hỏi phép đo trả lời: có?\n- Kết quả nào là SỐNG: ${song}\n- Kết quả nào là CHẾT: không\n- Timebox: ${timebox}\n`;
const a = n.thresholdState(mau("…", "có"), tpl);
const b = n.thresholdState(mau("2026-11-14", "[đề xuất] có"), tpl);
const c = n.thresholdState(mau("2026-11-14", "có"), tpl);
if (a !== "chua-chot" || b !== "de-xuat" || c !== "chot")
	khongDo(
		`doi chung duong: thresholdState tra ${a}/${b}/${c}, mong chua-chot/de-xuat/chot`,
	);
console.log(
	"doi chung duong: o trong -> chua-chot, [đề xuất] -> de-xuat, du chu -> chot",
);

let quet;
try {
	quet = JSON.parse(
		execFileSync(
			"node",
			[join(ag, "scripts", "start-scan.mjs"), "--root", GOC],
			{
				cwd: GOC,
				encoding: "utf8",
				maxBuffer: 64 * 1024 * 1024,
			},
		),
	);
} catch (e) {
	khongDo(`start-scan khong chay duoc — ${e.message}`);
}
const co = [];
const tim = (x) => {
	if (Array.isArray(x)) for (const y of x) tim(y);
	else if (x?.constructor === Object) {
		if (Array.isArray(x.flags) && x.flags.includes("nguong-chua-chot"))
			co.push(x.slug);
		for (const v of Object.values(x)) tim(v);
	}
};
tim(quet);

const matNguoi = (slug) => {
	const tep = join(GOC, "_acceptance", slug, "contract.md");
	if (!existsSync(tep)) return false;
	const s = /^surfaces:\s*(.*)$/m.exec(readFileSync(tep, "utf8"))?.[1] ?? "";
	return n.coNguoiDungCuoi(s);
};
const ngoai = dongMien(
	readFileSync(join(GOC, HS, "decisions.jsonl"), "utf8"),
	"ngoai_ac1",
);
for (const s of [...ngoai].sort())
	console.log(`NGOAI AC-1 ${s} (dong so co ten nguoi)`);
const conLai = [...new Set(co)]
	.filter(matNguoi)
	.filter((s) => !ngoai.has(s))
	.sort();
for (const s of conLai) console.log(`CON CO ${s}`);
console.log(
	`start-scan: ${co.length} ho so mang co nguong-chua-chot, ${conLai.length} co mat nguoi dung cuoi`,
);
process.exit(conLai.length === 0 ? 0 : 1);
