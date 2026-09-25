import { readFileSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { phanLoaiLoiDangNhap } from "../../../apps/app/lib/cua-vao/loi-dang-nhap.ts";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const MIEN_THU = "onemount.com";

const AUTH_TS =
	process.env.CVDN_AUTH_TS ?? join(GOC, "packages/auth/src/auth.ts");
const BETTER_AUTH =
	process.env.CVDN_BETTER_AUTH_DIR ??
	realpathSync(join(GOC, "packages/auth/node_modules/better-auth"));
const SSO =
	process.env.CVDN_SSO_DIR ??
	realpathSync(join(GOC, "packages/auth/node_modules/@better-auth/sso"));

export const MOC = [
	{
		ten: "link-account",
		tep: join(BETTER_AUTH, "dist/oauth2/link-account.mjs"),
		chuoi: "error: e.message",
	},
	{
		ten: "oauth",
		tep: join(BETTER_AUTH, "dist/api/routes/callback.mjs"),
		chuoi:
			'redirectOnError(c, resolvedErrorURL, result.error.split(" ").join("_"))',
	},
	{
		ten: "sso",
		tep: join(SSO, "dist/index.mjs"),
		chuoi: '{ error: result.error.split(" ").join("_") }',
	},
];

const KY_VONG = {
	"co-mien": "chua-cho-phep",
	"khong-mien": "chua-cho-phep",
	"chua-khai": "chung",
};
const WRITER = ["oauth", "sso"];

export const MA_TRAN = [
	...MOC.map((m) => `moc-${m.ten}`),
	...WRITER.flatMap((w) => Object.keys(KY_VONG).map((c) => `${w}-${c}`)),
];

function tim(nut, dieuKien) {
	if (dieuKien(nut)) return nut;
	return ts.forEachChild(nut, (con) => tim(con, dieuKien));
}

function tenThuocTinh(p) {
	return ts.isPropertyAssignment(p) || ts.isMethodDeclaration(p)
		? p.name.getText()
		: undefined;
}

function vaoThuocTinh(obj, ten) {
	return obj.properties.find((p) => tenThuocTinh(p) === ten);
}

function chuTuBieuThuc(bt) {
	if (ts.isStringLiteral(bt) || ts.isNoSubstitutionTemplateLiteral(bt)) {
		return [{ template: false, cau: bt.text }];
	}
	if (ts.isTemplateExpression(bt)) {
		const cau =
			bt.head.text +
			bt.templateSpans.map((s) => MIEN_THU + s.literal.text).join("");
		return [{ template: true, cau }];
	}
	if (ts.isConditionalExpression(bt)) {
		return [...chuTuBieuThuc(bt.whenTrue), ...chuTuBieuThuc(bt.whenFalse)];
	}
	throw new Error(`khong doc duoc bieu thuc message: ${bt.getText()}`);
}

export function rutCauHook(duong = AUTH_TS) {
	const nguon = ts.createSourceFile(
		duong,
		readFileSync(duong, "utf8"),
		ts.ScriptTarget.Latest,
		true,
	);
	const hooks = tim(
		nguon,
		(n) =>
			ts.isPropertyAssignment(n) &&
			n.name.getText() === "databaseHooks" &&
			ts.isObjectLiteralExpression(n.initializer),
	);
	if (!hooks) throw new Error("khong thay databaseHooks trong auth.ts");
	const user = vaoThuocTinh(hooks.initializer, "user");
	const create = user && vaoThuocTinh(user.initializer, "create");
	const before = create && vaoThuocTinh(create.initializer, "before");
	if (!before) throw new Error("khong thay user.create.before trong auth.ts");

	const cau = [];
	const duyet = (n) => {
		if (
			ts.isNewExpression(n) &&
			n.expression.getText() === "APIError" &&
			n.arguments?.[0]?.getText() === '"FORBIDDEN"' &&
			n.arguments[1] &&
			ts.isObjectLiteralExpression(n.arguments[1])
		) {
			const msg = vaoThuocTinh(n.arguments[1], "message");
			if (msg) cau.push(...chuTuBieuThuc(msg.initializer));
		}
		ts.forEachChild(n, duyet);
	};
	duyet(before);

	return cau.map(({ template, cau: c }) => ({
		ten: template
			? "co-mien"
			: c.startsWith("No one")
				? "chua-khai"
				: "khong-mien",
		cau: c,
	}));
}

export function quaCallback(cau) {
	const ma = cau.split(" ").join("_");
	const url = `http://lan-do/sign-in?${new URLSearchParams({ error: ma })}`;
	return new URL(url).searchParams.get("error");
}

function chay() {
	const dong = [];
	const ghi = (ma, dat, chu) => dong.push({ ma, dat, chu });

	for (const m of MOC) {
		let noiDung = "";
		try {
			noiDung = readFileSync(m.tep, "utf8");
		} catch {
			noiDung = "";
		}
		const co = noiDung.includes(m.chuoi);
		ghi(
			`moc-${m.ten}`,
			co,
			co
				? `moc ${m.ten}: con \`${m.chuoi}\``
				: `moc ${m.ten}: phep bien doi da doi (${m.tep})`,
		);
	}

	let cau = [];
	try {
		cau = rutCauHook();
	} catch (loi) {
		console.log(`KHONG DO DUOC: ${loi.message}`);
		process.exit(2);
	}
	const soCau = Object.keys(KY_VONG).length;
	if (cau.length !== soCau) {
		console.log(`SAI rut-cau: rut duoc ${cau.length} cau, can ${soCau}`);
	}

	const mocHong = new Set(
		dong.filter((d) => !d.dat).map((d) => d.ma.replace("moc-", "")),
	);
	for (const w of WRITER) {
		for (const { ten, cau: c } of cau) {
			const docLai = quaCallback(c);
			const loai = phanLoaiLoiDangNhap(docLai);
			const can = KY_VONG[ten];
			const mocGay = [w, "link-account"].filter((m) => mocHong.has(m));
			const dat = loai === can && mocGay.length === 0;
			const lyDo =
				mocGay.length > 0
					? ` (moc ${mocGay.join(", ")} hong — gia tri tren khong con la gia tri that)`
					: loai === can
						? ""
						: ` (can ${can})`;
			ghi(`${w}-${ten}`, dat, `${w}-${ten}: ${docLai} -> ${loai}${lyDo}`);
		}
	}

	const thay = new Set(dong.map((d) => d.ma));
	for (const ma of MA_TRAN) {
		if (!thay.has(ma)) dong.push({ ma, dat: false, chu: `thieu ${ma}` });
	}
	for (const d of dong) console.log(`${d.dat ? "DUNG" : "SAI"} ${d.chu}`);
	const sai =
		dong.filter((d) => !d.dat).length + (cau.length === soCau ? 0 : 1);
	const ma = sai === 0 ? 0 : 1;
	console.log(
		`KET LUAN ${dong.length - dong.filter((d) => !d.dat).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
	);
	process.exit(ma);
}

if (import.meta.main) chay();
