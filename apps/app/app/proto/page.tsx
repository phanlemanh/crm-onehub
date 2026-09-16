import { Empty, EmptyHeader, EmptyTitle } from "@crm/ui/components/empty";
import Link from "next/link";
import { PROTO_CATALOG } from "./catalog";

export default function ProtoIndexPage() {
	if (PROTO_CATALOG.length === 0) {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>Chưa có bản mẫu nào — xem docs/proto.md</EmptyTitle>
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<>
			<h1 className="font-semibold text-2xl">Bản mẫu giao diện</h1>
			<ul className="flex flex-col gap-2">
				{PROTO_CATALOG.map((muc) => (
					<li key={muc.slug}>
						<Link
							className="flex items-center justify-between rounded-lg border p-4"
							data-proto-slug={muc.slug}
							href={`/proto/${muc.slug}`}
						>
							<span className="font-medium">{muc.ten}</span>
							<span className="text-muted-foreground text-sm">
								{muc.slug} · {muc.states.length} trạng thái
							</span>
						</Link>
					</li>
				))}
			</ul>
		</>
	);
}
