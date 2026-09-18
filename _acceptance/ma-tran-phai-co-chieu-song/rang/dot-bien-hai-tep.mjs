import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	chay,
	chayRang,
	coCo,
	DUONG_DISPATCH,
	hong,
	hongGian,
	RANG as RANG_CU,
	voiCaySao,
} from "../../do-quyen-luot-bang-hanh-vi/rang/chung.mjs";

const GHIM = "dot bien hai tep khong do dung cho";
const DUONG_CONG = "apps/agent/agent/lib/session-purpose.ts";
const SAN_CAM_TIN_NHAN = join(RANG_CU, "khong-cam-tin-nhan.mjs");
const SAN_NGUON_GHI = join(RANG_CU, "nguon-ghi.mjs");

function doiTrongSao(sao, duong, tim, thay) {
	const d = join(sao, duong);
	const nguon = readFileSync(d, "utf8");
	if (!nguon.includes(tim)) {
		hongGian(`khong tim thay moc de dot bien trong ${d}`);
	}
	writeFileSync(d, nguon.replace(tim, thay));
}

function chayBai(sao, loc) {
	return chay(join(sao, "apps", "agent"), [
		"bun",
		"test",
		"test/quyen-luot.spec.ts",
		"-t",
		loc,
	]);
}

function chayHaiSan(sao) {
	return {
		camTinNhan: chay(sao, ["node", SAN_CAM_TIN_NHAN, "--goc", sao]),
		nguonGhi: chay(sao, ["node", SAN_NGUON_GHI, "--goc", sao]),
	};
}

function camKhoaMoi(sao) {
	doiTrongSao(
		sao,
		DUONG_DISPATCH,
		"export type BuilderSessionAttributes = {\n\tpurpose: \"builder\";",
		"export type BuilderSessionAttributes = {\n\tpurpose: \"builder\";\n\tcoOptionId: string;",
	);
	doiTrongSao(
		sao,
		DUONG_DISPATCH,
		"export function builderSessionAttributes(input: {\n\tcommandType: string;",
		"export function builderSessionAttributes(input: {\n\tcommandType: string;\n\tcoOptionId: string;",
	);
	doiTrongSao(
		sao,
		DUONG_DISPATCH,
		"\treturn {\n\t\tpurpose: \"builder\",\n\t\tcommandType: input.commandType,",
		"\treturn {\n\t\tpurpose: \"builder\",\n\t\tcoOptionId: input.coOptionId,\n\t\tcommandType: input.commandType,",
	);
	doiTrongSao(
		sao,
		DUONG_DISPATCH,
		"\t\tattributes: builderSessionAttributes({\n\t\t\tcommandType: row.commandType,",
		[
			"\t\tattributes: builderSessionAttributes({",
			"\t\t\tcoOptionId: String(",
			"\t\t\t\tBoolean(",
			"\t\t\t\t\t(row.message as { inputResponse?: { optionId?: string } })",
			"\t\t\t\t\t\t?.inputResponse?.optionId,",
			"\t\t\t\t),",
			"\t\t\t),",
			"\t\t\tcommandType: row.commandType,",
		].join("\n"),
	);
	doiTrongSao(
		sao,
		DUONG_CONG,
		'\t\tpurposeOf(ctx) === "builder" &&\n\t\tattribute(ctx, "commandType") === "CREATE_AGENT"',
		[
			'\t\tpurposeOf(ctx) === "builder" &&',
			'\t\t(attribute(ctx, "commandType") === "CREATE_AGENT" ||',
			'\t\t\tattribute(ctx, "coOptionId") === "true")',
		].join("\n"),
	);
}

const DUONG_SERVICE = "apps/api/src/conversations/conversations.service.ts";

function camHinhDangCu(sao) {
	doiTrongSao(
		sao,
		DUONG_DISPATCH,
		"\t\t\tcommandType: row.commandType,",
		[
			"\t\t\tcommandType: JSON.stringify(row.message).includes(\"agent\")",
			'\t\t\t\t? "CREATE_AGENT"',
			"\t\t\t\t: row.commandType,",
		].join("\n"),
	);
	doiTrongSao(
		sao,
		DUONG_SERVICE,
		"\n\t\t\t\t\t\tcommandType: input.commandType,",
		'\n\t\t\t\t\t\tcommandType: "CREATE_AGENT",',
	);
}

function chayMotVecto(ten) {
	if (ten !== "khoa-moi-o-cong") {
		hongGian(`khong co vecto ten "${ten}" — co: khoa-moi-o-cong`);
	}
	return voiCaySao(({ sao }) => {
		process.stdout.write(`cay sao: ${sao}\nvecto: khoa-moi-o-cong\n`);

		const truocBatBien = chayBai(sao, "bat-bien");
		const truocSuyDien = chayBai(sao, "suy-dien");
		if (truocBatBien.ma !== 0 || truocSuyDien.ma !== 0) {
			hongGian(
				`doi chung duong hong: cay sao chua dot bien da do (bat-bien ma ${truocBatBien.ma}, suy-dien ma ${truocSuyDien.ma})`,
			);
		}

		camKhoaMoi(sao);

		const loi = [];
		const sauBatBien = chayBai(sao, "bat-bien");
		if (sauBatBien.ma === 0) {
			loi.push(
				"dieu 1: bai cua AC-1 (bat-bien) VAN XANH duoi dot bien — bat bien khong bat duoc khoa moi",
			);
		}
		const sauSuyDien = chayBai(sao, "suy-dien");
		if (sauSuyDien.ma === 0) {
			loi.push(
				"dieu 2: bai cua AC-2 (suy-dien) VAN XANH duoi dot bien — cong khong mo du khoa moi bat",
			);
		}

		const san = chayHaiSan(sao);
		process.stdout.write(
			[
				`  san 1: ${SAN_CAM_TIN_NHAN} --goc ${sao} -> ma ${san.camTinNhan.ma}`,
				`  san 2: ${SAN_NGUON_GHI} --goc ${sao} -> ma ${san.nguonGhi.ma}`,
				"",
			].join("\n"),
		);
		if (san.camTinNhan.ma !== 0 || san.nguonGhi.ma !== 0) {
			loi.push(
				`dieu 3: mot san AST DA DO voi dot bien nay (khong-cam-tin-nhan ma ${san.camTinNhan.ma}, nguon-ghi ma ${san.nguonGhi.ma}) — vong nay dang lap lai mot san da co, khong mua them gi`,
			);
		}

		camHinhDangCu(sao);
		const sanCu = chayHaiSan(sao);
		process.stdout.write(
			[
				"  doi chung duong cho dieu 3 — cam hinh dang cu vao DUNG dia phan tung san:",
				`    san 1 -> ma ${sanCu.camTinNhan.ma}`,
				`    san 2 -> ma ${sanCu.nguonGhi.ma}`,
				"",
			].join("\n"),
		);
		if (sanCu.camTinNhan.ma === 0 || sanCu.nguonGhi.ma === 0) {
			hongGian(
				`hai san doc nham cay: doi chung duong cua dieu 3 khong do (khong-cam-tin-nhan ma ${sanCu.camTinNhan.ma}, nguon-ghi ma ${sanCu.nguonGhi.ma}) — moi ket luan cua dieu 3 la rong`,
			);
		}

		if (loi.length > 0) {
			hong(`${GHIM}\n${loi.map((l) => `  ${l}`).join("\n")}`);
		}

		process.stdout.write(
			"dot-bien-hai-tep: bon dieu deu dung — bai hanh vi bat duoc khoa moi, hai san AST thi khong, va hai san van doc dung cay\n",
		);
		return 0;
	});
}

chayRang(() => {
	process.exitCode = chayMotVecto(coCo("--vecto") ?? "khoa-moi-o-cong");
});
