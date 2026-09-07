import { bam, docConfig, ketThuc, moiOCam, NEO, napHamKit } from "./chung.mjs";

const bamDau = bam(docConfig());
const chu = docConfig();
const { giai } = napHamKit();
const khoa = moiOCam(chu);

if (khoa.length !== NEO.oCamTong) {
	console.error(`MA 2: dan so ${khoa.length} khac neo ${NEO.oCamTong}`);
	ketThuc(bamDau, 2);
}

let cay;
try {
	cay = Bun.YAML.parse(chu);
} catch (e) {
	console.error(`MA 2: khong parse duoc bang YAML — ${e.message}`);
	ketThuc(bamDau, 2);
}

const theoYaml = (k) => {
	const [, nhom, ten] = k.split(".");
	const v = cay?.executors?.[nhom]?.[ten];
	return v === undefined ? undefined : String(v);
};

const lech = [];
for (const k of khoa) {
	const a = giai(chu, k);
	const b = theoYaml(k);
	if (a !== b) lech.push({ k, kit: a, yaml: b });
}

console.log(
	`o cam so: ${khoa.length} · lech giua hai trinh doc: ${lech.length}`,
);

if (lech.length > 0) {
	console.error("DO: hai trinh doc tra ve chuoi KHAC nhau:");
	for (const l of lech.slice(0, 12)) {
		console.error(`  ${l.k}`);
		console.error(`     kit : ${JSON.stringify(l.kit)}`);
		console.error(`     yaml: ${JSON.stringify(l.yaml)}`);
	}
	ketThuc(bamDau, 1);
}

const beHong = chu.replace(
	/^ {4}lint_slop:.*$/m,
	'    lint_slop: bun run lint:slop -- "x"',
);
const aH = giai(beHong, "executors.script.lint_slop");
const bH = Bun.YAML.parse(beHong)?.executors?.script?.lint_slop;
if (aH === bH) {
	console.error(
		"DO: cay da be hong (gia tri ket thuc bang nhay kep khong boc) ma hai trinh doc VAN trung nhau — phep do nay khong bat duoc lop loi cua vong.",
	);
	ketThuc(bamDau, 1);
}
console.log(
	`chieu do: ban be hong -> kit ${JSON.stringify(aH)} · yaml ${JSON.stringify(bH)}`,
);

console.log(
	`XANH: ca ${khoa.length} o cam, hai trinh doc tra ve cung mot chuoi tung ky tu.`,
);
ketThuc(bamDau, 0);
