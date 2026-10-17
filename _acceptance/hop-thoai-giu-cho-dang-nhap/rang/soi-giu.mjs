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
import { execFileSync, spawnSync } from "node:child_process";
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

const DUONG_CU =
	"apps/app/app/(app)/[slug]/settings/members/confirm-dialog.tsx";
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

const SLUG = "apps/app/app/(app)/[slug]";

const KHAI_TAY = [];

const PHAN_TRONG_NGAN = ["apps/app/components/detail-sheet.tsx"];

const DANH_SACH = [
	`${SLUG}/okr/hop-thoai-can-chinh.tsx`,
	`${SLUG}/okr/hop-thoai-kr.tsx`,
	`${SLUG}/okr/hop-thoai-muc-tieu.tsx`,
	`${SLUG}/okr/hop-thoai-nhap.tsx`,
	`${SLUG}/settings/api-keys/created-api-key-dialog.tsx`,
	`${SLUG}/settings/members/allow-dialog.tsx`,
	`${SLUG}/settings/members/chuyen-okr-dialog.tsx`,
	`${SLUG}/settings/members/chuyen-viec-dialog.tsx`,
	`${SLUG}/settings/members/phat-chia-dialog.tsx`,
	`${SLUG}/settings/organization/hop-thoai-don-vi.tsx`,
	`${SLUG}/settings/organization/hop-thoai-nhap.tsx`,
	"apps/app/components/agent-builder/create-channel-dialog.tsx",
	"apps/app/components/agent-builder/new-agent-dialog.tsx",
	"apps/app/components/crm/stage-change.tsx",
	"apps/app/components/data-table/saved-views-menu.tsx",
	`${SLUG}/campaigns/create-campaign-sheet.tsx`,
	`${SLUG}/companies/create-company-sheet.tsx`,
	`${SLUG}/contacts/create-contact-sheet.tsx`,
	`${SLUG}/deals/create-deal-sheet.tsx`,
	`${SLUG}/settings/api-keys/create-api-key-sheet.tsx`,
	`${SLUG}/settings/okr/sheet-mo-chu-ky.tsx`,
	`${SLUG}/settings/sso/add-sso-provider-sheet.tsx`,
	`${SLUG}/deals/deals-bulk-actions.tsx`,
	`${SLUG}/settings/connections/slack/slack-channels.tsx`,
	"apps/app/components/crm/fields/field-editor.tsx",
	`${SLUG}/settings/organization/hop-thoai-vi-tri.tsx`,
	`${SLUG}/okr/hop-thoai-cap-nhat-kr.tsx`,
	`${SLUG}/settings/giai-doan/hop-thoai-giai-doan.tsx`,
	`${SLUG}/settings/okr/hop-thoai-mo-lai.tsx`,
	`${SLUG}/settings/okr/sheet-mau-okr.tsx`,
	`${SLUG}/settings/okr/sheet-mo-ra.tsx`,
	`${SLUG}/tai-lieu/hop-tai-nguon.tsx`,
	"apps/app/components/crm/record-sheet/kr-bang-chung.tsx",
	"apps/app/components/crm/record-sheet/objective-duyet.tsx",
	"apps/app/components/crm/record-sheet/objective-hien-thi.tsx",
	"apps/app/components/okr/hop-chuyen-okr.tsx",
	`${SLUG}/okr/hoi-y/khoi-gom.tsx`,
	`${SLUG}/okr/hoi-y/khoi-gop.tsx`,
	`${SLUG}/okr/hoi-y/sheet-mo-hoi-y.tsx`,
];

const BA_HOP = [
	`${SLUG}/okr/hop-thoai-kr.tsx`,
	`${SLUG}/okr/hop-thoai-muc-tieu.tsx`,
	`${SLUG}/settings/organization/hop-thoai-don-vi.tsx`,
];

const NOI_DUNG_HOP = new Set([
	"DialogContent",
	"SheetContent",
	"DrawerContent",
]);
const NUT_DONG = new Set(["DialogClose", "SheetClose", "DrawerClose"]);
const O_NHAP = new Set([
	"Input",
	"Textarea",
	"InputGroupInput",
	"Combobox",
	"Select",
	"DatePicker",
]);
const TEN_HAM_DONG = /^(dong|close|onClose)([A-Z]\w*)?$/;
const SET_MO = /^set(\w*Open|Mo|Mo[A-Z]\w*|Closing|Dong\w*)$/;
const DESIGN_MD = "docs/design.md";
const MUC_VE_TAY = "### Dấu hiệu vẽ tay";

const tenThe = (n, sf) =>
	ts.isJsxElement(n)
		? n.openingElement.tagName.getText(sf)
		: ts.isJsxSelfClosingElement(n)
			? n.tagName.getText(sf)
			: null;

const thuocTinh = (n) =>
	(ts.isJsxElement(n) ? n.openingElement : n).attributes.properties;

const laHam = (n) =>
	ts.isArrowFunction(n) ||
	ts.isFunctionExpression(n) ||
	ts.isFunctionDeclaration(n) ||
	ts.isMethodDeclaration(n);

function tenGoi(bieuThuc) {
	if (ts.isIdentifier(bieuThuc)) return bieuThuc.text;
	if (ts.isPropertyAccessExpression(bieuThuc)) return bieuThuc.name.text;
	return null;
}

function laGoiDong(goi) {
	const ten = tenGoi(goi.expression);
	if (ten === null) return false;
	if (TEN_HAM_DONG.test(ten)) return true;
	const dau = goi.arguments[0];
	if (dau === undefined) return false;
	if (dau.kind === ts.SyntaxKind.FalseKeyword) {
		return ten === "onOpenChange" || SET_MO.test(ten);
	}
	return dau.kind === ts.SyntaxKind.NullKeyword && SET_MO.test(ten);
}

function thanGoiDong(than) {
	let co = false;
	const di = (n) => {
		if (co) return;
		if (ts.isCallExpression(n) && laGoiDong(n)) {
			co = true;
			return;
		}
		if (laHam(n)) return;
		ts.forEachChild(n, di);
	};
	di(than);
	return co;
}

function laHamDong(bieuThuc) {
	const ten = tenGoi(bieuThuc);
	if (ten !== null) return TEN_HAM_DONG.test(ten);
	if (ts.isArrowFunction(bieuThuc) || ts.isFunctionExpression(bieuThuc)) {
		return thanGoiDong(bieuThuc.body);
	}
	return false;
}

function soiNut(sf, caTep = false) {
	const viPham = [];
	let quaNutDong = 0;
	const di = (n, trongHop, trongNutDong) => {
		const ten = tenThe(n, sf);
		if (ten === "Button" && trongHop) {
			if (trongNutDong) {
				quaNutDong += 1;
			} else {
				const onClick = thuocTinh(n).find(
					(a) => ts.isJsxAttribute(a) && a.name.getText(sf) === "onClick",
				);
				const bt = onClick?.initializer;
				if (
					bt &&
					ts.isJsxExpression(bt) &&
					bt.expression &&
					laHamDong(bt.expression)
				) {
					viPham.push(
						sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1,
					);
				}
			}
		}
		const vaoHop = trongHop || (ten !== null && NOI_DUNG_HOP.has(ten));
		const vaoNutDong = trongNutDong || (ten !== null && NUT_DONG.has(ten));
		ts.forEachChild(n, (c) => di(c, vaoHop, vaoNutDong));
	};
	di(sf, caTep, false);
	return { viPham, quaNutDong };
}

const CHU_HOP = /DialogContent|SheetContent|DrawerContent/;

function coHopVaONhap(duong) {
	const chu = readFileSync(duong, "utf8");
	if (!CHU_HOP.test(chu)) return false;
	const sf = cay(duong, chu);
	let o = false;
	const di = (n) => {
		if (o) return;
		const ten = tenThe(n, sf);
		if (ten !== null && O_NHAP.has(ten)) {
			o = true;
			return;
		}
		ts.forEachChild(n, di);
	};
	di(sf);
	return o;
}

function rutTap(goc) {
	const ra = new Set();
	for (const duong of diCay(join(goc, "apps/app"), /\.tsx$/, [])) {
		const rel = tuongDoi(duong, goc);
		if (rel.startsWith("apps/app/app/proto/")) continue;
		if (coHopVaONhap(duong)) ra.add(rel);
	}
	return ra;
}

function nhanTep(rels) {
	const dem = new Map();
	for (const rel of rels) {
		const ten = rel.split("/").at(-1);
		dem.set(ten, (dem.get(ten) ?? 0) + 1);
	}
	return (rel) => {
		const phan = rel.split("/");
		const ten = phan.at(-1);
		return dem.get(ten) === 1 ? ten : phan.slice(-2).join("/");
	};
}

function bangVeTayCoDialogClose(goc) {
	const duong = join(goc, DESIGN_MD);
	if (!existsSync(duong)) return false;
	const chu = readFileSync(duong, "utf8");
	const dau = chu.indexOf(MUC_VE_TAY);
	if (dau === -1) return false;
	const sau = chu.slice(dau + MUC_VE_TAY.length);
	const cuoi = sau.search(/\n#{1,3} /);
	const muc = cuoi === -1 ? sau : sau.slice(0, cuoi);
	return muc
		.split("\n")
		.some((dong) => dong.startsWith("|") && dong.includes("DialogClose"));
}

const FIXTURE_DUONG = `"use client";
import { Button } from "@crm/ui/components/button";
import { Dialog, DialogClose, DialogContent, DialogFooter } from "@crm/ui/components/dialog";
import { Input } from "@crm/ui/components/input";
export function Hop({ dong, luu }: { dong: () => void; luu: () => void }) {
	return (
		<Dialog open onOpenChange={(mo) => { if (!mo) dong(); }}>
			<DialogContent>
				<Input />
				<DialogFooter>
					<Button variant="outline" onClick={dong}>Huỷ</Button>
					<DialogClose asChild><Button variant="outline">Thôi</Button></DialogClose>
					<Button onClick={luu}>Lưu</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
`;

function doiChungDuong() {
	const thuMuc = mkdtempSync(join(tmpdir(), "soi-giu-huy-duong-"));
	try {
		const duong = join(thuMuc, "hop-goi-thang.tsx");
		writeFileSync(duong, FIXTURE_DUONG);
		return soiNut(cay(duong)).viPham.length;
	} finally {
		rmSync(thuMuc, { recursive: true, force: true });
	}
}

function caHuy(goc) {
	const hong = [];
	const rut = rutTap(goc);
	const viet = new Set(DANH_SACH);
	for (const rel of [...rut].sort()) {
		if (!viet.has(rel))
			hong.push(`huy: thua ${rel} (may rut ra, danh sach viet truoc khong co)`);
	}
	let khop = 0;
	for (const rel of DANH_SACH) {
		if (!existsSync(join(goc, rel)))
			hong.push(`huy: thieu ${rel} (khong ton tai)`);
		else if (!rut.has(rel)) hong.push(`huy: thieu ${rel} (may khong rut ra)`);
		else khop += 1;
	}

	for (const rel of KHAI_TAY) {
		if (!existsSync(join(goc, rel)))
			hong.push(`huy: thieu ${rel} (khai tay, khong ton tai)`);
	}
	const soi = [...new Set([...DANH_SACH, ...KHAI_TAY, ...rut])]
		.filter((rel) => existsSync(join(goc, rel)))
		.sort();
	const nhan = nhanTep(soi);
	let viPham = 0;
	let quaNutDong = 0;
	for (const rel of soi) {
		const kq = soiNut(cay(join(goc, rel)));
		quaNutDong += kq.quaNutDong;
		for (const dong of kq.viPham) {
			viPham += 1;
			hong.push(`huy: ${nhan(rel)}:${dong} goi thang ham dong`);
		}
	}

	if (!bangVeTayCoDialogClose(goc)) {
		hong.push(
			`huy: ${DESIGN_MD} thieu dong DialogClose trong bang «Dấu hiệu vẽ tay»`,
		);
	}

	const duong = doiChungDuong();
	if (duong === 1) console.log("huy: doi chung duong bat 1/1 vi pham");
	else hong.push(`huy: doi chung duong bat ${duong} vi pham, can dung 1`);

	console.log(
		`huy: ${khop}/${DANH_SACH.length} tep, ${viPham} vi pham, ${quaNutDong} nut qua nut dong`,
	);
	console.log(`huy: khai tay ${KHAI_TAY.length} tep ngoai bo rut may`);
	for (const rel of PHAN_TRONG_NGAN) {
		if (!existsSync(join(goc, rel))) {
			hong.push(`huy: thieu ${rel} (phan hien trong ngan, khong ton tai)`);
			continue;
		}
		const kq = soiNut(cay(join(goc, rel)), true);
		for (const dong of kq.viPham)
			hong.push(
				`huy: ${rel}:${dong} goi thang ham dong (phan hien trong ngan)`,
			);
		console.log(
			`huy: phan hien trong ngan ${rel}: ${kq.viPham.length} vi pham, ${kq.quaNutDong} nut qua nut dong`,
		);
	}
	return hong;
}

function banSao(rels, thuMuc) {
	for (const rel of rels) {
		mkdirSync(dirname(join(thuMuc, rel)), { recursive: true });
		copyFileSync(join(GOC, rel), join(thuMuc, rel));
	}
}

function phaVaCham({ tien, rels, rel, pha, cham, ghim }) {
	const thuMuc = mkdtempSync(join(tmpdir(), tien));
	try {
		banSao(rels, thuMuc);
		const duong = join(thuMuc, rel);
		const truoc = readFileSync(duong, "utf8");
		const sau = pha(truoc);
		if (sau === truoc) {
			console.log(`KHONG DO DUOC: pha khong doi gi o ${rel}`);
			process.exit(2);
		}
		writeFileSync(duong, sau);
		const hong = cham(thuMuc);
		for (const h of hong) console.log(`HONG ${h}`);
		const trung = hong.find((h) => ghim.test(h));
		if (trung) {
			console.log(`chieu do: bat, in «${trung}»`);
			process.exit(1);
		}
		console.log(`chieu do: LOT, khong thay ${ghim}`);
		process.exit(2);
	} finally {
		rmSync(thuMuc, { recursive: true, force: true });
	}
}

function caHuyChieuDo() {
	if (process.argv.includes("--ngan")) {
		phaVaCham({
			tien: "soi-giu-huy-ngan-",
			rels: [...DANH_SACH, ...KHAI_TAY, ...PHAN_TRONG_NGAN, DESIGN_MD],
			rel: PHAN_TRONG_NGAN[0],
			pha: (chu) =>
				chu.replace(
					/<SheetClose asChild>\s*<Button variant="ghost" size="icon-sm">([\s\S]*?)<\/Button>\s*<\/SheetClose>/,
					'<Button variant="ghost" size="icon-sm" onClick={onClose}>$1</Button>',
				),
			cham: caHuy,
			ghim: /^huy: apps\/app\/components\/detail-sheet\.tsx:\d+ goi thang ham dong \(phan hien trong ngan\)$/,
		});
		return;
	}
	phaVaCham({
		tien: "soi-giu-huy-",
		rels: [...DANH_SACH, DESIGN_MD],
		rel: BA_HOP[0],
		pha: (chu) =>
			chu.replace(
				/<(Dialog|Sheet)Close asChild[^>]*>\s*(<Button variant="outline")([\s\S]*?<\/Button>)\s*<\/\1Close>/,
				"$2 onClick={dong}$3",
			),
		cham: caHuy,
		ghim: /^huy: hop-thoai-kr\.tsx:\d+ goi thang ham dong$/,
	});
}

function giaTriHang(khoiTao) {
	if (khoiTao === undefined) return true;
	if (ts.isStringLiteral(khoiTao)) return true;
	if (!ts.isJsxExpression(khoiTao) || !khoiTao.expression) return true;
	const k = khoiTao.expression.kind;
	return (
		k === ts.SyntaxKind.TrueKeyword ||
		k === ts.SyntaxKind.FalseKeyword ||
		k === ts.SyntaxKind.NullKeyword ||
		k === ts.SyntaxKind.NumericLiteral ||
		k === ts.SyntaxKind.StringLiteral ||
		(ts.isIdentifier(khoiTao.expression) &&
			khoiTao.expression.text === "undefined")
	);
}

function dialogGoc(sf) {
	let ra = null;
	const di = (n) => {
		if (ra) return;
		if (tenThe(n, sf) === "Dialog" || tenThe(n, sf) === "Sheet") {
			ra = n;
			return;
		}
		ts.forEachChild(n, di);
	};
	di(sf);
	return ra;
}

function caTuKhai(goc) {
	const hong = [];
	let dat = 0;
	for (const rel of BA_HOP) {
		const ten = rel.split("/").at(-1);
		const duong = join(goc, rel);
		if (!existsSync(duong)) {
			hong.push(`tu-khai: tep khong ton tai ${rel}`);
			continue;
		}
		const sf = cay(duong);
		const dialog = dialogGoc(sf);
		if (!dialog) {
			hong.push(`tu-khai: khong thay <Dialog> hay <Sheet> o ${ten}`);
			continue;
		}
		const prop = thuocTinh(dialog).find(
			(a) => ts.isJsxAttribute(a) && a.name.getText(sf) === "coThayDoi",
		);
		if (!prop) {
			hong.push(`tu-khai: thieu coThayDoi o ${ten}`);
			continue;
		}
		if (giaTriHang(prop.initializer)) {
			hong.push(`tu-khai: coThayDoi la hang o ${ten}`);
			continue;
		}
		dat += 1;
	}
	console.log(`tu-khai: ${dat}/${BA_HOP.length}`);
	return hong;
}

function caTuKhaiChieuDo() {
	phaVaCham({
		tien: "soi-giu-tu-khai-",
		rels: BA_HOP,
		rel: BA_HOP[0],
		pha: (chu) => chu.replace(/\s+coThayDoi=\{[^}]*\}/, ""),
		cham: caTuKhai,
		ghim: /^tu-khai: thieu coThayDoi o hop-thoai-kr\.tsx$/,
	});
}

const MOC = "origin/onehub";
const TEP_CHU = "packages/ui/src/lib/messages.ts";
// du-an-gantt mien-effect: docs/crm-plan.md §12 cấm useEffect trong mã app và tính năng, miễn tệp vendor
// dưới packages/ui/src/components (Biome bỏ qua thư mục này). Chỉ luật useEffect theo miễn trừ đó.
const MIEN_EFFECT = /^packages\/ui\/src\/components\//;
const KHOA_HOI = ["tieuDe", "than", "tiepTuc", "bo"];
const LOP_DOI_KIEU =
	/(^|\s)(bg-\S+|text-(?!xs\b|sm\b|base\b|lg\b|xl\b|left\b|right\b|center\b|wrap\b|nowrap\b|balance\b|pretty\b)\S+|border-\S+|rounded-\S+|p[xytrbl]?-\S+|m[xytrbl]?-\S+|gap-\S+|space-[xy]-\S+)/;
const TEN_PROP_KIEU = new Set(["variant", "tone", "size"]);

const git = (...a) =>
	execFileSync("git", ["-C", GOC, ...a], {
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	}).trim();

function tepDiffTK(loc) {
	return git(
		"diff",
		"--name-only",
		"--no-renames",
		`--diff-filter=${loc}`,
		`${MOC}...HEAD`,
	)
		.split("\n")
		.filter(Boolean);
}

let GOC_SO = null;
function dongThemTK(rel, duong) {
	GOC_SO ??= git("merge-base", "HEAD", MOC);
	const thu = mkdtempSync(join(tmpdir(), "soi-giu-dong-them-"));
	try {
		const cu = join(thu, "cu");
		const r0 = spawnSync("git", ["-C", GOC, "show", `${GOC_SO}:${rel}`], {
			encoding: "utf8",
			maxBuffer: 64 * 1024 * 1024,
		});
		writeFileSync(cu, r0.status === 0 ? r0.stdout : "");
		const r = spawnSync(
			"git",
			["diff", "--no-index", "-U0", "--no-color", cu, duong],
			{
				encoding: "utf8",
				maxBuffer: 64 * 1024 * 1024,
			},
		);
		const them = new Set();
		for (const m of (r.stdout ?? "").matchAll(
			/^@@ -\S+ \+(\d+)(?:,(\d+))? @@/gm,
		)) {
			const dau = Number(m[1]);
			const so = m[2] === undefined ? 1 : Number(m[2]);
			for (let k = 0; k < so; k += 1) them.add(dau + k);
		}
		return them;
	} finally {
		rmSync(thu, { recursive: true, force: true });
	}
}

const dongCuaTK = (sf, pos) => sf.getLineAndCharacterOfPosition(pos).line + 1;

function chuThichMoi(sf, them) {
	const chu = sf.text;
	const gap = new Map();
	const nhan = (r) => {
		if (r) for (const c of r) gap.set(c.pos, c);
	};
	const di = (n) => {
		if (n.kind === ts.SyntaxKind.JsxText) return;
		nhan(ts.getLeadingCommentRanges(chu, n.pos));
		nhan(ts.getTrailingCommentRanges(chu, n.pos));
		for (const c of n.getChildren(sf)) di(c);
	};
	di(sf);
	return [...gap.values()]
		.map((c) => dongCuaTK(sf, c.pos))
		.filter((d) => them.has(d))
		.sort((a, b) => a - b);
}

function thanhPhanUi(sf) {
	const ten = new Set();
	for (const st of sf.statements) {
		if (!ts.isImportDeclaration(st)) continue;
		const nguon = st.moduleSpecifier.text;
		if (!nguon.startsWith("@crm/ui/components/")) continue;
		const b = st.importClause?.namedBindings;
		if (b && ts.isNamedImports(b))
			for (const e of b.elements) ten.add(e.name.text);
	}
	return ten;
}

function soiKieu(sf, them, laApp) {
	const hong = [];
	const ui = laApp ? thanhPhanUi(sf) : new Set();
	const di = (n) => {
		const dong = dongCuaTK(sf, n.getStart(sf));
		if (
			laApp &&
			(ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) &&
			ui.has(n.tagName.getText(sf))
		) {
			for (const a of n.attributes.properties) {
				if (
					!ts.isJsxAttribute(a) ||
					a.name.getText(sf) !== "className" ||
					!a.initializer
				)
					continue;
				const dongA = dongCuaTK(sf, a.getStart(sf));
				if (!them.has(dongA)) continue;
				const giaTri = a.initializer.getText(sf);
				const khop = giaTri.match(LOP_DOI_KIEU);
				if (khop)
					hong.push({
						dong: dongA,
						cau: `className doi kieu «${khop[2]}» tren ${n.tagName.getText(sf)}`,
					});
			}
		}
		if (
			ts.isBindingElement(n) &&
			ts.isIdentifier(n.name) &&
			TEN_PROP_KIEU.has(n.name.text) &&
			n.initializer &&
			ts.isStringLiteral(n.initializer) &&
			them.has(dong)
		)
			hong.push({ dong, cau: `mac dinh chuoi cho ${n.name.text}` });
		ts.forEachChild(n, di);
	};
	di(sf);
	return hong;
}

function coUseEffect(sf) {
	const dong = [];
	const di = (n) => {
		if (ts.isCallExpression(n)) {
			const e = n.expression;
			if (
				(ts.isIdentifier(e) && e.text === "useEffect") ||
				(ts.isPropertyAccessExpression(e) && e.name.text === "useEffect")
			)
				dong.push(dongCuaTK(sf, n.getStart(sf)));
		}
		ts.forEachChild(n, di);
	};
	di(sf);
	return dong;
}

function goiKitTK() {
	return (
		process.env.CLAUDE_PLUGIN_ROOT ??
		execFileSync(
			"node",
			[
				join(GOC, "scripts", "resolve-plugin.mjs"),
				"--plugin",
				"acceptance-gate",
				"--require",
				"scripts/design-gate.mjs",
			],
			{ encoding: "utf8" },
		).trim()
	);
}

function chuHoiLai(duong) {
	const chu = readFileSync(duong, "utf8");
	const khoi = [...chu.matchAll(/boThayDoi:\s*\{([^}]*)\}/g)].map((m) => {
		const o = {};
		for (const k of m[1].matchAll(/(\w+):\s*"([^"]*)"/g)) o[k[1]] = k[2];
		return o;
	});
	return khoi;
}

function caThietKe(thay = new Map()) {
	const duongCua = (t) => thay.get(t) ?? join(GOC, t);
	const hong = [];
	const moi = new Set(tepDiffTK("A"));
	const doi = tepDiffTK("AM").filter((t) => existsSync(join(GOC, t)));
	const laThu = (t) =>
		/\/(test|tests|__tests__|proto)\//.test(t) ||
		/\.(spec|test|dom)\.tsx?$/.test(t);
	const giaoDien = doi
		.filter(
			(t) => /^(apps\/app|packages\/ui\/src)\/.*\.tsx$/.test(t) && !laThu(t),
		)
		.sort();
	const tepMa = doi
		.filter(
			(t) =>
				/\.(ts|tsx)$/.test(t) &&
				!t.split("/").includes("generated") &&
				!laThu(t),
		)
		.sort();
	console.log(`thiet-ke: dai so sanh ${MOC}...HEAD`);
	console.log(
		`thiet-ke: ${giaoDien.length} tep giao dien, ${tepMa.length} tep ma, ${[...moi].filter((t) => tepMa.includes(t)).length} tep moi`,
	);
	const kit = giaoDien.length > 0 ? goiKitTK() : null;
	for (const t of giaoDien) {
		const r = spawnSync(
			"node",
			[
				join(kit, "scripts", "design-gate.mjs"),
				"--target",
				thay.has(t) ? duongCua(t) : t,
				"--mode",
				"static",
			],
			{
				cwd: GOC,
				encoding: "utf8",
			},
		);
		const ra = `${r.stdout ?? ""}${r.stderr ?? ""}`;
		const p0 = Number(ra.match(/"p0_count":\s*(\d+)/)?.[1] ?? Number.NaN);
		if (r.status !== 0 || p0 !== 0)
			hong.push(`thiet-ke: design-gate P0 o ${t} (ma ${r.status}, p0 ${p0})`);
	}
	for (const t of tepMa) {
		const duong = duongCua(t);
		const sf = cay(duong);
		const them = dongThemTK(t, duong);
		for (const d of chuThichMoi(sf, them))
			hong.push(`thiet-ke: chu thich moi o ${t}:${d}`);
		for (const k of soiKieu(sf, them, t.startsWith("apps/app/")))
			hong.push(`thiet-ke: ${k.cau} o ${t}:${k.dong}`);
		if (moi.has(t) && !MIEN_EFFECT.test(t))
			for (const d of coUseEffect(sf))
				hong.push(`thiet-ke: useEffect tran trong tep moi ${t}:${d}`);
	}
	const khoi = chuHoiLai(duongCua(TEP_CHU));
	if (khoi.length !== 2)
		hong.push(
			`thiet-ke: ${TEP_CHU} co ${khoi.length} khoi dialog.boThayDoi, can 2 (en, vi)`,
		);
	else {
		const [en, vi] = khoi;
		for (const k of KHOA_HOI) {
			if (!en[k] || !vi[k]) hong.push(`thiet-ke: thieu dialog.boThayDoi.${k}`);
			else if (en[k] === vi[k])
				hong.push(`thiet-ke: vi=en o dialog.boThayDoi.${k}`);
		}
	}
	console.log(
		`thiet-ke: design-gate ${giaoDien.length} tep, chu hoi lai ${khoi.length === 2 ? "du 4 khoa vi/en" : "loi"}`,
	);
	return hong;
}

function caThietKeChieuDo() {
	const thuMuc = mkdtempSync(join(tmpdir(), "soi-giu-thiet-ke-"));
	try {
		const tepMoi = "packages/ui/src/components/giu-thay-doi.tsx";
		const sao1 = join(thuMuc, "giu-thay-doi.tsx");
		writeFileSync(sao1, `${readFileSync(join(GOC, tepMoi), "utf8")}\n// x\n`);
		const sao2 = join(thuMuc, "messages.ts");
		writeFileSync(
			sao2,
			readFileSync(join(GOC, TEP_CHU), "utf8").replace(
				'bo: "Discard"',
				'bo: "Bỏ"',
			),
		);
		const ca1 = caThietKe(new Map([[tepMoi, sao1]]));
		const ca2 = caThietKe(new Map([[TEP_CHU, sao2]]));
		for (const h of [...ca1, ...ca2]) console.log(`HONG ${h}`);
		const ghim1 = ca1.find((h) =>
			h.startsWith(`thiet-ke: chu thich moi o ${tepMoi}:`),
		);
		const ghim2 = ca2.find(
			(h) => h === "thiet-ke: vi=en o dialog.boThayDoi.bo",
		);
		if (ghim1 && ghim2) {
			console.log(`chieu do: bat, in «${ghim1}» va «${ghim2}»`);
			process.exit(1);
		}
		console.log(
			`chieu do: LOT (chu thich ${Boolean(ghim1)}, vi=en ${Boolean(ghim2)})`,
		);
		process.exit(2);
	} finally {
		rmSync(thuMuc, { recursive: true, force: true });
	}
}

const CAC_CA = {
	confirm: { chay: () => caConfirm(GOC), chieuDo: caConfirmChieuDo },
	huy: { chay: () => caHuy(GOC), chieuDo: caHuyChieuDo },
	"tu-khai": { chay: () => caTuKhai(GOC), chieuDo: caTuKhaiChieuDo },
	"thiet-ke": { chay: () => caThietKe(), chieuDo: caThietKeChieuDo },
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
