const NGAY = /^\d{4}-\d{2}-\d{2}$/;

function co(ten: string): string {
	const i = process.argv.indexOf(ten);
	const giaTri = i >= 0 ? process.argv[i + 1] : undefined;
	if (!giaTri || !NGAY.test(giaTri)) {
		console.error(`thong-bao-doi-chieu: thieu ${ten} <YYYY-MM-DD>`);
		process.exit(2);
	}
	return giaTri;
}

const tu = co("--tu");
const den = co("--den");
const url = process.env.DOI_CHIEU_DATABASE_URL;
if (!url) {
	console.error(
		"thong-bao-doi-chieu: thieu DOI_CHIEU_DATABASE_URL (lenh khong doc DATABASE_URL)",
	);
	process.exit(2);
}
process.env.DATABASE_URL = url;

const { db } = await import("@crm/db");
const { coMat, doiChieu, inKetQua } = await import(
	"../agent/lib/thong-bao-doi-chieu"
);

const kq = await db.$transaction(async (tx) => {
	await tx.$executeRaw`SET TRANSACTION READ ONLY`;
	return doiChieu(tx as typeof db, { tu, den });
});
console.log(`may ${new URL(url).host}`);
console.log(inKetQua(kq));
await db.$disconnect();
process.exit(coMat(kq) ? 1 : 0);
