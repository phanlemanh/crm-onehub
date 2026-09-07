import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const O_CAM = "build_khong_cache";

const config = Bun.YAML.parse(
	readFileSync(join(GOC, "_acceptance", "config.yaml"), "utf8"),
);
const lenh = config?.executors?.script?.[O_CAM];
if (lenh === undefined) {
	console.error(`MA 2: khong thay o cam executors.script.${O_CAM}`);
	process.exit(2);
}

const chay = (chuoi) => {
	const r = spawnSync("bash", ["-lc", chuoi], {
		cwd: GOC,
		encoding: "utf8",
		env: { ...process.env, TURBO_TELEMETRY_DISABLED: "1" },
	});
	return `${r.stdout}${r.stderr}`;
};

const dauVet = (chu) => {
	const bypass = (chu.match(/cache bypass/g) ?? []).length;
	const hit = (chu.match(/cache hit/g) ?? []).length;
	const fullTurbo = /FULL TURBO/.test(chu);
	return { bypass, hit, fullTurbo };
};

const luot1 = dauVet(chay(String(lenh)));
const luot2 = dauVet(chay(String(lenh)));

if (luot1.bypass === 0 && luot1.hit === 0) {
	console.error(
		"MA 2: khong doc duoc dau vet dem cua turbo o luot mot — khong doan theo thoi gian chay",
	);
	process.exit(2);
}

console.log(
	`o cam: ${lenh}\n  luot 1: bypass=${luot1.bypass} hit=${luot1.hit} fullTurbo=${luot1.fullTurbo}`,
);
console.log(
	`  luot 2: bypass=${luot2.bypass} hit=${luot2.hit} fullTurbo=${luot2.fullTurbo}`,
);

const khongDem = "bunx turbo run build";
const emLuot2 = dauVet(chay(`${khongDem}`));
console.log(
	`  doi chieu (khong co --force): bypass=${emLuot2.bypass} hit=${emLuot2.hit} fullTurbo=${emLuot2.fullTurbo}`,
);

if (luot2.hit > 0 || luot2.fullTurbo) {
	console.error(
		"DO: luot hai cua o cam an dem — o cam khong ep chay lai, nen mot lan chay xanh khong chung duoc gi.",
	);
	process.exit(1);
}
if (emLuot2.hit === 0 && !emLuot2.fullTurbo) {
	console.error(
		"MA 2: doi chieu KHONG an dem — task build khong con dem trong turbo, nen phep do nay khong phan biet duoc gi.",
	);
	process.exit(2);
}

console.log(
	"XANH: hai luot cua o cam deu that su dung, trong khi lenh khong co --force an dem — cap hai chieu tren cung mot vat.",
);
