import { spawn } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const CONG = 3187;
const TIENG = ["vi", "en"];

let dangSong = false;
try {
	const r = await fetch(`http://127.0.0.1:${CONG}/`, {
		signal: AbortSignal.timeout(2000),
	});
	dangSong = r.status > 0;
} catch {}
if (dangSong) {
	console.error(
		`MA 2: cong ${CONG} da co may chu khac tra loi — chan nay se do mot cay khong phai cay dang xet. Tat no roi chay lai.`,
	);
	process.exit(2);
}

const may = spawn("bun", ["run", "start"], {
	cwd: join(GOC, "apps", "app"),
	env: { ...process.env, PORT: String(CONG) },
	stdio: "ignore",
	detached: true,
});

const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

async function doi() {
	for (let i = 0; i < 30; i += 1) {
		try {
			const r = await fetch(`http://127.0.0.1:${CONG}/`, {
				redirect: "follow",
			});
			if (r.ok) return true;
		} catch {}
		await ngu(1000);
	}
	return false;
}

const dung = () => {
	try {
		process.kill(-may.pid, "SIGKILL");
	} catch {}
};

try {
	if (!(await doi())) {
		console.error(`MA 2: may chu apps/app khong len duoc o cong ${CONG}`);
		process.exit(2);
	}

	const thay = [];
	for (const t of TIENG) {
		const r = await fetch(`http://127.0.0.1:${CONG}/`, {
			headers: { Cookie: `lang=${t}` },
			redirect: "follow",
		});
		const chu = await r.text();
		const khop = chu.match(/documentElement\.lang=\\+"([a-z]{2})\\+"/);
		thay.push({ tieng: t, dat: khop?.[1] });
	}

	for (const d of thay)
		console.log(
			`cookie lang=${d.tieng} -> documentElement.lang = ${d.dat ?? "(khong thay)"}`,
		);

	const vang = thay.filter((d) => d.dat === undefined);
	if (vang.length === TIENG.length) {
		console.error(
			"DO: khong lan nao trang dat lai documentElement.lang — vo tinh in mac dinh ma khong ai sua, nen trinh duyet co the tu dich mot man tieng Viet.",
		);
		process.exit(1);
	}
	const lech = thay.filter((d) => d.dat !== d.tieng);
	if (lech.length > 0) {
		console.error("DO: lang khong theo tieng cua luot truy cap:");
		for (const d of lech)
			console.error(
				`  cookie lang=${d.tieng} nhung dat ${d.dat ?? "(khong dat)"}`,
			);
		process.exit(1);
	}

	console.log(
		"XANH: moi luot truy cap deu duoc dat documentElement.lang dung tieng cua no.",
	);
} finally {
	dung();
}
