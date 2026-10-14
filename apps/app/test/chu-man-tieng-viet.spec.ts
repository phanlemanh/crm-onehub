import { describe, expect, test } from "bun:test";
import { messages } from "@crm/ui/lib/messages";
import { type DocTep, docTuDia, GOC_KHO, moiTepTsx } from "./lib/quet-jsx";

const BREADCRUMB = "packages/ui/src/components/breadcrumb.tsx";
const CAI_DAT = "apps/app/components/cai-dat-breadcrumb.tsx";
const MESSAGES = "packages/ui/src/lib/messages.ts";
const NHAN_VI = "Vị trí trang";
const NHAN_EN = "Breadcrumb";
const NHAN_CUNG = /aria-label\s*=\s*\{?\s*["'`]breadcrumb["'`]\s*\}?/i;
const CHU_CUNG = [NHAN_VI, `"${NHAN_EN}"`, `'${NHAN_EN}'`, `\`${NHAN_EN}\``];
const CACH_VIET_CUNG = [
	'aria-label="breadcrumb"',
	"aria-label='breadcrumb'",
	'aria-label={"breadcrumb"}',
	"aria-label={`breadcrumb`}",
	'aria-label="Breadcrumb"',
	'aria-label={"Breadcrumb"}',
	'aria-label = "BREADCRUMB"',
] as const;

function tepQuet(): string[] {
	return [
		...moiTepTsx(GOC_KHO, "packages/ui/src"),
		...moiTepTsx(GOC_KHO, "apps/app"),
	].filter((t) => !t.includes("/test/fixtures/") && !t.includes("/.next/"));
}

export function quetNhanBreadcrumb(doc: DocTep, tep: string[]): string[] {
	const loi: string[] = [];
	for (const t of tep) {
		const nguon = doc(t);
		if (nguon === null) continue;
		if (NHAN_CUNG.test(nguon)) {
			loi.push(`cmt-quet: con aria-label breadcrumb cung o ${t}`);
		}
		if (CHU_CUNG.some((c) => nguon.includes(c))) {
			loi.push(`cmt-quet: chu nhan breadcrumb viet cung o ${t}`);
		}
	}
	return loi;
}

function docThay(
	goc: DocTep,
	tep: string,
	thay: (s: string) => string,
): DocTep {
	return (t) => {
		const nguon = goc(t);
		return t === tep && nguon !== null ? thay(nguon) : nguon;
	};
}

const DOC = docTuDia();
const TEP = tepQuet();

describe("nhan-breadcrumb", () => {
	test("khong con nhan breadcrumb viet cung trong .tsx", () => {
		expect(TEP.length).toBeGreaterThan(0);
		expect(TEP).toContain(BREADCRUMB);
		expect(TEP).toContain(CAI_DAT);
		expect(quetNhanBreadcrumb(DOC, TEP)).toEqual([]);
		process.stdout.write(`cmt-quet: da quet ${TEP.length} tep\n`);
	});

	test("chu nhan chi song trong messages.ts, dung khoa breadcrumb.nhan tung ngon ngu", () => {
		expect(DOC(MESSAGES)).not.toBeNull();
		expect([
			messages("vi").breadcrumb.nhan,
			messages("en").breadcrumb.nhan,
		]).toEqual([NHAN_VI, NHAN_EN]);
	});

	test("ma tran cach viet cung: moi cach deu bi bat", () => {
		const lot = CACH_VIET_CUNG.filter(
			(c) =>
				quetNhanBreadcrumb(
					docThay(DOC, BREADCRUMB, (s) =>
						s.replace("aria-label={nhan ?? msg.breadcrumb.nhan}", c),
					),
					[BREADCRUMB],
				).length === 0,
		);
		expect(lot).toEqual([]);
		expect(CACH_VIET_CUNG.length).toBe(7);
	});

	test("chieu do: tra lai nhan cung tieng Anh", () => {
		const doc = docThay(DOC, BREADCRUMB, (s) =>
			s.replace(
				"aria-label={nhan ?? msg.breadcrumb.nhan}",
				'aria-label="breadcrumb"',
			),
		);
		expect(quetNhanBreadcrumb(doc, [BREADCRUMB])).toContain(
			`cmt-quet: con aria-label breadcrumb cung o ${BREADCRUMB}`,
		);
	});

	test("chieu do: viet ba ngoi locale cung trong thanh phan", () => {
		const doc = docThay(DOC, BREADCRUMB, (s) =>
			s.replace(
				"aria-label={nhan ?? msg.breadcrumb.nhan}",
				`aria-label={locale === "vi" ? "${NHAN_VI}" : "Breadcrumb"}`,
			),
		);
		expect(quetNhanBreadcrumb(doc, [BREADCRUMB])).toContain(
			`cmt-quet: chu nhan breadcrumb viet cung o ${BREADCRUMB}`,
		);
	});
});
