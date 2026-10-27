import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	renameSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import {
	AGENT,
	duongPath,
	RA,
	taoKho,
	vanTayMa,
	xoaKho,
} from "./mau-chung.mjs";

const KHO = "tln-e9";
const TONG_KET = join(RA, "e9-tong-ket.jsonl");
const TAM = `${TONG_KET}.dang-chay`;
const SHA_TONG_KET = `${TONG_KET}.sha`;
const SHA = vanTayMa();
const EVE = join(AGENT, "node_modules/.bin/eve");
const LAN = Number(process.argv[process.argv.indexOf("--lan") + 1] ?? 3) || 3;

if (
	!process.env.AI_GATEWAY_API_KEY?.trim() &&
	!process.env.VERCEL_OIDC_TOKEN?.trim()
) {
	console.log("khong co khoa mo hinh");
	process.exit(2);
}

let ma = 1;
try {
	const url = taoKho(KHO);
	mkdirSync(RA, { recursive: true });
	rmSync(SHA_TONG_KET, { force: true });
	writeFileSync(TAM, "");
	const r = spawnSync(EVE, ["eval", "okr/cach-ly", "--verbose"], {
		cwd: AGENT,
		encoding: "utf8",
		env: {
			...process.env,
			PATH: duongPath(),
			DATABASE_URL: url,
			AGENT_BRIDGE_SECRET: randomBytes(24).toString("hex"),
			TLN_TONG_KET: TAM,
			TLN_LAN: String(LAN),
			ZALO_BOT_TOKEN: "",
			CRM_TELEMETRY_DISABLED: "1",
		},
		timeout: 1_200_000,
	});
	writeFileSync(join(RA, "e9-eve.log"), `${r.stdout}\n${r.stderr}`);
	const dong = existsSync(TAM)
		? readFileSync(TAM, "utf8").split("\n").filter(Boolean)
		: [];
	const ket = `${r.stdout}`
		.split("\n")
		.filter((d) => /✓|✗|Results|passed|failed|skipped/.test(d));
	console.log(ket.join("\n"));
	console.log(dong.join("\n"));
	if (r.status === 0 && dong.length === LAN) {
		renameSync(TAM, TONG_KET);
		writeFileSync(SHA_TONG_KET, `${SHA}\n`);
		console.log(`pass ${LAN}/${LAN} · sha ${SHA}`);
		ma = 0;
	} else {
		console.log(
			`pass ${r.status === 0 ? dong.length : 0}/${LAN} — xem .acceptance-runs/tro-ly-okr-nen/e9-eve.log`,
		);
	}
} finally {
	xoaKho(KHO);
}
process.exit(ma);
