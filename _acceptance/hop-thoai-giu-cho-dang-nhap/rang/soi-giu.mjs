import {
	copyFileSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ts = createRequire(import.meta.url)("typescript");

const TEP_NAY = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP_NAY), "..", "..", "..");

const LOAI_TRU = new Set([
	"node_modules",
	".next",
	"dist",
	"build",
	"generated",
	".turbo",
]);

const DUONG_CU = "apps/app/app/(app)/[slug]/settings/members/confirm-dialog.tsx";
const DUONG_MOI_REL = "packages/ui/src/components/confirm-dialog.tsx";
const NHAP_MOI = "@crm/ui/components/confirm-dialog";
const NHAP_CU_DAU_HIEU = "members/confirm-dialog";
const DUONG_CU_GIA = "@/app/(app)/[slug]/settings/members/confirm-dialog";

const MUOI_BA = [
	"apps/app/app/(app)/[slug]/settings/organization/xac-nhan-luu-tru.tsx",
	"apps/app/app/(app)/[slug]/settings/organization/da-luu-tru-to-chuc.tsx",
	"apps/app/app/(app)/[slug]/settings/okr/bang-chu-ky.tsx",
	"apps/app/app/(app)/[slug]/settings/onboarding/danh-sach-khuon.tsx",
	"apps/app/app/(app)/[slug]/settings/onboarding/da-luu-tru.tsx",
	"apps/app/app/(app)/[slug]/onboarding/[planId]/dong-mo-ke-hoach.tsx",
	"apps/app/app/(app)/[slug]/onboarding/[planId]/ho-so-ke-hoach.tsx",
	"apps/app/components/crm/record-sheet/plan-brokers.tsx",
	"apps/app/components/crm/record-sheet/plan-sheet.tsx",
	"apps/app/components/crm/record-sheet/plan-steps.tsx",
	"apps/app/components/crm/record-sheet/objective-sheet.tsx",
	"apps/app/app/(app)/[slug]/settings/members/allowances-table.tsx",
	"apps/app/app/(app)/[slug]/settings/members/members-table.tsx",
];

const CHIN_PROP = [
	["tieuDe", true],
	["than", true],
	["nut", true],
	["thoi", true],
	["open", true],
	["onOpenChange", true],
	["onConfirm", true],
	["pending", true],
	["tone", false],
];

const doiSo = (ten) => {
	const i = process.argv.indexOf(ten);
	return i === -1 ? null : (process.argv[i + 1] ?? "");
};

const tuongDoi = (duong, goc) =>
	duong.startsWith(goc) ? duong.slice(goc.length + 1) : duong;

function diCay(thuMuc, duoi, ra = []) {
	if (!existsSync(thuMuc)) return ra;
	for (const ten of readdirSync(thuMuc)) {
		if (LOAI_TRU.has(ten)) continue;
		const duong = join(thuMuc, ten);
		if (statSync(duong).isDirectory()) diCay(duong, duoi, ra);
		else if (duoi.test(ten)) ra.push(duong);
	}
	return ra;
}

function cay(duong, chu = readFileSync(duong, "utf8")) {
	return ts.createSourceFile(
		duong,
		chu,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
}

function timHamConfirmDialog(sf) {
	let ra = null;
	const di = (n) => {
		if (ra) return;
		if (ts.isFunctionDeclaration(n) && n.name?.text === "ConfirmDialog") {
			ra = n;
			return;
		}
		ts.forEachChild(n, di);
	};
	di(sf);
	return ra;
}

function layProp(fn, sf) {
	const p = fn.parameters[0];
	if (!p || !p.type || !ts.isTypeLiteralNode(p.type)) return null;
	return p.type.members
		.filter((m) => ts.isPropertySignature(m) && m.name)
		.map((m) => [m.name.getText(sf), !m.questionToken]);
}

function caConfirm(goc) {
	const hong = [];

	if (existsSync(join(goc, DUONG_CU))) hong.push("confirm: tep cu con");

	const duongMoi = join(goc, DUONG_MOI_REL);
	if (!existsSync(duongMoi)) {
		hong.push("confirm: tep component chua ton tai");
	} else {
		const sf = cay(duongMoi);
		const fn = timHamConfirmDialog(sf);
		if (!fn) {
			hong.push("confirm: khong tim thay ham ConfirmDialog");
		} else {
			const props = layProp(fn, sf);
			if (!props) {
				hong.push("confirm: tham so ConfirmDialog khong phai type literal");
			} else {
				const map = new Map(props);
				for (const [ten, batBuoc] of CHIN_PROP) {
					if (!map.has(ten) || map.get(ten) !== batBuoc) {
						hong.push(`confirm: prop ${ten} doi hoac mat`);
					}
				}
			}
		}
	}

	const duongCuConLai = new Set();
	for (const duong of diCay(join(goc, "apps/app"), /\.(ts|tsx)$/, [])) {
		const chu = readFileSync(duong, "utf8");
		if (chu.includes(NHAP_CU_DAU_HIEU)) {
			const rel = tuongDoi(duong, goc);
			duongCuConLai.add(rel);
			hong.push(`confirm: nhap duong cu o ${rel}`);
		}
	}

	let dungImport = 0;
	for (const rel of MUOI_BA) {
		const duong = join(goc, rel);
		if (!existsSync(duong)) {
			hong.push(`confirm: tep khong ton tai ${rel}`);
			continue;
		}
		const chu = readFileSync(duong, "utf8");
		if (chu.includes(NHAP_MOI)) {
			dungImport += 1;
		} else if (!duongCuConLai.has(rel)) {
			hong.push(`confirm: thieu nhap dung tu ${rel}`);
		}
	}
	console.log(`confirm: ${dungImport}/${MUOI_BA.length}`);
	return hong;
}

function caConfirmChieuDo() {
	const thuMuc = mkdtempSync(join(tmpdir(), "soi-giu-confirm-"));
	try {
		mkdirSync(dirname(join(thuMuc, DUONG_MOI_REL)), { recursive: true });
		copyFileSync(join(GOC, DUONG_MOI_REL), join(thuMuc, DUONG_MOI_REL));

		for (const rel of MUOI_BA) {
			mkdirSync(dirname(join(thuMuc, rel)), { recursive: true });
			copyFileSync(join(GOC, rel), join(thuMuc, rel));
		}

		const boHong = MUOI_BA[0];
		const duongBoHong = join(thuMuc, boHong);
		const chu = readFileSync(duongBoHong, "utf8").replace(
			NHAP_MOI,
			DUONG_CU_GIA,
		);
		writeFileSync(duongBoHong, chu);

		const hong = caConfirm(thuMuc);
		for (const h of hong) console.log(`HONG ${h}`);

		const ghim = `confirm: nhap duong cu o ${boHong}`;
		const bat = hong.includes(ghim);
		if (bat) {
			console.log(`chieu do: bat, in «${ghim}»`);
			process.exit(1);
		}
		console.log(`chieu do: LOT, khong thay «${ghim}»`);
		process.exit(2);
	} finally {
		rmSync(thuMuc, { recursive: true, force: true });
	}
}

const CAC_CA = {
	confirm: { chay: () => caConfirm(GOC), chieuDo: caConfirmChieuDo },
};

const ca = doiSo("--ca");
if (ca === null || !(ca in CAC_CA)) {
	console.log(
		`KHONG DO DUOC: ca khong ro «${ca}» — cac ca da biet: ${Object.keys(CAC_CA).join(", ")}`,
	);
	process.exit(2);
}

if (process.argv.includes("--chieu-do")) {
	CAC_CA[ca].chieuDo();
} else {
	const hong = CAC_CA[ca].chay();
	for (const h of hong) console.log(`HONG ${h}`);
	process.exit(hong.length === 0 ? 0 : 1);
}
