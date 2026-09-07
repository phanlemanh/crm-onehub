import { bam, docConfig, ketThuc, napHamKit } from "./chung.mjs";

const MAU = [
	{
		ten: "gia tri tran",
		chu: "a:\n  k: bun run test\n",
		mong: "bun run test",
	},
	{
		ten: "boc nhay kep tron ven",
		chu: 'a:\n  k: "bunx turbo run build --force"\n',
		mong: "bunx turbo run build --force",
	},
	{
		ten: "ket thuc bang nhay kep khong boc",
		chu: 'a:\n  k: bun run test -- "cd apps/api && bun test x"\n',
		mong: 'bun run test -- "cd apps/api && bun test x',
	},
	{
		ten: "cat sau dau thang",
		chu: "a:\n  k: bun run lint # ghi chu\n",
		mong: "bun run lint",
	},
];

const bamDau = bam(docConfig());
const { giai, duong } = napHamKit();
console.log(`nap resolveConfigKey tu: ${duong}`);

const lech = [];
for (const m of MAU) {
	const ra = giai(m.chu, "a.k");
	console.log(`  ${m.ten}: ${JSON.stringify(ra)}`);
	if (ra !== m.mong) lech.push({ ...m, ra });
}

if (lech.length > 0) {
	console.error(
		"MA 2: ham cua bo kit da doi, moi neo cua vong nay het hieu luc. Chay lai vong voi neo do lai.",
	);
	for (const l of lech)
		console.error(
			`  ${l.ten}: mong ${JSON.stringify(l.mong)} · nhan ${JSON.stringify(l.ra)}`,
		);
	ketThuc(bamDau, 2);
}

console.log(
	"XANH: bon dau van hanh vi khop — cat sau dau thang, boc dung mot ngoac moi dau.",
);
ketThuc(bamDau, 0);
