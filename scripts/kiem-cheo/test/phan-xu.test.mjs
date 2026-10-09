import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { after, before, describe, test } from "node:test";
import { duongLan } from "../doc-lan.mjs";
import { docKetLan, lech } from "../phan-xu.mjs";
import { taoKho } from "./kho-gia.mjs";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const LAN_GIA = join(
	GOC,
	"_acceptance",
	"kiem-cheo-sau-gop",
	"rang",
	"lan-gia.mjs",
);
const MA_TRAN = [0, 2].flatMap((kyVong) =>
	[0, 1, 2].map((ma) => ({ kyVong, ma })),
);

function dungKhoMaTran() {
	const kho = taoKho();
	kho.ghi("m.cjs", "process.exit(Number(process.argv[2]));\n");
	kho.ghi(
		"_acceptance/config.yaml",
		[
			"schema_version: 1",
			"feature_loop:",
			"  suite_keys: [executors.script.suite_gia]",
			"executors:",
			"  script:",
			'    suite_gia: "true"',
			...MA_TRAN.map(
				({ kyVong, ma }) =>
					`    o_${kyVong}_${ma}: node m.cjs ${ma} k${kyVong}`,
			),
			"",
		].join("\n"),
	);
	kho.hoSo("ky", {
		evals: [
			"schema_version: 1",
			"slug: ky",
			"evals:",
			...MA_TRAN.flatMap(({ kyVong, ma }, i) => [
				`  - id: E${i + 1}`,
				"    executor: script",
				`    cmd: config:executors.script.o_${kyVong}_${ma}`,
				...(kyVong ? [`    expected_exit: ${kyVong}`] : []),
			]),
			"",
		].join("\n"),
	});
	kho.git("add", "-A");
	kho.git("commit", "-q", "-m", "ma tran");
	kho.ghi(
		"_acceptance/ky/evidence-report.md",
		`---\nverdict: PASS\nverified_commit: ${kho.sha()}\n---\n`,
	);
	kho.git("add", "-A");
	kho.git("commit", "-q", "-m", "bao cao");
	return kho;
}

function chayLan(tep, kho) {
	const r = spawnSync(
		process.execPath,
		[tep, "--root", kho.goc, "--slug", "ky", "--reason", "phan-xu"],
		{ cwd: kho.goc, encoding: "utf8" },
	);
	return { ma: r.status, ket: docKetLan(r.stdout), loi: r.stderr };
}

const tapLech = (ket) =>
	ket.lech
		.map((e) => `${e.id}:${e.lenh}`)
		.sort()
		.join(" ");

describe("kcs-phan-xu", () => {
	let kho;
	let that;
	let gia;
	before(() => {
		kho = dungKhoMaTran();
		that = chayLan(duongLan(GOC).tep, kho);
		gia = chayLan(LAN_GIA, kho);
	});
	after(() => kho?.don());

	test("lech khop phan quyet cua lan that tren du ma tran ky vong x ma thoat", () => {
		const thayLech = new Set(that.ket.lech.map((e) => e.id));
		for (const [i, { kyVong, ma }] of MA_TRAN.entries()) {
			assert.equal(
				lech(ma, kyVong),
				thayLech.has(`E${i + 1}`),
				`o ky vong ${kyVong} / thoat ${ma}: lech() khac lan that (${that.loi.split("\n").at(-2)})`,
			);
		}
		assert.ok(
			thayLech.size > 0,
			"ma tran phai co o lech, khong thi phep do vo nghia",
		);
	});

	test("lan gia cho dung tap lech, dung lenh da giai va dung ma thoat nhu lan that", () => {
		assert.equal(tapLech(gia.ket), tapLech(that.ket));
		assert.equal(gia.ma, that.ma);
		assert.deepEqual(
			gia.ket.suite.map((s) => s.ma),
			that.ket.suite.map((s) => s.ma),
		);
	});

	test("docKetLan: stdout khong co JSON -> loi goi ten, khong tra mang rong", () => {
		assert.throws(
			() => docKetLan("[lane] chi co dong log\n"),
			/khong doc duoc JSON/,
		);
		assert.throws(
			() => docKetLan('{"suites":[{"cmd":"x","exit":0}],"slugs":{"ky":{}}}'),
			/thieu mang lech/,
		);
	});
});
