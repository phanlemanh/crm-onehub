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

export function CaiDatBreadcrumb({ cap }: { cap: MucDuongDan[] }) {
	return (
		<Breadcrumb>
			<BreadcrumbList>
				{cap.map((muc, i) => (
					<Fragment key={muc.nhan}>
						{i > 0 ? <BreadcrumbSeparator /> : null}
						<BreadcrumbItem>
							{muc.href ? (
								<BreadcrumbLink asChild>
									<Link href={muc.href} translate="no">
										{muc.nhan}
									</Link>
								</BreadcrumbLink>
							) : (
								<BreadcrumbPage translate="no">{muc.nhan}</BreadcrumbPage>
							)}
						</BreadcrumbItem>
					</Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
