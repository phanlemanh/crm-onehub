import { bam, docConfig, ketThuc } from "./chung.mjs";

const bamDau = bam(docConfig());
const chu = docConfig();

let cay;
try {
	cay = Bun.YAML.parse(chu);
} catch (e) {
	console.error(
		`DO: config.yaml khong parse duoc bang trinh doc YAML that — ${e.message}`,
	);
	ketThuc(bamDau, 1);
}

const thieu = [];
if (!cay?.executors?.script) thieu.push("executors.script");
if (!cay?.executors?.test) thieu.push("executors.test");
if (
	!Array.isArray(cay?.feature_loop?.suite_keys) ||
	cay.feature_loop.suite_keys.length === 0
)
	thieu.push("feature_loop.suite_keys");

console.log(
	`YAML doc duoc · script ${Object.keys(cay?.executors?.script ?? {}).length} · test ${Object.keys(cay?.executors?.test ?? {}).length} · suite_keys ${(cay?.feature_loop?.suite_keys ?? []).length}`,
);

if (thieu.length > 0) {
	console.error(`DO: parse duoc nhung thieu nhanh: ${thieu.join(", ")}`);
	ketThuc(bamDau, 1);
}

const beHong = chu.replace(
	/^ {4}lint_slop:.*$/m,
	"    lint_slop: bun run x -- if: github.repository == 'a/b'",
);
let nem = false;
try {
	Bun.YAML.parse(beHong);
} catch {
	nem = true;
}
if (!nem) {
	console.error(
		"DO: cay da be hong (gia tri chua ': ' ngoai ngoac) ma trinh doc YAML KHONG nem loi — phep do nay khong phan biet duoc file lanh voi file hong.",
	);
	ketThuc(bamDau, 1);
}

console.log(
	"XANH: file lanh parse duoc, va ban be hong thi nem loi — cap hai chieu tren cung mot vat.",
);
ketThuc(bamDau, 0);
