import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const req = createRequire(join(GOC, "package.json"));
const ts = req("typescript");
const yaml = { parse: (chu) => Bun.YAML.parse(chu) };

const DICH = [
	"apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx",
	"apps/app/app/(app)/[slug]/okr/hop-thoai-muc-tieu.tsx",
	"apps/app/components/crm/record-sheet/objective-sheet.tsx",
];

const EVAL_MAY = {
	"tro-ly-okr-de-xuat": ["E2", "E3"],
	"the-gop-y-okr": [
		"E2",
		"E3",
		"E4",
		"E5",
		"E6",
		"E7",
		"E8",
		"E9",
		"E10",
		"E16",
	],
	"hop-thoai-giu-cho-dang-nhap": ["E7", "E9"],
};

const CHOT = [
	{ hoSo: "khep-ky-okr", eval: "E3", khoa: "E3" },
	{ hoSo: "khep-ky-okr", eval: "E7", khoa: "E7" },
	{ hoSo: "canh-kr-okr", eval: "E11", khoa: "E11" },
	{ hoSo: "hop-thoai-giu-cho-dang-nhap", eval: "E9", khoa: "caHuyChieuDo" },
	{ hoSo: "hop-thoai-giu-cho-dang-nhap", eval: "E7", khoa: "caTuKhaiChieuDo" },
];

const thay = new Map();
const chiChot = process.argv.includes("--chi-chot");
for (let i = 2; i < process.argv.length; i += 1) {
	if (process.argv[i] === "--tep") {
		const [tep, banSao] = process.argv[i + 1].split("=");
		thay.set(tep, banSao);
	}
}
const docDich = (tep) => readFileSync(thay.get(tep) ?? join(GOC, tep), "utf8");

const loi = [];

function hangSo(sf) {
	const bang = new Map();
	const giai = (e) => {
		if (!e) return null;
		if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e))
			return { chuoi: e.text };
		if (ts.isIdentifier(e)) return bang.get(e.text) ?? null;
		if (ts.isTemplateExpression(e)) {
			let chu = e.head.text;
			for (const sp of e.templateSpans) {
				const v = giai(sp.expression);
				if (!v || !("chuoi" in v)) return null;
				chu += v.chuoi + sp.literal.text;
			}
			return { chuoi: chu };
		}
		if (ts.isArrayLiteralExpression(e)) return { mang: e.elements.map(giai) };
		if (ts.isElementAccessExpression(e)) {
			const mang = giai(e.expression);
			const i = e.argumentExpression;
			return mang && "mang" in mang && ts.isNumericLiteral(i)
				? (mang.mang[Number(i.text)] ?? null)
				: null;
		}
		return null;
	};
	ts.forEachChild(sf, (n) => {
		if (!ts.isVariableStatement(n)) return;
		for (const d of n.declarationList.declarations)
			if (ts.isIdentifier(d.name)) bang.set(d.name.text, giai(d.initializer));
	});
	return giai;
}

function chuoiTim(ham) {
	const ra = [];
	const di = (n) => {
		if (
			ts.isCallExpression(n) &&
			ts.isPropertyAccessExpression(n.expression) &&
			n.expression.name.text === "replace" &&
			n.arguments[0]
		) {
			const a = n.arguments[0];
			if (ts.isStringLiteral(a) || ts.isNoSubstitutionTemplateLiteral(a))
				ra.push({ khop: (chu) => chu.includes(a.text) });
			else if (ts.isRegularExpressionLiteral(a)) {
				const t = a.text;
				const cuoi = t.lastIndexOf("/");
				const re = new RegExp(t.slice(1, cuoi), t.slice(cuoi + 1));
				ra.push({ khop: (chu) => re.test(chu) });
			}
		}
		ts.forEachChild(n, di);
	};
	di(ham);
	return ra;
}

function khopDich(gia) {
	if (!gia || !("chuoi" in gia)) return null;
	return DICH.find((d) => d === gia.chuoi || gia.chuoi.endsWith(d)) ?? null;
}

function timChot(hoSo, tenTep) {
	const duong = join(GOC, "_acceptance", hoSo, "rang", tenTep);
	const sf = ts.createSourceFile(
		tenTep,
		readFileSync(duong, "utf8"),
		ts.ScriptTarget.Latest,
		true,
	);
	const giai = hangSo(sf);
	const ra = [];
	const di = (n, ham) => {
		const tenHam = ts.isFunctionDeclaration(n) && n.name ? n.name.text : ham;
		if (ts.isObjectLiteralExpression(n)) {
			const lay = (k) =>
				n.properties.find(
					(p) => ts.isPropertyAssignment(p) && p.name.getText(sf) === k,
				);
			const tep = lay("tep") ?? lay("rel");
			const cam = lay("cam") ?? lay("pha");
			if (tep && cam) {
				const dich = khopDich(giai(tep.initializer));
				if (dich) {
					const cha = n.parent;
					const khoa = ts.isPropertyAssignment(cha)
						? cha.name.getText(sf)
						: tenHam;
					ra.push({ khoa, dich, tim: chuoiTim(cam.initializer) });
				}
			}
		}
		ts.forEachChild(n, (c) => di(c, tenHam));
	};
	di(sf, null);
	return ra;
}

const tatCa = [];
for (const hoSo of readdirSync(join(GOC, "_acceptance"))) {
	let tep = [];
	try {
		tep = readdirSync(join(GOC, "_acceptance", hoSo, "rang")).filter((t) =>
			t.endsWith(".mjs"),
		);
	} catch {
		continue;
	}
	if (hoSo === "khung-tao-okr-nhu-deal") continue;
	for (const t of tep)
		for (const c of timChot(hoSo, t)) tatCa.push({ hoSo, ...c });
}

let soChot = 0;
for (const c of CHOT) {
	const tim = tatCa.filter((x) => x.hoSo === c.hoSo && x.khoa === c.khoa);
	if (tim.length === 0) {
		loi.push(`khong thay chot trong script: ${c.hoSo} ${c.eval}`);
		continue;
	}
	for (const x of tim) {
		const chu = docDich(x.dich);
		const an = x.tim.length > 0 && x.tim.every((t) => t.khop(chu));
		soChot += 1;
		if (an)
			console.log(
				`ok chot con an: ${c.hoSo} ${c.eval} (${x.dich.split("/").at(-1)})`,
			);
		else loi.push(`chot do khong an: ${c.hoSo} ${c.eval}`);
	}
}
for (const x of tatCa) {
	if (!CHOT.some((c) => c.hoSo === x.hoSo && c.khoa === x.khoa))
		loi.push(`chot ngoai danh sach: ${x.hoSo} ${x.khoa} (${x.dich})`);
}
console.log(`so chot: ${soChot}`);

if (!chiChot) {
	const cfg = yaml.parse(
		readFileSync(join(GOC, "_acceptance/config.yaml"), "utf8"),
	);
	const lenh = (ref) =>
		ref
			.replace(/^config:/, "")
			.split(".")
			.reduce((o, k) => o?.[k], cfg);
	for (const [hoSo, ids] of Object.entries(EVAL_MAY)) {
		const evals = yaml.parse(
			readFileSync(join(GOC, "_acceptance", hoSo, "evals.yaml"), "utf8"),
		).evals;
		for (const id of ids) {
			const e = evals.find((x) => x.id === id);
			const cmd = e ? lenh(e.cmd) : null;
			if (!cmd) {
				loi.push(`khong co lenh: ${hoSo} ${id}`);
				continue;
			}
			const kq = spawnSync("bash", ["-c", cmd], {
				cwd: GOC,
				encoding: "utf8",
				env: process.env,
			});
			const ky = e.expected_exit ?? 0;
			const ma = kq.status ?? 1;
			console.log(
				`${ma === ky ? "ok" : "DO"} ${hoSo} ${id}: ma ${ma} (ky vong ${ky})`,
			);
			if (ma !== ky) {
				loi.push(`eval lech: ${hoSo} ${id} ma ${ma} != ${ky}`);
				console.log(
					`${kq.stdout ?? ""}${kq.stderr ?? ""}`
						.split("\n")
						.slice(-15)
						.join("\n"),
				);
			}
		}
	}
}

for (const l of loi) console.log(l);
process.exit(loi.length > 0 ? 1 : 0);
