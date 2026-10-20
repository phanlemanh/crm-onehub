import { spawnSync } from "node:child_process";
import {
	lstatSync,
	mkdirSync,
	readdirSync,
	rmSync,
	symlinkSync,
} from "node:fs";
import { join } from "node:path";
import {
	dungBanSao,
	GOC,
	goBanSao,
	KhongDo,
	thayMotLan,
} from "../../ca-chap-chon-cach-ly/rang/ban-sao.mjs";

const SO_CAP_KHAI = 7;
const TRAN_MS = 900_000;
const TZ = "TZ=Asia/Ho_Chi_Minh";
const VG = {
	lichApi: `bun run test -- "cd apps/api && ${TZ} bun test test/lich-bay-ngay.spec.ts"`,
	lichDb: `bun run test -- "cd packages/db && ${TZ} bun test test/lich-bay-ngay.spec.ts"`,
	tran: `bun run test -- "cd apps/api && ${TZ} bun test --timeout 120000 test/du-an-tran-viec.spec.ts"`,
	gantt: `cd packages/ui && ${TZ} bun test --preload ./test/setup-dom.ts ./test/gantt-bay-ngay.dom.tsx`,
	thuTu: `bun run test -- "cd apps/api && ${TZ} bun test test/lich-bay-ngay.spec.ts; r=\\$?; ${TZ} bun test test/lich-lam-viec.spec.ts || exit 1; exit \\$r"`,
};
const DU_AN = "packages/db/src/du-an.ts";
const GHI = "packages/db/src/viec-ghi.ts";
const LICH_SV = "apps/api/src/lich-lam-viec/lich-lam-viec.service.ts";
const GANTT = "packages/ui/src/components/gantt-du-an.tsx";
const BAI_LICH = "apps/api/test/lich-bay-ngay.spec.ts";

const CAP = [
	[
		"a docLichLam bo co khongNghiTuan",
		[[DU_AN, "ngayNghiTuan: cai?.khongNghiTuan", "ngayNghiTuan: false"]],
		[
			[VG.lichApi, "vg: get rong thanh"],
			[VG.lichDb, "vg: doc lich"],
			[VG.lichApi, "vg: tu doi bo cuoi tuan"],
		],
	],
	[
		"b datNgayNghiTuan khong tra co ve false",
		[
			[
				LICH_SV,
				"const khongNghiTuan = ds.length === 0;",
				"const khongNghiTuan = ds.length === 0 ? true : undefined;",
			],
		],
		[[VG.lichApi, "vg: hoan tac buoc"]],
	],
	[
		"d GanttDuAn bo weekendDays khi lich rong",
		[
			[
				GANTT,
				"weekendDays: lich.ngayNghiTuan.map(thuJs),",
				"weekendDays: lich.ngayNghiTuan.length > 0 ? lich.ngayNghiTuan.map(thuJs) : undefined,",
			],
		],
		[[VG.gantt, "vg gantt: to ngay nghi khi lich rong"]],
	],
	[
		"e docDuAnMo kiem lai tran 300",
		[
			[
				GHI,
				'\t\tthrow new LoiViec("khong-hop-le", DU_AN.thongDiep.daDong);\n\t}\n\treturn { id: da.id, ten: da.ten };',
				'\t\tthrow new LoiViec("khong-hop-le", DU_AN.thongDiep.daDong);\n\t}\n\tif ((await tx.viec.count({ where: { duAnId } })) >= DU_AN.viecToiDa) {\n\t\tthrow new LoiViec("khong-hop-le", DU_AN.thongDiep.viecToiDa);\n\t}\n\treturn { id: da.id, ten: da.ten };',
			],
		],
		[[VG.tran, "vg tran: them-moc P300 ra"]],
	],
	[
		"f bo tran o docDuAnNhanViec",
		[[GHI, "if (soViec >= DU_AN.viecToiDa) {", "if (soViec < 0) {"]],
		[[VG.tran, "vg tran: tao-viec P300 ra"]],
	],
	[
		"g bai moi bo buoc don lich",
		[
			[
				BAI_LICH,
				"\tif (chup === null) {\n\t\tawait db.appSetting.deleteMany({ where: { id: SETTINGS_ID } });\n\t} else {\n\t\tawait db.appSetting.update({\n\t\t\twhere: { id: SETTINGS_ID },\n\t\t\tdata: chup,\n\t\t});\n\t}\n",
				"",
			],
			[
				BAI_LICH,
				"if (json(sau) !== json(chup) || json(lichSau) !== json(lichTruoc)) {",
				"if (json(sau) === 'khong bao gio') {",
			],
		],
		[[VG.thuTu, "llv: mac dinh sai"]],
	],
	[
		"h bo khoa du an o docDuAnNhanViec",
		[
			[
				GHI,
				'\tawait tx.$queryRaw`SELECT id FROM "duAn" WHERE id = ${duAnId} FOR UPDATE`;\n\tconst da = await docDuAnMo(tx, duAnId);',
				"\tconst da = await docDuAnMo(tx, duAnId);",
			],
		],
		[[VG.tran, "vg tran: tranh nhau"]],
	],
];

function goiCuaBanSao(banSao, nhom, ten) {
	const nm = join(banSao, nhom, ten, "node_modules");
	if (!lstatSync(nm).isSymbolicLink()) return;
	rmSync(nm);
	mkdirSync(join(nm, "@crm"), { recursive: true });
	const goc = join(GOC, nhom, ten, "node_modules");
	for (const muc of readdirSync(goc)) {
		if (muc !== "@crm") symlinkSync(join(goc, muc), join(nm, muc));
	}
	for (const goi of readdirSync(join(goc, "@crm"))) {
		symlinkSync(join(banSao, "packages", goi), join(nm, "@crm", goi));
	}
}

function lenh(cwd, cmd) {
	const r = spawnSync("sh", ["-c", cmd], {
		cwd,
		encoding: "utf8",
		timeout: TRAN_MS,
		maxBuffer: 64 * 1024 * 1024,
	});
	return { ma: r.status, ra: `${r.stdout}\n${r.stderr}` };
}

const coGhim = (ra, ghim) =>
	ra.split("\n").some((d) => d.startsWith("error:") && d.includes(ghim));

const chiCap = new Set(
	(process.env.CHI_CAP ?? "").split(",").filter((x) => x !== ""),
);
const capChay = CAP.filter(([ten]) => chiCap.size === 0 || chiCap.has(ten[0]));

let banSao = null;
const xanh = new Map();
let daChay = 0;
const song = [];
let banSaoDo = false;
try {
	banSao = dungBanSao("vg");
	for (const [nhom, ten] of [
		["apps", "api"],
		["apps", "app"],
		["packages", "validation"],
		["packages", "ui"],
	]) {
		goiCuaBanSao(banSao, nhom, ten);
	}
	for (const [ten, sua, kiem] of capChay) {
		daChay += 1;
		for (const [cmd] of kiem) {
			if (!xanh.has(cmd)) xanh.set(cmd, lenh(banSao, cmd));
		}
		const traLai = [];
		const sau = [];
		try {
			for (const [tep, cu, moi] of sua)
				traLai.push(thayMotLan(banSao, tep, cu, moi));
			const daChayLenh = new Map();
			for (const [cmd, ghim] of kiem) {
				if (!daChayLenh.has(cmd)) daChayLenh.set(cmd, lenh(banSao, cmd));
				sau.push({ cmd, ghim, ...daChayLenh.get(cmd) });
			}
		} finally {
			for (const tra of traLai.reverse()) tra();
		}
		for (const s of sau) {
			const truoc = xanh.get(s.cmd);
			if (truoc.ma !== 0) {
				console.log(`vg dot bien: ban sao lanh do ${s.cmd}`);
				console.error(truoc.ra.slice(-1500));
				banSaoDo = true;
				continue;
			}
			const chet = s.ma !== 0 && coGhim(s.ra, s.ghim);
			console.log(
				`${ten} xanh=${truoc.ma} do=${s.ma} ghim=${coGhim(s.ra, s.ghim) ? "ok" : "thieu"} «${s.ghim}»`,
			);
			if (!chet) {
				console.log(`${ten[0]} song`);
				console.error(s.ra.slice(-1500));
				song.push(ten);
			}
		}
	}
} catch (loi) {
	if (banSao !== null) goBanSao(banSao);
	console.log(`KHONG DO DUOC: ${loi.message}`);
	process.exit(loi instanceof KhongDo ? 2 : 1);
}
if (banSao !== null) goBanSao(banSao);
if (banSaoDo) process.exit(1);
if (chiCap.size === 0 && daChay !== SO_CAP_KHAI) {
	console.log(`vg dot bien: thieu ${daChay}`);
	process.exit(1);
}
console.log(
	`vg dot bien: ${daChay - new Set(song).size}/${daChay} dot bien chet`,
);
process.exit(song.length === 0 ? 0 : 1);
