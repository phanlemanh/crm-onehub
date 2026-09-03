const APP = process.env.APP_URL ?? "http://localhost:3000";

export async function suySlug(cookie) {
	if (process.env.SLUG) return kiem(process.env.SLUG, cookie);

	const res = await fetch(`${APP}/`, {
		redirect: "manual",
		headers: { Cookie: `${cookie.name}=${cookie.value}` },
	});
	const dich = res.headers.get("location");

	if (!dich) {
		throw new Error(
			`RANG CUN: khong suy duoc slug — ${APP}/ tra ${res.status} ma khong co Location. ` +
				"Chan nay TU CHOI do voi mot slug doan, vi do sai workspace se trong nhu loi san pham.",
		);
	}

	const duong = new URL(dich, APP).pathname.replace(/^\/+|\/+$/g, "");
	const dau = duong.split("/")[0];

	if (!dau || dau === "sign-in") {
		throw new Error(
			`RANG CUN: khong suy duoc slug — ${APP}/ tra ve "${dich}". ` +
				"Phien dang nhap khong hop le, hoac kho chua co workspace nao.",
		);
	}

	return kiem(dau, cookie);
}

async function kiem(dau, cookie) {
	const res = await fetch(`${APP}/${dau}/companies`, {
		redirect: "manual",
		headers: { Cookie: `${cookie.name}=${cookie.value}; lang=vi` },
	});

	if (res.status !== 200) {
		throw new Error(
			`RANG CUN: workspace "${dau}" khong giai duoc — ${APP}/${dau}/companies tra ${res.status}, khong phai 200. ` +
				"Chan nay TU CHOI do: do mot workspace khong ton tai trong y het loi san pham, " +
				"va vong 8 da mat mot luot vi dung cho nay.",
		);
	}

	return dau;
}
