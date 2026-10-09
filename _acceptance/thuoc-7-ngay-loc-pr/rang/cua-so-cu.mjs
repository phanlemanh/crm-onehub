import { bang, chayThuoc, ketThuc, soHaiRuntime, soSanh, tuKiemSoSanh } from "./chung.mjs";

const gan = (mong) => {
	const f = (thuc) => {
		const so = String(thuc ?? "")
			.split(", ")
			.map(Number)
			.sort((a, b) => a - b);
		const m = [...mong].sort((a, b) => a - b);
		return so.length === m.length && so.every((x, i) => Math.abs(x - m[i]) <= 0.01);
	};
	Object.defineProperty(f, "name", { value: mong.join(", ") });
	return f;
};
const batDau = (tien) => {
	const f = (thuc) => String(thuc ?? "").startsWith(tien);
	Object.defineProperty(f, "name", { value: `${tien}…` });
	return f;
};

const CUA_SO = [
	{
		ten: "cua so cu 08/10 16:00Z -> 09/10 04:00Z (hinh mot job)",
		thamSo: ["--nhanh", "onehub", "--tu", "2026-10-08T16:00:00Z", "--den", "2026-10-09T04:00:00Z"],
		ma: 3,
		mong: {
			"luot ci.yml": bang(20),
			"vao mau": bang(18),
			"khong gan duoc": bang(2),
			"base khac": bang(0),
			"dang chay": bang(0),
			"luot xanh": bang(0),
			"khong mang hinh ma tran": bang(18),
			"dung vi tran": bang(3),
			"bi de": bang(2),
			"dung tay": bang(0),
			"dung khi chua chay": bang(0),
			"ket luan": batDau("chua ket luan — chua du mau"),
		},
	},
	{
		ten: "doi chung duong 09/10 05:42:52Z -> 09:20Z (hinh ma tran)",
		thamSo: ["--nhanh", "onehub", "--tu", "2026-10-09T05:42:52Z", "--den", "2026-10-09T09:20:00Z"],
		ma: 3,
		mong: {
			"luot ci.yml": bang(5),
			"vao mau": bang(5),
			"khong gan duoc": bang(0),
			"luot xanh": bang(5),
			"khong mang hinh ma tran": bang(0),
			"dung vi tran": bang(0),
			"bi de": bang(0),
			"job dai nhat moi luot xanh": gan([10.25, 10.78, 10.45, 10.03, 10.55]),
			"trung vi": gan([10.45]),
			"ket luan": batDau("chua ket luan — chua du mau"),
		},
	},
];

const loi = [];
for (const c of CUA_SO) {
	const kq = Object.fromEntries(["node", "bun"].map((rt) => [rt, chayThuoc(rt, c.thamSo)]));
	for (const [rt, r] of Object.entries(kq)) {
		if (r.ma !== c.ma) loi.push(`${c.ten} [${rt}]: ma ${r.ma}, mong ${c.ma} — ${r.stderr.trim().split("\n").at(-1) ?? ""}`);
		for (const l of soSanh(r.dong, c.mong)) loi.push(`${c.ten} [${rt}] ${l}`);
	}
	for (const l of soHaiRuntime(kq.node, kq.bun)) loi.push(`${c.ten} node khac bun — ${l}`);
	tuKiemSoSanh(kq.node.dong, c.mong, "luot ci.yml");
	console.log(`${c.ten}: ${["luot ci.yml", "vao mau", "luot xanh", "dung vi tran", "bi de"].map((k) => `${k}=${kq.node.dong.get(k)}`).join(" ")}`);
}
ketThuc("cua-so-cu", loi);
