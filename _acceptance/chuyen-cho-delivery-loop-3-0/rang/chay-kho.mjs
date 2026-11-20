import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { GOC, SLUG, git, tepCuaVong } from "./kit.mjs";
import { ungVien } from "./ung-vien.mjs";

const lay = (co) => {
	const i = process.argv.indexOf(co);
	return i > 0 ? process.argv[i + 1] : null;
};
const goc = lay("--goc") ?? GOC;
const ra = lay("--ra");
const chi = lay("--chi");
const songSong = Number(lay("--song-song") ?? 3);
if (!ra) throw new Error("cần --ra <tệp kết quả>");
const doi = tepCuaVong();
let ds = ungVien(GOC, doi, SLUG).ungVien;
if (chi) {
	const chon = new Set(readFileSync(chi, "utf8").split("\n").filter(Boolean));
	ds = ds.filter((r) => chon.has(`${r.ho_so}/${r.eval}`));
}
const lenh = [...new Set(ds.map((r) => r.lenh))];
const nhat = `${ra}.log.d`;
mkdirSync(nhat, { recursive: true });
const NANG = /dot-bien|tien-de|do:man|bun run test|build/;
const kq = {};
const chay = (c, i) =>
	new Promise((xong) => {
		const t0 = Date.now();
		const p = spawn("bash", ["-c", c], { cwd: goc, stdio: ["ignore", "pipe", "pipe"], detached: true });
		let o = "";
		p.stdout.on("data", (d) => (o += d));
		p.stderr.on("data", (d) => (o += d));
		const het = setTimeout(() => {
			try {
				process.kill(-p.pid, "SIGTERM");
			} catch {}
			setTimeout(() => {
				try {
					process.kill(-p.pid, "SIGKILL");
				} catch {}
			}, 10_000).unref();
		}, 40 * 60_000);
		p.on("close", (ma, sig) => {
			clearTimeout(het);
			const log = join(nhat, `${i}.log`);
			writeFileSync(log, `$ ${c}\n${o}`);
			kq[c] = { ma: ma ?? `sig-${sig}`, giay: Math.round((Date.now() - t0) / 1000), log };
			process.stderr.write(`${i}/${lenh.length} ma=${kq[c].ma} ${kq[c].giay}s ${c.slice(0, 90)}\n`);
			xong();
		});
	});
const nhe = lenh.map((c, i) => [c, i]).filter(([c]) => !NANG.test(c));
const nang = lenh.map((c, i) => [c, i]).filter(([c]) => NANG.test(c));
let k = 0;
await Promise.all(
	Array.from({ length: songSong }, async () => {
		while (k < nhe.length) {
			const [c, i] = nhe[k++];
			await chay(c, i);
		}
	}),
);
for (const [c, i] of nang) await chay(c, i);
const sha = git(goc, "rev-parse", "HEAD").trim();
const ketQua = Object.fromEntries(ds.map((r) => [`${r.ho_so}/${r.eval}`, { ma: kq[r.lenh].ma, dat: r.mong.includes(kq[r.lenh].ma) }]));
writeFileSync(ra, `${JSON.stringify({ sha, ketQua }, null, 1)}\n`);
const doDs = Object.entries(ketQua).filter(([, x]) => !x.dat);
console.log(`chay-kho: ${sha.slice(0, 8)} · eval ${ds.length} · lệnh ${lenh.length} · đỏ ${doDs.length}`);
for (const [e, x] of doDs) console.log(`DO ${e} ma=${x.ma}`);
