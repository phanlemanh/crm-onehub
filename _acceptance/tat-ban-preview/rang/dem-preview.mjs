import { BA_DU_AN, LoiApi, vercelApi } from "./vercel-doc.mjs";

const tu = Date.parse(process.argv[2] ?? "");
if (Number.isNaN(tu)) {
	console.log("dung: dem-preview.mjs <ISO luc gop>");
	process.exit(2);
}
try {
	let tong = 0;
	for (const duAn of BA_DU_AN) {
		const ds =
			vercelApi(
				`/v6/deployments?projectId=${duAn}&target=preview&since=${tu}&limit=100`,
			).deployments ?? [];
		tong += ds.length;
		console.log(
			`${duAn}: ${ds.length} ban Preview tu ${new Date(tu).toISOString()}${
				ds.length
					? ` — ${ds
							.slice(0, 5)
							.map((d) => `${d.uid} ${d.meta?.githubCommitRef ?? ""}`)
							.join(", ")}`
					: ""
			}`,
		);
	}
	process.exit(tong === 0 ? 0 : 1);
} catch (loi) {
	console.log(`LOI-API: ${loi instanceof LoiApi ? loi.message : String(loi)}`);
	process.exit(2);
}
