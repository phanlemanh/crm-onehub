import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "../../../packages/validation/node_modules/zod/index.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "..", "..", "..");
const SLUG = "gan-tay-va-kara-co-ly-do";
const RA = join(GOC, ".acceptance-runs", SLUG, "dot-bien");
const LUAT = "packages/validation/src/ly-do-can-chinh.ts";
const SV = "apps/api/src/okr/okr.service.ts";
const TRO_LY = "apps/api/src/okr/tro-ly.service.ts";
const BO_GHI = "apps/agent/agent/lib/okr/nop-de-xuat.ts";
const CONG_CU = "apps/agent/agent/subagents/tro_ly_okr/tools/nop_de_xuat.ts";
const HOP = "apps/app/app/(app)/[slug]/okr/hop-thoai-can-chinh.tsx";
const NHOM = "apps/app/app/(app)/[slug]/okr/nhom-kara.tsx";
const CHAN = [
	"l4_luat",
	"l4_gan",
	"l4_sua",
	"l4_can_cu",
	"l4_nhan",
	"l4_sua_de_xuat",
	"l4_hop_thoai",
	"l4_de_xuat",
];

const config = Bun.YAML.parse(
	readFileSync(join(GOC, "_acceptance/config.yaml"), "utf8"),
);
const lenhCua = (khoa) => {
	const r = z.string().safeParse(config.executors.test[khoa]);
	if (!r.success) throw new Error(`khong co executors.test.${khoa}`);
	return r.data;
};
const chay = (lenh) => {
	const r = spawnSync("bash", ["-c", lenh], {
		cwd: GOC,
		encoding: "utf8",
		maxBuffer: 256 << 20,
	});
	return { ma: r.status, ra: `${r.stdout}${r.stderr}` };
};
const bam = (tep) =>
	createHash("sha256")
		.update(readFileSync(join(GOC, tep)))
		.digest("hex");

const thay = (a, b) => (s) => {
	const lan = s.split(a).length - 1;
	if (lan !== 1)
		throw new Error(`vet khong cam duoc: «${a}» xuat hien ${lan} lan`);
	return s.replace(a, b);
};

const VET = [
	{
		ten: "(a) bo luat can cu can ly do",
		tep: LUAT,
		cam: thay(
			"if (d.canCu !== null && d.lyDo === null)",
			"if (d.canCu === undefined)",
		),
		lenh: lenhCua("l4_luat"),
		ghim: "can cu thieu ly do lot qua",
	},
	{
		ten: "(b) gan tay bo ly do",
		tep: SV,
		cam: thay(
			"chu.lyDo === null ? undefined : { ...chu, lyDoTuKara: false };",
			"undefined;",
		),
		lenh: lenhCua("l4_gan"),
		ghim: "ly do gan tay bi roi",
	},
	{
		ten: "(c) sua khong ha co Kara",
		tep: SV,
		cam: thay("data: { ...chu, lyDoTuKara: false },", "data: { ...chu },"),
		lenh: lenhCua("l4_sua"),
		ghim: "co Kara con sau khi nguoi sua",
	},
	{
		ten: "(d) bo ghi khong luu noiDung",
		tep: BO_GHI,
		cam: thay(
			'd.loai === "can-chinh" && d.canCu ? { canCu: d.canCu } : undefined,',
			"undefined,",
		),
		lenh: lenhCua("l4_can_cu"),
		ghim: "can cu Kara bi roi khi nop",
	},
	{
		ten: "(e) nhan de xuat khong truyen ly do",
		tep: TRO_LY,
		cam: thay("{ ...ghi, lyDo: lyDo ?? undefined },", "ghi,"),
		lenh: lenhCua("l4_nhan"),
		ghim: "nhan de xuat roi ly do",
	},
	{
		ten: "(f) sua roi nhan van dau Kara",
		tep: TRO_LY,
		cam: thay(
			': { lyDo: { ...chu, lyDoTuKara: false }, cach: "sua" };',
			': { lyDo: { ...chu, lyDoTuKara: true }, cach: "sua" };',
		),
		lenh: lenhCua("l4_sua_de_xuat"),
		ghim: "sua roi nhan van dau Kara",
	},
	{
		ten: "(g) muc tin hop thoai theo do dai",
		tep: HOP,
		cam: thay(
			"const mucTin = mucTinCanChinh(lyDo, canCu);",
			'const mucTin = lyDo.length > 0 ? (canCu.length > 0 ? "co-so-lieu" : "dat-cuoc") : "chua-co-ly-do";',
		),
		lenh: lenhCua("l4_hop_thoai"),
		ghim: "muc tin hop thoai sai",
	},
	{
		ten: "(h) bo dong can cu cua de xuat",
		tep: NHOM,
		cam: thay("{d.canCu ? (", "{false && d.canCu ? ("),
		lenh: lenhCua("l4_de_xuat"),
		ghim: "thieu dong can cu",
	},
	{
		ten: "(i) cong cu bo can cu",
		tep: CONG_CU,
		cam: thay(
			"execute: (input, ctx) => nopDeXuatVao(input, ctx),",
			"execute: (input, ctx) => nopDeXuatVao({ dong: input.dong.map(({ canCu: _c, ...d }) => d) }, ctx),",
		),
		lenh: lenhCua("l4_can_cu"),
		ghim: "can cu Kara bi roi khi nop",
	},
	{
		ten: "(j) sua y chu van ha co",
		tep: TRO_LY,
		cam: thay(
			"const yNguyen = chu.lyDo === cuaKara.lyDo && chu.canCu === cuaKara.canCu;",
			"const yNguyen = false;",
		),
		lenh: lenhCua("l4_sua_de_xuat"),
		ghim: "sua y chu van ha co",
	},
];

mkdirSync(RA, { recursive: true });
const nen = CHAN.map((k) => ({ k, ...chay(lenhCua(k)) }));
const chuaXanh = nen.filter((x) => x.ma !== 0);
if (chuaXanh.length) {
	console.log(
		`KHONG DO DUOC: chua pha gi ma ${chuaXanh.map((x) => `${x.k}(${x.ma})`).join(" · ")} da khong xanh`,
	);
	process.exit(2);
}
console.log(
	`chieu xanh: ${CHAN.length}/${CHAN.length} chan xanh tren cay lanh`,
);

let bat = 0;
for (const v of VET) {
	const duong = join(GOC, v.tep);
	const truoc = readFileSync(duong, "utf8");
	const bamTruoc = bam(v.tep);
	let r;
	try {
		const sau = v.cam(truoc);
		if (sau === truoc) throw new Error(`vet ${v.ten} khong doi gi`);
		writeFileSync(duong, sau);
		r = chay(v.lenh);
		writeFileSync(join(RA, `${v.ten.slice(1, 2)}.txt`), r.ra);
	} finally {
		writeFileSync(duong, truoc);
	}
	if (bam(v.tep) !== bamTruoc) {
		console.log(`TEP KHONG TRA LAI: ${v.tep}`);
		process.exit(3);
	}
	const duBat = r.ma !== 0 && r.ra.includes(v.ghim);
	if (duBat) bat += 1;
	console.log(
		`${duBat ? "bat" : "MU"} ${v.ten}: ${r.ma !== 0 ? "do" : "XANH"}${r.ra.includes(v.ghim) ? "" : ` (thieu «${v.ghim}»)`}`,
	);
}
const ban = execFileSync(
	"git",
	[
		"-C",
		GOC,
		"diff",
		"--name-only",
		"--",
		LUAT,
		SV,
		TRO_LY,
		BO_GHI,
		CONG_CU,
		HOP,
		NHOM,
	],
	{ encoding: "utf8" },
).trim();
if (ban) {
	console.log(`cay ban sau dot bien: ${ban}`);
	process.exit(3);
}
console.log(`dot-bien: ${bat}/${VET.length} vet bi bat, tep tra lai nguyen`);
process.exit(bat === VET.length ? 0 : 1);
