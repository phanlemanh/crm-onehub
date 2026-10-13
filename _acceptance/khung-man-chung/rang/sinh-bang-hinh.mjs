#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const SHA_GOC = "3a2783409";
const TEP_KHUNG = [
	"apps/app/components/page-shell.tsx",
	"apps/app/components/page-shell-loading.tsx",
];
const TIEN = "apps/app/app/(app)/[slug]/";
const THEM = [`${TIEN}tai-lieu/page.tsx`];

const HINH_THEO_MAN = [
	["bang", ["contacts", "deals", "companies", "campaigns", "onboarding", "settings/api-keys", "settings/sso", "settings/members"]],
	["danh-sach", ["(agent-builder)/agents", "settings/connections", "settings/fields", "settings/connections/slack/people", "settings/giai-doan"]],
	["the", ["settings", "settings/currencies", "settings/tracking", "settings/onboarding", "settings/okr", "settings/organization", "reminders", "settings/connections/oauth-connection-page", "settings/connections/zalo", "settings/connections/intake", "settings/connections/slack"]],
	["tong-quan", ["", "okr", "okr/toan-canh", "okr/toan-canh/suc-khoe", "okr/theo-don-vi", "okr/hoi-y"]],
	["chi-tiet", ["campaigns/[campaignId]", "tai-lieu/[trang]", "tai-lieu/[trang]/sua", "tai-lieu/moi", "tai-lieu/de-xuat/[id]"]],
	["bang", ["tai-lieu"]],
];

function manCuaTep(tep) {
	const con = tep.slice(TIEN.length);
	if (con.endsWith("/page.tsx") || con === "page.tsx") {
		return con === "page.tsx" ? "" : con.slice(0, -"/page.tsx".length);
	}
	const thuMuc = dirname(con);
	if (con === "settings/connections/oauth-connection-page.tsx") {
		return "settings/connections/oauth-connection-page";
	}
	return thuMuc === "." ? "" : thuMuc;
}

function hinhCuaTep(tep) {
	const man = manCuaTep(tep);
	for (const [hinh, cacMan] of HINH_THEO_MAN) {
		if (cacMan.includes(man)) return hinh;
	}
	return null;
}

export function tepGoc(goc = GOC) {
	const ra = execFileSync(
		"git",
		["-C", goc, "grep", "-l", "PageShellLoading", SHA_GOC, "--", "apps/app"],
		{ encoding: "utf8" },
	);
	return ra
		.split("\n")
		.filter(Boolean)
		.map((dong) => dong.slice(`${SHA_GOC}:`.length))
		.filter((tep) => tep.endsWith(".tsx") && !TEP_KHUNG.includes(tep));
}

export function bangHinh(goc = GOC) {
	const tep = [...tepGoc(goc), ...THEM].sort();
	return tep.map((t) => {
		const hinh = hinhCuaTep(t);
		if (!hinh) {
			process.stderr.write(`sinh-bang-hinh: thieu hinh cho ${t}\n`);
			process.exit(2);
		}
		return { tep: t, hinh };
	});
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const bang = bangHinh();
	const dich = join(GOC, "apps/app/test/fixtures/khung-man-chung-hinh.json");
	writeFileSync(dich, `${JSON.stringify(bang, null, "\t")}\n`);
	process.stdout.write(`sinh-bang-hinh: ${bang.length} tep -> ${dich}\n`);
}
