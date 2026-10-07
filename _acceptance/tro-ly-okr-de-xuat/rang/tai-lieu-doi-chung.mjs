import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RANG = dirname(fileURLToPath(import.meta.url));
const GOC = join(RANG, "..", "..", "..");

const DOI_CHUNG = {
	thuoc: join(RANG, "tai-lieu.mjs"),
	api: join(GOC, "docs", "api.md"),
	agent: join(GOC, "docs", "agent.md"),
	thuTucBo: "troLyQuyet",
	tepConTrongCay: "packages/ui/src/components/dialog.tsx",
	tepDaGo: "packages/ui/src/components/suggestion.tsx",
	cayTruocKhiGo: "7875d145eec958d927d9a42a1f774b736cefd21b^1",
};

function chay(env) {
	const kq = spawnSync(process.execPath, [DOI_CHUNG.thuoc], {
		encoding: "utf8",
		env: { ...process.env, ...env },
	});
	return { ma: kq.status, loi: kq.stderr.trim().split("\n").filter(Boolean) };
}

function boDongTep(noiDung, tep) {
	const dong = noiDung.split("\n");
	const i = dong.findIndex((d) => d.startsWith(`- \`${tep}\``));
	if (i === -1) throw new Error(`doi chung: khong thay dong ${tep}`);
	let j = i + 1;
	while (j < dong.length && dong[j].startsWith("  ")) j += 1;
	return [...dong.slice(0, i), ...dong.slice(j)].join("\n");
}

function themDongTep(noiDung, truocTep, tep) {
	const moc = `- \`${truocTep}\``;
	if (!noiDung.includes(moc)) throw new Error(`doi chung: khong thay ${moc}`);
	return noiDung.replace(moc, `- \`${tep}\` — dong gia.\n${moc}`);
}

function main() {
	const thu = mkdtempSync(join(tmpdir(), "tai-lieu-doi-chung-"));
	const ghi = (ten, noiDung) => {
		const tep = join(thu, ten);
		writeFileSync(tep, noiDung);
		return tep;
	};
	try {
		const api = readFileSync(DOI_CHUNG.api, "utf8");
		const agent = readFileSync(DOI_CHUNG.agent, "utf8");
		const ca = [
			{
				ten: "api.md bo mot thu tuc",
				env: {
					TAI_LIEU_API: ghi(
						"api.md",
						api.replaceAll(DOI_CHUNG.thuTucBo, "thuTucDaXoa"),
					),
				},
				mong: [`tai lieu thieu thu tuc: ${DOI_CHUNG.thuTucBo}`],
			},
			{
				ten: "agent.md bo mot tep hang con trong cay",
				env: {
					TAI_LIEU_AGENT: ghi(
						"agent-bo.md",
						boDongTep(agent, DOI_CHUNG.tepConTrongCay),
					),
				},
				mong: [`tai lieu thieu tep hang: ${DOI_CHUNG.tepConTrongCay}`],
			},
			{
				ten: "agent.md ke tep da go khoi cay",
				env: {
					TAI_LIEU_AGENT: ghi(
						"agent-them.md",
						themDongTep(agent, DOI_CHUNG.tepConTrongCay, DOI_CHUNG.tepDaGo),
					),
				},
				mong: [
					`tai lieu thua tep hang (khong con trong diff giao release va cay): ${DOI_CHUNG.tepDaGo}`,
				],
			},
			{
				ten: "cay truoc khi go Suggestion van doi tep do",
				env: { TAI_LIEU_REF_CAY: DOI_CHUNG.cayTruocKhiGo },
				mong: [`tai lieu thieu tep hang: ${DOI_CHUNG.tepDaGo}`],
			},
		];
		let hong = 0;
		for (const c of ca) {
			const kq = chay(c.env);
			const dung =
				kq.ma === 1 &&
				kq.loi.length === c.mong.length &&
				c.mong.every((m) => kq.loi.includes(m));
			if (!dung) hong += 1;
			console.log(
				`${dung ? "dung" : "SAI"} — ${c.ten}: exit ${kq.ma}; ${kq.loi.join(" | ")}`,
			);
		}
		if (hong > 0) {
			console.error(
				`tai-lieu-doi-chung: ${hong}/${ca.length} ca khong do chieu do`,
			);
			return 1;
		}
		console.log(
			`tai-lieu-doi-chung: ${ca.length}/${ca.length} ca do dung chieu do.`,
		);
		return 0;
	} finally {
		rmSync(thu, { recursive: true, force: true });
	}
}

process.exit(main());
