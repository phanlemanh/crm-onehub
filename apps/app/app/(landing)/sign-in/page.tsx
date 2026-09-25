import type { MailboxProviderId } from "@crm/auth/scopes";
import { Separator } from "@crm/ui/components/separator";
import type { Metadata } from "next";
import { redirect, unstable_rethrow } from "next/navigation";
import { Suspense } from "react";
import { AuthHeading, AuthShell } from "@/components/auth-shell";
import { KhoiHuongDan } from "@/components/cua-vao/khoi-huong-dan";
import { OLoiDangNhap } from "@/components/cua-vao/o-loi-dang-nhap";
import {
	buocLanDau,
	chonCua,
	type SignInOptions,
} from "@/lib/cua-vao/chon-cua";
import { type LoaiLoi, phanLoaiLoiDangNhap } from "@/lib/cua-vao/loi-dang-nhap";
import { phutLienKetDatMatKhau } from "@/lib/cua-vao/thoi-han";
import { getLocale } from "@/lib/locale/server";
import { authMessages } from "@/lib/messages/auth";
import { type CuaVaoMessages, cuaVaoMessages } from "@/lib/messages/cua-vao";
import { settingsMessages } from "@/lib/messages/settings";
import { thanhVienMessages } from "@/lib/messages/settings-thanh-vien";
import { getSession } from "@/lib/session";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { PasswordSignIn } from "./password-sign-in";
import { SocialSignIn } from "./social-sign-in";
import { SsoSignIn } from "./sso-sign-in";

const TEN_HANG = {
	google: "Google",
	microsoft: "Microsoft",
} as const satisfies Record<MailboxProviderId, string>;

const NOI_DUONG = " › ";

const KHOA_LOI = {
	"chua-cho-phep": "chuaChoPhep",
	"da-huy": "daHuy",
	chung: "chung",
} as const satisfies Record<LoaiLoi, keyof CuaVaoMessages["loi"]>;

export async function generateMetadata(): Promise<Metadata> {
	return { title: authMessages(await getLocale()).docTitle.signIn };
}

async function signInOptions(): Promise<SignInOptions | null> {
	try {
		return await getServerQueryClient().fetchQuery(
			getServerTrpc().sso.signInOptions.queryOptions(),
		);
	} catch (error) {
		unstable_rethrow(error);
		console.error("Sign-in: could not read the sign-in options.", error);
		return null;
	}
}

async function currentSession() {
	try {
		return await getSession();
	} catch (error) {
		unstable_rethrow(error);
		console.error("Sign-in: could not read the session.", error);
		return null;
	}
}

export default async function SignInPage({
	searchParams,
}: PageProps<"/sign-in">) {
	const m = authMessages(await getLocale()).signIn;

	return (
		<AuthShell
			gioiThieu={
				<Suspense fallback={null}>
					<HuongDan searchParams={searchParams} />
				</Suspense>
			}
		>
			<Suspense
				fallback={
					<AuthHeading cap="h1" title={m.title} description={m.description} />
				}
			>
				<SignIn searchParams={searchParams} />
			</Suspense>
		</AuthShell>
	);
}

async function HuongDan({
	searchParams,
}: Pick<PageProps<"/sign-in">, "searchParams">) {
	const [options, { method }, locale] = await Promise.all([
		signInOptions(),
		searchParams,
		getLocale(),
	]);

	const cv = cuaVaoMessages(locale);
	const caiDat = settingsMessages(locale).thanhBen.nhan;
	const tv = thanhVienMessages(locale);
	const duongPhatLienKet = [caiDat, tv.trang.tieuDe].join(NOI_DUONG);

	const buoc = buocLanDau(
		chonCua(options, method),
		{
			duongChoPhep: [duongPhatLienKet, tv.duocPhepVao.nutThem].join(NOI_DUONG),
			duongPhatLienKet,
			phut: phutLienKetDatMatKhau(),
		},
		cv,
		(provider) => TEN_HANG[provider],
	);

	return (
		<KhoiHuongDan
			buoc={buoc}
			laGi={authMessages(locale).shell.headline}
			moTa={cv.lanDau.moTa}
			tieuDe={cv.lanDau.tieuDe}
		/>
	);
}

async function SignIn({
	searchParams,
}: Pick<PageProps<"/sign-in">, "searchParams">) {
	const [session, options, { method, error }, locale] = await Promise.all([
		currentSession(),
		signInOptions(),
		searchParams,
		getLocale(),
	]);

	if (session) {
		redirect("/");
	}

	const m = authMessages(locale).signIn;
	const loi = phanLoaiLoiDangNhap(error);
	const chuLoi = loi ? cuaVaoMessages(locale).loi[KHOA_LOI[loi]] : null;

	const cua = chonCua(options, method);
	const coCuaKhac = cua.sso.length > 0 || cua.social.length > 0;

	return (
		<>
			<AuthHeading cap="h1" title={m.title} description={m.description} />

			{chuLoi ? (
				<OLoiDangNhap moTa={chuLoi.moTa} tieuDe={chuLoi.tieuDe} />
			) : null}

			{cua.sso.length > 0 ? (
				<SsoSignIn
					providers={cua.sso.map((provider) => ({
						...provider,
						nhan: m.continueWith(provider.name),
					}))}
					dangGui={m.signingIn}
					loi={m.error.unreachable}
				/>
			) : null}
			{cua.social.map((provider) => (
				<SocialSignIn
					key={provider}
					provider={provider}
					nhan={m.continueWith(TEN_HANG[provider])}
					dangGui={m.signingIn}
					loi={m.error.unreachable}
				/>
			))}

			{coCuaKhac ? (
				<div className="flex items-center gap-3">
					<Separator className="flex-1" />
					<span className="text-muted-foreground text-xs">{m.hoac}</span>
					<Separator className="flex-1" />
				</div>
			) : null}

			<PasswordSignIn
				dangGui={m.signingIn}
				dangNhap={m.dangNhap}
				diaChi={m.diaChi}
				matKhau={m.matKhau}
				saiChung={m.saiChung}
			/>
		</>
	);
}
