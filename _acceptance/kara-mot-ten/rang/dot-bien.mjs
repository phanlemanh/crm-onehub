import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	dungBanSao,
	GOC,
	goBanSao,
	KhongDo,
	thayMotLan,
} from "../../ca-chap-chon-cach-ly/rang/ban-sao.mjs";

const SO_CAP_KHAI = 7;
const TRAN_LENH_MS = 300_000;
const LUAT = "cd apps/app && bun test ./test/kara-mot-ten.spec.ts -t kmt-luat";
const LUAT_TEP = "apps/app/test/kara-mot-ten-luat.ts";
const MO_VAT = "export const VAT_DOI_DUNG: ReadonlySet<string> = new Set([\n";

function thayLanDau(dich, tep, cu, moi) {
	const duong = join(dich, tep);
	const goc = readFileSync(duong, "utf8");
	if (!goc.includes(cu)) throw new KhongDo(`moc trong ${tep} khong co`);
	writeFileSync(duong, goc.replace(cu, moi));
	return () => writeFileSync(duong, goc);
}

const CAP = [
	{
		ten: "a okr-soan Trợ lý",
		pha: (d) =>
			thayMotLan(
				d,
				"apps/app/lib/messages/okr-soan.ts",
				'"Kara đang soạn…"',
				'"Trợ lý đang soạn…"',
			),
		ghim: "apps/app/lib/messages/okr-soan.ts#hoiThoai.dangSoan vi: Trợ lý",
	},
	{
		ten: "b tai-lieu en the composer",
		pha: (d) =>
			thayMotLan(
				d,
				"apps/app/lib/messages/tai-lieu.ts",
				'"Kara is drafting the first version."',
				'"The composer is drafting the first version."',
			),
		ghim: "apps/app/lib/messages/tai-lieu.ts#doc.cho.may-soan.tieuDe en: composer",
	},
	{
		ten: "c crm tác nhân",
		pha: (d) =>
			thayMotLan(
				d,
				"apps/app/lib/messages/crm.ts",
				'"Kara đang tra cứu"',
				'"tác nhân đang tra cứu"',
			),
		ghim: "apps/app/lib/messages/crm.ts#enrichment.agentResearching vi: tác nhân",
	},
	{
		ten: "d ui roleAssistant Assistant",
		pha: (d) =>
			thayLanDau(
				d,
				"packages/ui/src/lib/messages.ts",
				'roleAssistant: "Kara"',
				'roleAssistant: "Assistant"',
			),
		ghim: "packages/ui/src/lib/messages.ts#chatMessage.roleAssistant en: assistant",
	},
	{
		ten: "e validation Trợ lý AI",
		pha: (d) =>
			thayMotLan(
				d,
				"packages/validation/src/tai-lieu-hoi.ts",
				'"Kara tạm dừng vì hết hạn mức tháng."',
				'"Trợ lý AI tạm dừng vì hết hạn mức tháng."',
			),
		ghim: "packages/validation/src/tai-lieu-hoi.ts:",
	},
	{
		ten: "f tin-nhac Trợ lý OKR",
		pha: (d) =>
			thayMotLan(
				d,
				"apps/agent/agent/lib/tin-nhac.ts",
				'"okr-tom-tat": "Kara · OKR"',
				'"okr-tom-tat": "Trợ lý OKR"',
			),
		ghim: "apps/agent/agent/lib/tin-nhac.ts:",
	},
	{
		ten: "g vat doi dung lech kiem-ke",
		pha: (d) =>
			thayMotLan(
				d,
				LUAT_TEP,
				MO_VAT,
				`${MO_VAT}\t"apps/app/lib/messages/crm.ts#fields.agentLabel",\n`,
			),
		ghim: "kmt: vat doi dung lech kiem-ke apps/app/lib/messages/crm.ts#fields.agentLabel",
	},
];

function chay(dich) {
	const r = spawnSync("bash", ["-c", LUAT], {
		cwd: dich,
		encoding: "utf8",
		timeout: TRAN_LENH_MS,
	});
	return { ma: r.status, ra: `${r.stdout}${r.stderr}` };
}

if (CAP.length !== SO_CAP_KHAI) {
	process.stderr.write(
		`dot-bien: ${CAP.length} cap khac SO_CAP_KHAI ${SO_CAP_KHAI}\n`,
	);
	process.exit(1);
}

const truocTep = spawnSync("git", ["status", "--porcelain"], {
	cwd: GOC,
	encoding: "utf8",
}).stdout;
const dich = dungBanSao("kmt");
let dat = 0;
try {
	const lanh = chay(dich);
	if (lanh.ma !== 0) {
		process.stderr.write(`dot-bien: ban sao lanh khong xanh\n${lanh.ra}\n`);
		process.exit(1);
	}
	for (const cap of CAP) {
		const hoan = cap.pha(dich);
		try {
			const { ma, ra } = chay(dich);
			const dung = ma !== 0 && ra.includes(cap.ghim);
			process.stdout.write(
				`dot-bien: ${cap.ten} ${dung ? "dat" : `KHONG DAT (ma ${ma})`}\n`,
			);
			if (dung) dat += 1;
			else process.stderr.write(`${ra.slice(-3000)}\n`);
		} finally {
			hoan();
		}
	}
} catch (e) {
	if (e instanceof KhongDo) {
		process.stderr.write(`dot-bien: ${e.message}\n`);
		process.exit(1);
	}
	throw e;
} finally {
	goBanSao(dich);
}
const sauTep = spawnSync("git", ["status", "--porcelain"], {
	cwd: GOC,
	encoding: "utf8",
}).stdout;
if (sauTep !== truocTep) {
	process.stderr.write("dot-bien: cay that bi doi\n");
	process.exit(1);
}
process.stdout.write(`dot-bien: ${dat}/${SO_CAP_KHAI} cap dat\n`);
process.exit(dat === SO_CAP_KHAI ? 0 : 1);
