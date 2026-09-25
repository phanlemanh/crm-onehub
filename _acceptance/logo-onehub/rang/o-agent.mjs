import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const TEP = "apps/app/components/crm/agent-panel.tsx";
const SO_CHO = 2;
const BOC = [
	{ ten: "man trong", mo: "<EmptyMedia" },
	{ ten: "AgentAvatar", mo: "<MessageAvatar" },
];
const O_TO = "bg-foreground";

const dong = [];
let sai = 0;

function ket(ma) {
	for (const d of dong) console.log(d);
	console.log(`KET LUAN: ${dong.filter((d) => d.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`);
	process.exit(ma);
}

function kiem(nhan, dat) {
	if (dat) dong.push(`DUNG ${nhan}`);
	else {
		sai += 1;
		dong.push(`SAI ${nhan}`);
	}
}

const duong = resolve(GOC, TEP);
if (!existsSync(duong)) {
	dong.push(`KHONG DO DUOC: khong thay ${TEP}`);
	ket(2);
}
const ma = readFileSync(duong, "utf8");
const cho = [...ma.matchAll(/<Logo\b/g)].map((m) => m.index);
if (cho.length !== SO_CHO) {
	dong.push(`KHONG DO DUOC: ${TEP} co ${cho.length} cho <Logo, can ${SO_CHO}`);
	ket(2);
}
kiem(`${TEP} co dung ${SO_CHO} cho <Logo`, true);

for (const b of BOC) {
	const viTri = cho.find((i) => {
		const mo = ma.lastIndexOf(b.mo, i);
		return mo !== -1 && !ma.slice(mo, i).includes(`</${b.mo.slice(1)}`);
	});
	if (viTri === undefined) {
		kiem(`${b.ten}: khong thay <Logo nam trong ${b.mo}>`, false);
		continue;
	}
	const hetLogo = ma.indexOf("/>", viTri);
	if (hetLogo === -1) {
		kiem(`${b.ten}: the <Logo khong dong`, false);
		continue;
	}
	const doan = ma.slice(ma.lastIndexOf(b.mo, viTri), hetLogo + 2);
	kiem(
		doan.includes(O_TO) ? `${b.ten}: o ${O_TO} quanh logo` : `${b.ten}: khong o ${O_TO} quanh logo`,
		!doan.includes(O_TO),
	);
	if (b.ten === "AgentAvatar") {
		const theMo = doan.match(/^<MessageAvatar\b([^>]*)>/)?.[1] ?? "";
		kiem(
			/\bsquare\b/.test(theMo) ? "AgentAvatar: MessageAvatar vuong" : "AgentAvatar: MessageAvatar khong vuong",
			/\bsquare\b/.test(theMo),
		);
		const conDau = doan.replace(b.mo, "").replace(/^[^>]*>/, "").trim().replace(/<Logo\b[^>]*\/>$/, "").trim();
		kiem(
			conDau === "" ? "AgentAvatar: logo la con dau tien cua MessageAvatar" : `AgentAvatar: con dau tien cua MessageAvatar khong phai logo (${conDau.slice(0, 40)})`,
			conDau === "",
		);
	}
}

ket(sai === 0 ? 0 : 1);
