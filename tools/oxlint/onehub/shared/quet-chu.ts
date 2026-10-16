import type { Context, Visitor } from "@oxlint/plugins";

export function quetChu(tuCam: readonly string[], messageId: string) {
	const mau = new RegExp(`\\b(${tuCam.join("|")})\\b`, "g");
	return (context: Context): Visitor => ({
		Program() {
			const { sourceCode } = context;
			for (const khop of sourceCode.text.matchAll(mau)) {
				const dau = khop.index;
				context.report({
					loc: {
						start: sourceCode.getLocFromIndex(dau),
						end: sourceCode.getLocFromIndex(dau + khop[0].length),
					},
					messageId,
					data: { tu: khop[1] },
				});
			}
		},
	});
}
