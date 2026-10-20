import { chayRang, daiCuaVong, git } from "./dai.mjs";

const BAI = /\.(spec\.ts|spec\.tsx|dom\.tsx|test\.ts)$/;
const CAM_THEM = /\.(skip|only|todo)\(|test\.if\(\s*false/g;
const GOI = /\b(test|it)\(/g;
const dem = (s, re) => (s.match(re) ?? []).length;

chayRang(() => {
	const dai = daiCuaVong();
	const doi = git("diff", "--name-status", dai.tu, dai.den)
		.split("\n")
		.filter(Boolean)
		.map((d) => d.split("\t"))
		.filter(([, t]) => BAI.test(t));
	const vi = [];
	for (const [trangThai, tep] of doi) {
		if (trangThai.startsWith("D")) {
			vi.push(`${tep}: xoa tep bai`);
			continue;
		}
		if (trangThai.startsWith("A")) continue;
		const cu = git("show", `${dai.tu}:${tep}`);
		const moi = git("show", `${dai.den}:${tep}`);
		if (dem(moi, GOI) < dem(cu, GOI)) vi.push(`${tep}: so loi goi test/it giam ${dem(cu, GOI)} -> ${dem(moi, GOI)}`);
		if (dem(moi, CAM_THEM) > dem(cu, CAM_THEM)) vi.push(`${tep}: them skip/only/todo`);
	}
	if (vi.length) {
		console.log(vi.join("\n"));
		return 1;
	}
	console.log(`khong-go-bai: ${doi.length} tep doi, 0 vi pham (dai ${dai.kieu} ${dai.soCommit} commit)`);
	return 0;
});
