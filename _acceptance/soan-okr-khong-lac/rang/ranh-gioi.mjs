import fs from "node:fs";
import { NOP, SOAN, diemRe, doiCo, git, ketLuan } from "./chung.mjs";

const co = doiCo(process.argv.slice(2));
const TIEN_TO = [
	`${SOAN}/`,
	"apps/app/test/soan-okr",
	"_acceptance/soan-okr-khong-lac/",
];
const DICH_DANH = new Set([
	"apps/app/lib/search-param-keys.ts",
	"apps/app/lib/search-param-keys.test.ts",
	"packages/validation/src/okr-cuoc-soan.ts",
	"packages/ui/src/components/kara/proposal.tsx",
	"apps/app/lib/messages/okr-soan.ts",
	"_acceptance/config.yaml",
	NOP,
	"docs/superpowers/specs/2026-10-08-soan-okr-khong-lac-design.md",
	"docs/superpowers/plans/2026-10-08-soan-okr-khong-lac.md",
	"PRODUCT-MAP.md",
	"LO-TRINH.html",
	"_acceptance/soan-okr-trang-rieng/rang/man.mjs",
	"_acceptance/soan-okr-trang-rieng/rang/man-ma-tran.mjs",
	"apps/app/test/messages-guard.spec.ts",
	"packages/ui/test/kara-proposal-group-loi.dom.tsx",
]);
const CHI_THEM = ["_acceptance/config.yaml", "apps/app/test/messages-guard.spec.ts"];

const goc = diemRe();
const tep = git(["diff", "--name-only", goc, "HEAD"]).split("\n").filter(Boolean);
if (co.them) tep.push(co.them);
let sai = 0;
const bao = (dong) => {
	sai++;
	console.log(dong);
};
for (const t of tep)
	if (!DICH_DANH.has(t) && !TIEN_TO.some((p) => t.startsWith(p))) bao(`ngoai-ranh-gioi:${t}`);

const dongDoi = (diff, dau) =>
	diff.split("\n").filter((l) => l.startsWith(dau) && !l.startsWith(dau.repeat(3))).map((l) => l.slice(1));
for (const t of CHI_THEM)
	if (dongDoi(git(["diff", "-U0", goc, "HEAD", "--", t]), "-").length) bao(`xoa-dong:${t}`);

const diffNop = co["diff-mau"] ? fs.readFileSync(co["diff-mau"], "utf8") : git(["diff", "-U0", goc, "HEAD", "--", NOP]);
const BO_DUOC = [/^\tketQua: z\.enum\(\["da-ghi", "tu-choi"\]\),$/, /^import \{ type BanNhap, laChoGiuPhien \} from "@crm\/validation\/okr-cuoc-soan";$/];
const THEM_DUOC = [/^\tketQua: z\.enum\(KET_QUA_NOP\),$/, /^import \{$/, /^\ttype BanNhap,$/, /^\tKET_QUA_NOP,$/, /^\tlaChoGiuPhien,$/, /^\} from "@crm\/validation\/okr-cuoc-soan";$/];
const lech = [
	...dongDoi(diffNop, "-").filter((l) => !BO_DUOC.some((r) => r.test(l))),
	...dongDoi(diffNop, "+").filter((l) => !THEM_DUOC.some((r) => r.test(l))),
];
if (lech.length) bao(`nop-ban-nhap doi ngoai dong ketQua: ${lech[0].trim()}`);

if (!sai) console.log(`ranh-gioi: ${tep.length} tep, 0 ngoai`);
ketLuan(sai);
