import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const HO_SO = "_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs";
const MOT_DUONG = "_acceptance/ho-so-khai-dung-tieng/rang/mot-duong.mjs";
const HOI_QUY = "_acceptance/ho-so-khai-dung-tieng/rang/hoi-quy-nam-cho.mjs";
const KIEM_UI = "packages/ui";

const CHO_HMR = Number(process.env.CHO_HMR ?? 6000);

const CS = "apps/app/components/crm/record-sheet/company-sheet.tsx";
const CN = "apps/app/components/crm/record-sheet/contact-sheet.tsx";
const RP = "apps/app/components/crm/record-sheet/record-parts.tsx";
const TL = "apps/app/components/crm/timeline/timeline-entry.tsx";
const CD = "apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx";
const FT = "packages/ui/src/components/foreign-text.tsx";
const NGOAI = "apps/app/components/crm/record-sheet/record-actions.tsx";

const chanHoSo = (ten) => ({
	lenh: "bun",
	doi_so: [HO_SO, ten],
});

const chanKiem = () => ({
	lenh: "bun",
	doi_so: [
		"test",
		"--preload",
		"./test/setup-dom.ts",
		"test/khai-tieng.spec.tsx",
	],
	cwd: join(GOC, KIEM_UI),
});

const DOT_BIEN = [
	{
		chan: "E1",
		mo_ta: "go ForeignText quanh gioi thieu cong ty",
		tep: CS,
		cu: `							<DetailSheetProse>
								<ForeignText lang="en">{company.description}</ForeignText>
							</DetailSheetProse>`,
		moi: "							<DetailSheetProse>{company.description}</DetailSheetProse>",
		do: chanHoSo("gioi-thieu"),
		ghim: "gioi-thieu",
	},
	{
		chan: "E2",
		mo_ta: "go ForeignText quanh tom tat ca nhan",
		tep: CN,
		cu: `			<DetailSheetProse>
				<ForeignText lang="en">{brief.narrative}</ForeignText>
			</DetailSheetProse>`,
		moi: "			<DetailSheetProse>{brief.narrative}</DetailSheetProse>",
		do: chanHoSo("tom-tat-lien-he"),
		ghim: "tom-tat-lien-he",
	},
	{
		chan: "E3",
		mo_ta: "bo khai lang cho phan tu nganh cua MetaLine",
		tep: CS,
		cu: `parts={[{ text: location }, { text: company.industry, lang: "en" }]}`,
		moi: "parts={[{ text: location }, { text: company.industry }]}",
		do: chanHoSo("nganh"),
		ghim: "nganh",
	},
	{
		chan: "E4",
		mo_ta: "tra headline dong thoi gian ve template literal",
		tep: TL,
		cu: `	const headline = change ? (
		<>
			<ForeignText lang="en">{dealStageLabel(change.from)}</ForeignText>
			{" → "}
			<ForeignText lang="en">{dealStageLabel(change.to)}</ForeignText>
		</>
	) : (
		entry.subject
	);`,
		moi: `	const headline = change
		? \`\${dealStageLabel(change.from)} → \${dealStageLabel(change.to)}\`
		: entry.subject;`,
		do: chanHoSo("dong-thoi-gian"),
		ghim: "dong-thoi-gian",
	},
	{
		chan: "E5",
		mo_ta: "khai lang cho phan tu dia danh (khai thua)",
		tep: CS,
		cu: `parts={[{ text: location }, { text: company.industry, lang: "en" }]}`,
		moi: `parts={[{ text: location, lang: "en" }, { text: company.industry, lang: "en" }]}`,
		do: chanHoSo("khong-khai-thua"),
		ghim: "khong-khai-thua",
	},
	{
		chan: "E6a",
		mo_ta: "doi mot cho goi ve <p lang=en> viet tay",
		tep: CD,
		cu: `<ForeignText lang="en">
												{dealStageLabel(value)}
											</ForeignText>`,
		moi: `<p lang="en">{dealStageLabel(value)}</p>`,
		do: { lenh: "bun", doi_so: [MOT_DUONG] },
		ghim: "CON VIET TAY",
	},
	{
		chan: "E6b",
		mo_ta: "them ForeignText o tep NGOAI ban kiem ke",
		tep: NGOAI,
		cu: "export function RecordActions({",
		moi: `import { ForeignText } from "@crm/ui/components/foreign-text";

export function RangThuaNgoaiKiemKe() {
	return <ForeignText lang="en">x</ForeignText>;
}

export function RecordActions({`,
		do: { lenh: "bun", doi_so: [MOT_DUONG] },
		ghim: "THUA",
	},
	{
		chan: "E7a",
		mo_ta: "bo attribute lang khoi ForeignText",
		tep: FT,
		cu: "<span lang={lang} className={className}>",
		moi: "<span className={className}>",
		do: chanKiem(),
		ghim: "chieu a",
	},
	{
		chan: "E7b",
		mo_ta: "khai lang cho MOI phan tu cua MetaLine",
		tep: RP,
		cu: "		rest.push({ text: value, lang: part?.lang });",
		moi: '		rest.push({ text: value, lang: part?.lang ?? "en" });',
		do: chanKiem(),
		ghim: "chieu b",
	},
	{
		chan: "E7c",
		mo_ta: "khu trung lap tren phan tu tho thay vi tren text",
		tep: RP,
		cu: "		const key = value.toLowerCase();",
		moi: "		const key = JSON.stringify(part);",
		do: chanKiem(),
		ghim: "chieu c",
	},
	{
		chan: "E8",
		mo_ta: "ve ForeignText khong dieu kien, ke ca khi gia tri rong",
		tep: CS,
		cu: `					{company.description ? (`,
		moi: `					<DetailSheetProse>
						<ForeignText lang="en">{company.description}</ForeignText>
					</DetailSheetProse>
					{company.description ? (`,
		do: chanHoSo("ho-so-trong"),
		ghim: "noi dung RONG",
	},
	{
		chan: "E9",
		mo_ta: "boc ForeignText quanh ca khoi Gioi thieu (nuot ca tieu de tieng Viet)",
		tep: CS,
		cu: `						<DetailSheetSection title={m.section.about}>`,
		moi: `						<ForeignText lang="en"><DetailSheetSection title={m.section.about}>`,
		cu2: `						</DetailSheetSection>`,
		moi2: `						</DetailSheetSection></ForeignText>`,
		do: chanHoSo("tieng-trang"),
		ghim: "lot vao",
	},
	{
		chan: "E12",
		mo_ta: "bo attribute lang khoi ForeignText (nhin tu man danh sach)",
		tep: FT,
		cu: "<span lang={lang} className={className}>",
		moi: "<span className={className}>",
		do: { lenh: "bun", doi_so: [HOI_QUY] },
		ghim: "MAN DANH SACH",
	},
];

const CHAN_UI = [
	"gioi-thieu",
	"tom-tat-lien-he",
	"nganh",
	"dong-thoi-gian",
	"khong-khai-thua",
	"ho-so-trong",
	"tieng-trang",
];

function chay({ lenh, doi_so, cwd }, moi_truong = {}) {
	const r = spawnSync(lenh, doi_so, {
		cwd: cwd ?? GOC,
		encoding: "utf8",
		env: { ...process.env, ...moi_truong },
	});
	return { ma: r.status, ra: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

async function cho(ms) {
	await new Promise((r) => setTimeout(r, ms));
}

function cayBan() {
	const r = spawnSync("git", ["-C", GOC, "status", "--porcelain"], {
		encoding: "utf8",
	});
	return (r.stdout ?? "")
		.split("\n")
		.filter((d) => d.trim() !== "" && !d.includes("_acceptance/"))
		.join("\n");
}

const bang = [];
let hong = 0;

console.log(
	"-- CHAN KHAI SINH: voi TUNG chan do, pha dung vat that ma no khai minh do,\n" +
		"   chay lai chan do do, va khang dinh no DO voi thong diep GHIM.\n" +
		"   Mot chan xanh ma khong do duoc o day la mot thuoc CHUA TUNG DO.\n",
);

for (const d of DOT_BIEN) {
	const duong = join(GOC, d.tep);
	const goc = readFileSync(duong, "utf8");
	let ket = { ma: null, ghim: false, ap_dung: false };

	try {
		let sua = goc;
		if (!sua.includes(d.cu)) {
			console.log(
				`   ${d.chan}: PHEP PHA KHONG AP DUNG DUOC — khong tim thay doan can pha trong ${d.tep}.\n` +
					"      Dung tin mau nao ca: mot phep pha khong xay ra trong y het mot chan do khong bat duoc.",
			);
			bang.push({ chan: d.chan, pha: d.mo_ta, ma: "-", ghim: "-", ap_dung: false });
			hong += 1;
			continue;
		}
		sua = sua.replace(d.cu, d.moi);
		if (d.cu2) {
			if (!sua.includes(d.cu2)) {
				console.log(`   ${d.chan}: PHEP PHA (ve thu hai) KHONG AP DUNG DUOC`);
				bang.push({ chan: d.chan, pha: d.mo_ta, ma: "-", ghim: "-", ap_dung: false });
				hong += 1;
				continue;
			}
			sua = sua.replace(d.cu2, d.moi2);
		}
		writeFileSync(duong, sua);
		ket.ap_dung = true;

		await cho(CHO_HMR);
		const r = chay(d.do);
		ket.ma = r.ma;
		ket.ghim = r.ra.includes(d.ghim);

		const dat = ket.ma !== 0 && ket.ghim;
		if (!dat) hong += 1;
		console.log(
			`   ${dat ? "dat     " : "KHONG DAT"} ${d.chan.padEnd(5)} ${d.mo_ta}\n` +
				`             -> ma thoat ${ket.ma}, thong diep ${ket.ghim ? "CO" : "KHONG"} ghim ${JSON.stringify(d.ghim)}`,
		);
	} finally {
		writeFileSync(duong, goc);
	}

	bang.push({
		chan: d.chan,
		pha: d.mo_ta,
		ma: ket.ma,
		ghim: ket.ghim ? "co" : "khong",
		ap_dung: ket.ap_dung,
	});
}

await cho(CHO_HMR);

console.log("\n-- DOT BIEN MOI TRUONG: tro APP_URL sang mot cong khong co may chu nao.");
console.log("   Moi chan ui-check phai DO ma 2 va GOI TEN CAY, khong chan nao in ra mot con so.");

const CONG_CHET = "http://localhost:39997";
for (const c of CHAN_UI) {
	const r = chay(chanHoSo(c), { APP_URL: CONG_CHET });
	const goiTen = r.ra.includes(GOC) || r.ra.includes("CAY KHAC");
	const inSo = /ket qua: chan=/.test(r.ra);
	const dat = r.ma === 2 && goiTen && !inSo;
	if (!dat) hong += 1;
	console.log(
		`   ${dat ? "dat     " : "KHONG DAT"} ${c.padEnd(18)} ma ${r.ma}, goi ten cay ${goiTen ? "co" : "khong"}, in con so ${inSo ? "CO (sai)" : "khong"}`,
	);
	bang.push({ chan: `moi-truong:${c}`, pha: "APP_URL cong chet", ma: r.ma, ghim: goiTen ? "co" : "khong", ap_dung: true });
}

console.log("\n-- CHIEU DO CUA CHINH CHAN NAY: cay CHUA pha gi thi moi chan phai xanh.");
const sach = chay(chanHoSo("gioi-thieu"));
if (sach.ma !== 0) {
	console.log(
		`   KHONG DAT: cay da tra ve nguyen trang ma chan do van do (ma ${sach.ma}).\n` +
			"   Hoac phep tra ban goc hong, hoac co thu khac dang do.",
	);
	hong += 1;
} else {
	console.log("   dat     cay sach thi chan do xanh");
}

const ban = cayBan();
if (ban !== "") {
	console.log(`\n   KHONG DAT: cay con ban sau khi chay xong:\n${ban}`);
	hong += 1;
}

console.log("\n===== BANG DOT BIEN =====");
console.log("chan            | ma thoat | thong diep co ghim | phep pha ap dung");
for (const b of bang) {
	console.log(
		`${String(b.chan).padEnd(15)} | ${String(b.ma).padEnd(8)} | ${String(b.ghim).padEnd(18)} | ${b.ap_dung ? "co" : "KHONG"}`,
	);
}

console.log(`\nket qua: ${hong} dot bien KHONG dat tren ${bang.length} dot bien`);
process.exit(hong > 0 ? 1 : 0);
