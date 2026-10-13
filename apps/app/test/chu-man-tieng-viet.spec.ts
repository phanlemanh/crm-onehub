import { describe, expect, test } from "bun:test";
import { type DocTep, docTuDia, GOC_KHO, moiTepTsx } from "./lib/quet-jsx";

const BREADCRUMB = "packages/ui/src/components/breadcrumb.tsx";
const CAI_DAT = "apps/app/components/cai-dat-breadcrumb.tsx";
const MESSAGES = "packages/ui/src/lib/messages.ts";
const NHAN_VI = "Vị trí trang";

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
		if (nguon.includes('aria-label="breadcrumb"')) {
			loi.push(`cmt-quet: con aria-label breadcrumb cung o ${t}`);
		}
		if (nguon.includes(NHAN_VI)) {
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

	test("chu nhan chi song trong messages.ts, du hai ngon ngu", () => {
		const m = DOC(MESSAGES) ?? "";
		expect(m).toContain(`nhan: "${NHAN_VI}"`);
		expect(m).toContain('nhan: "Breadcrumb"');
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
