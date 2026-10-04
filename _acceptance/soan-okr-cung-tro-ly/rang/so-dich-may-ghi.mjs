import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const DOI_CHUNG = process.argv.includes("--doi-chung");
const LUI = "lui giao dich doi chung";
const GIEO = "doi-chung-so-dich";

const { databaseName } = await import(
	join(GOC, "packages/db/src/test-database.ts")
);
const { isMeasureDatabase } = await import(
	join(GOC, "packages/db/src/measure-database.ts")
);

if (process.env.TEST_RUN_ID && process.env.TEST_DATABASE_URL)
	process.env.NODE_ENV = "test";

function khoDungMotLan() {
	if (process.env.NODE_ENV === "test") return true;
	const url = process.env.DATABASE_URL;
	return Boolean(url) && isMeasureDatabase(databaseName(url));
}

if (DOI_CHUNG && !khoDungMotLan()) {
	console.log(
		'so-dich-may-ghi: --doi-chung chi chay tren kho dung-mot-lan — bun run test -- "bun _acceptance/soan-okr-cung-tro-ly/rang/so-dich-may-ghi.mjs --doi-chung" (ma 2)',
	);
	process.exit(2);
}

const { db } = await import(join(GOC, "packages/db/src/client.ts"));
const { soGhiKhacNguoiGo, vetTaoKrSoan } = await import(
	join(GOC, "packages/validation/src/okr-cuoc-soan.ts")
);

async function thuoc(tx) {
	const dich = await tx.$queryRawUnsafe(
		`SELECT id FROM "okrDeXuat" WHERE "cuocSoanId" IS NOT NULL AND dich IS NOT NULL AND dich <> 'null'::jsonb ORDER BY id`,
	);
	const vet = await tx.$queryRawUnsafe(
		`SELECT id, "keyResultId", after FROM "okrTrail"
		 WHERE action = 'tao-kr' AND note LIKE 'soan-okr:%'
		 ORDER BY id`,
	);
	const lech = vet.flatMap((v) => {
		const doc = vetTaoKrSoan.safeParse(v.after);
		if (!doc.success)
			return [{ ...v, lyDo: "vet thieu so nguoi go hoac sai khuon" }];
		return soGhiKhacNguoiGo(doc.data)
			? [{ ...v, lyDo: "so ghi khac so nguoi go" }]
			: [];
	});
	return { dongDich: dich.map((d) => d.id), soKr: vet.length, lech };
}

function in_(kq) {
	console.log(
		`so-dich-may-ghi: dong nhap mang dich = ${kq.dongDich.length}; KR mang vet soan-okr = ${kq.soKr}; KR lech so nguoi go = ${kq.lech.length}`,
	);
	for (const id of kq.dongDich) console.log(`  dong nhap mang dich: ${id}`);
	for (const v of kq.lech)
		console.log(
			`  lech: vet ${v.id} KR ${v.keyResultId} (${v.lyDo}) after=${JSON.stringify(v.after)}`,
		);
}

async function gieoDoiChung(tx) {
	const luc = new Date();
	await tx.user.create({
		data: {
			id: `${GIEO}-nguoi`,
			name: "Doi chung",
			email: `${GIEO}@vi-du.invalid`,
		},
	});
	await tx.okrCycle.create({
		data: {
			id: `${GIEO}-ky`,
			kind: "quy",
			name: "Doi chung",
			startsOn: luc,
			endsOn: luc,
		},
	});
	await tx.okrObjective.create({
		data: {
			id: `${GIEO}-mt`,
			cycleId: `${GIEO}-ky`,
			level: "onehub",
			ownerUserId: `${GIEO}-nguoi`,
			kind: "cam-ket",
			title: "Muc tieu doi chung",
		},
	});
	await tx.okrKeyResult.create({
		data: {
			id: `${GIEO}-kr`,
			objectiveId: `${GIEO}-mt`,
			title: "KR doi chung",
			kind: "tang-toi",
			ownerUserId: `${GIEO}-nguoi`,
			startValue: 0,
			targetValue: 999,
			currentValue: 0,
		},
	});
	await tx.okrTrail.create({
		data: {
			id: `${GIEO}-vet`,
			actorUserId: `${GIEO}-nguoi`,
			objectiveId: `${GIEO}-mt`,
			keyResultId: `${GIEO}-kr`,
			action: "tao-kr",
			after: {
				title: "KR doi chung",
				kind: "tang-toi",
				startValue: 0,
				targetValue: 999,
				soNguoiGoKhoiDiem: 0,
				soNguoiGoDich: 10,
			},
			note: `soan-okr:${GIEO}:${GIEO}`,
		},
	});
	await tx.okrCuocSoan.create({
		data: {
			id: `${GIEO}-cuoc`,
			cycleId: `${GIEO}-ky`,
			level: "onehub",
			nguoiMoUserId: `${GIEO}-nguoi`,
			sessionId: `${GIEO}-phien`,
			cacPhien: [`${GIEO}-phien`],
			nac: "bat",
		},
	});
	await tx.okrDeXuat.create({
		data: {
			id: `${GIEO}-dong`,
			taskId: `${GIEO}-phien`,
			objectiveId: "",
			loai: "kr-moi",
			lyDo: "doi chung",
			inputHash: GIEO,
			nguoiYeuCau: `${GIEO}-nguoi`,
			cuocSoanId: `${GIEO}-cuoc`,
			dich: 999,
		},
	});
}

if (DOI_CHUNG) {
	let bat = { kr: false, dong: false };
	await db
		.$transaction(async (tx) => {
			await gieoDoiChung(tx);
			const kq = await thuoc(tx);
			in_(kq);
			bat = {
				kr: kq.lech.some((v) => v.keyResultId === `${GIEO}-kr`),
				dong: kq.dongDich.includes(`${GIEO}-dong`),
			};
			throw new Error(LUI);
		})
		.catch((e) => {
			if (!String(e?.message).includes(LUI)) throw e;
		});
	await db.$disconnect();
	if (!bat.kr || !bat.dong) {
		console.log(
			`doi chung khong do: thuoc khong bat ${[!bat.kr && "vet KR gieo co dich khac so nguoi go", !bat.dong && "dong nhap gieo mang dich"].filter(Boolean).join(", ")}`,
		);
		process.exit(1);
	}
	console.log(
		"doi chung duong: thuoc do dung cho (vet KR ghi dich khac so nguoi go va dong nhap mang dich)",
	);
	process.exit(0);
}

const kq = await thuoc(db);
await db.$disconnect();
in_(kq);
if (kq.dongDich.length > 0 || kq.lech.length > 0) {
	console.log(
		`so dich may ghi: dong nhap co dich ${kq.dongDich.length}, KR lech ${kq.lech.map((v) => v.keyResultId).join(", ")}`,
	);
	process.exit(1);
}
if (kq.soKr === 0) {
	console.log("chua co KR nao tu cuoc soan — thuoc khong do duoc (ma 2)");
	process.exit(2);
}
console.log("0 so dich do may ghi");
process.exit(0);
