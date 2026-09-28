import { spawn } from "node:child_process";
import { GOC_KHO, THUOC, tenKhoa } from "./khoa-nguon.mjs";

const KHOA_GIA = "vercel_blob_rw_mctkkn_gia_khonglakhoathat";
const VE = [
	{
		khoa: KHOA_GIA,
		ma: 0,
		ghim: "chieu do: DO DUNG GHIM: ma 1, in «chu vung keo tha man that lech»",
	},
	{ khoa: "", ma: 2, ghim: "chieu do: ban sao thoat ma 2 (tien de thieu)" },
];

function chay(env) {
	return new Promise((xong) => {
		let ra = "";
		const con = spawn("bun", [THUOC, "--chieu-do"], {
			cwd: GOC_KHO,
			env,
			stdio: ["ignore", "pipe", "pipe"],
		});
		const ghi = (b) => {
			ra += b.toString();
			process.stdout.write(b);
		};
		con.stdout.on("data", ghi);
		con.stderr.on("data", ghi);
		con.on("error", () => xong({ ma: 2, ra }));
		con.on("exit", (m) => xong({ ma: m ?? 2, ra }));
	});
}

const ten = tenKhoa(GOC_KHO);
let dung = 0;
for (const [i, ve] of VE.entries()) {
	const { ma, ra } = await chay({ ...process.env, [ten]: ve.khoa });
	const loi = [];
	if (ma !== ve.ma) loi.push(`ma ${ma}, can ${ve.ma}`);
	if (!ra.includes(ve.ghim)) loi.push(`thieu «${ve.ghim}»`);
	if (loi.length === 0) dung += 1;
	console.log(
		loi.length === 0
			? `ve ${i + 1}: dung`
			: `ve ${i + 1}: lech — ${loi.join(" · ")}`,
	);
}
console.log(`chieu do can khoa: ${dung}/${VE.length}`);
process.exit(dung === VE.length ? 0 : 1);
