"use client";

import Plug from "@carbon/icons-react/es/Plug";
import DocusignLogo from "@crm/ui/components/brand-logos/docusign";
import GoogleLogo from "@crm/ui/components/brand-logos/google";
import MicrosoftLogo from "@crm/ui/components/brand-logos/microsoft";
import SlackLogo from "@crm/ui/components/brand-logos/slack";
import StripeLogo from "@crm/ui/components/brand-logos/stripe";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import { useLocale } from "@crm/ui/components/locale-provider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ketNoiMessages } from "@/lib/messages/settings-ket-noi";

export function AddConnectionDialog({
	slug,
	open,
	connected,
}: {
	slug: string;
	open: boolean;
	connected: string[];
}) {
	const t = ketNoiMessages(useLocale());
	const router = useRouter();
	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) router.replace(`/${slug}/settings/connections`);
			}}
		>
			<DialogContent className="max-w-(--container-narrow) gap-0 p-0 md:left-[calc(50%+calc((56px+213px)/2))]">
				<DialogHeader className="gap-2 px-(--spacing-block-inline) pt-5 pb-4">
					<DialogTitle className="text-base">{t.them.tieuDe}</DialogTitle>
					<DialogDescription>{t.them.moTa}</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col border-y px-2 py-2">
					{!connected.includes(t.ten.googleWorkspace) ? (
						<CatalogRow
							logo={GoogleLogo}
							name={t.ten.googleWorkspace}
							brand
							description={t.them.googleMoTa}
							href={`/${slug}/settings/connections/google`}
						/>
					) : null}
					{!connected.includes(t.ten.slack) ? (
						<CatalogRow
							logo={SlackLogo}
							name={t.ten.slack}
							brand
							description={t.them.slackMoTa}
							href={`/${slug}/settings/connections/slack`}
						/>
					) : null}
					{!connected.includes(t.ten.microsoft365) ? (
						<CatalogRow
							logo={MicrosoftLogo}
							name={t.ten.microsoft365}
							brand
							description={t.them.microsoftMoTa}
							href={`/${slug}/settings/connections/microsoft`}
						/>
					) : null}
					<CatalogRow
						logo={StripeLogo}
						name={t.ten.stripe}
						brand
						description={t.them.sapCo}
					/>
					<CatalogRow
						logo={DocusignLogo}
						name={t.ten.docusign}
						brand
						description={t.them.sapCo}
					/>
					<CatalogRow
						logo={Plug}
						name={t.them.thuKhac}
						description={t.them.thuKhacMoTa}
						href={`/${slug}/settings/connections/intake`}
					/>
				</div>
				<p className="px-(--spacing-block-inline) py-4 text-muted-foreground text-xs">
					{connected.length > 0
						? t.them.daCamRoi(connected.join(", "))
						: t.them.chuaCamGi}
				</p>
			</DialogContent>
		</Dialog>
	);
}

function CatalogRow({
	logo: Logo,
	name,
	brand,
	description,
	href,
}: {
	logo: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	name: string;
	brand?: boolean;
	description: string;
	href?: string;
}) {
	const content = (
		<>
			<Logo className="size-5 shrink-0" />
			<div>
				<p className="font-medium text-sm" translate={brand ? "no" : undefined}>
					{name}
				</p>
				<p className="text-muted-foreground text-xs">{description}</p>
			</div>
		</>
	);
	return href ? (
		<Link
			href={href}
			className="flex items-center gap-3 rounded-md px-3 py-3 transition-colors hover:bg-muted"
		>
			{content}
		</Link>
	) : (
		<div
			aria-disabled="true"
			className="flex items-center gap-3 rounded-md px-3 py-3 opacity-60"
		>
			{content}
		</div>
	);
}
