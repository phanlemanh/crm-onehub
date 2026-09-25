import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@crm/ui/components/breadcrumb";
import Link from "next/link";
import { Fragment } from "react";
import type { MucDuongDan } from "@/lib/cai-dat-breadcrumb";

export function CaiDatBreadcrumb({
	cap,
	dangTai = false,
}: {
	cap: MucDuongDan[];
	dangTai?: boolean;
}) {
	return (
		<Breadcrumb aria-busy={dangTai || undefined}>
			<BreadcrumbList>
				{cap.map((muc, i) => (
					<Fragment key={muc.nhan}>
						{i > 0 ? <BreadcrumbSeparator /> : null}
						<BreadcrumbItem>
							{muc.href === null ? (
								<BreadcrumbPage translate="no">{muc.nhan}</BreadcrumbPage>
							) : dangTai ? (
								<span translate="no">{muc.nhan}</span>
							) : (
								<BreadcrumbLink asChild>
									<Link href={muc.href} translate="no">
										{muc.nhan}
									</Link>
								</BreadcrumbLink>
							)}
						</BreadcrumbItem>
					</Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
