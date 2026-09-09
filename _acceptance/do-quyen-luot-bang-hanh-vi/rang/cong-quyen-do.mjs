import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	assertDanhTinh,
	chay,
	chayRang,
	coCo,
	DUONG_DISPATCH,
	hong,
	voiCaySao,
} from "./chung.mjs";

const GHIM = "cong dong khi hang khai CHAT";
const DUONG_PURPOSE = "apps/agent/agent/lib/session-purpose.ts";

const VECTO = {
	"mo-cong": (sao) => {
		const duong = join(sao, DUONG_PURPOSE);
		const nguon = readFileSync(duong, "utf8");
		const moc = `export function builderTurnAuthorized(ctx: PurposeContext): boolean {
	return (
		purposeOf(ctx) === "builder" &&
		attribute(ctx, "commandType") === "CREATE_AGENT"
	);
}`;
		if (!nguon.includes(moc)) hong(`khong tim thay moc de dot bien trong ${duong}`);
		writeFileSync(
			duong,
			nguon.replace(
				moc,
				`export function builderTurnAuthorized(_ctx: PurposeContext): boolean {
	return true;
}`,
			),
		);
	},
	"ternary-xuong-dong": (sao) => {
		const duong = join(sao, DUONG_DISPATCH);
		const nguon = readFileSync(duong, "utf8");
		const moc = "\t\t\tcommandType: row.commandType,";
		if (!nguon.includes(moc)) hong(`khong tim thay moc de dot bien trong ${duong}`);
		writeFileSync(
			duong,
			nguon.replace(
				moc,
				[
					"\t\t\tcommandType:",
					'\t\t\t\tJSON.stringify(row.message).includes("agent")',
					'\t\t\t\t\t? "CREATE_AGENT"',
					"\t\t\t\t\t: row.commandType,",
				].join("\n"),
			),
		);
	},
};

const chayBaiDo = (sao) =>
	chay(join(sao, "apps", "agent"), ["bun", "test", "test/quyen-luot.spec.ts"]);

chayRang(() => {
	const ten = coCo("--vecto");
	if (!ten) hong(`can --vecto <ten> — co: ${Object.keys(VECTO).join(", ")}`);
	const dotBien = VECTO[ten];
	if (!dotBien) hong(`khong co vecto ten "${ten}" — co: ${Object.keys(VECTO).join(", ")}`);

	const ma = voiCaySao(({ sao }) => {
		assertDanhTinh(sao);
		const truoc = chayBaiDo(sao);
		if (truoc.ma !== 0) {
			hong(
				`doi chung duong hong: cay sao chua dot bien da do (ma ${truoc.ma})\n  cay sao: ${sao}\n${truoc.chu}`,
			);
		}
		dotBien(sao);
		const sau = chayBaiDo(sao);
		process.stdout.write(`cay sao: ${sao}\nvecto: ${ten}\n`);
		if (sau.ma === 0) {
			hong(
				`${GHIM}\n  vecto "${ten}" ra XANH — bai do khong bat duoc dot bien nay\n  cay sao: ${sao}`,
			);
		}
		process.stdout.write(`${GHIM}\n  vecto "${ten}" lam bai do do, ma ${sau.ma}\n`);
		return sau.ma;
	});
	process.exitCode = ma;
});
