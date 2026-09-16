import { notFound } from "next/navigation";
import { timProto, timState } from "../catalog";
import { PROTO_COMPONENTS } from "../registry";
import { StateSwitcher } from "../state-switcher";

export const instant = false;

export default async function ProtoPage({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ state?: string }>;
}) {
	const [{ slug }, { state }] = await Promise.all([params, searchParams]);

	const muc = timProto(slug);
	if (muc === undefined) notFound();

	const dangBat = timState(muc, state);
	if (dangBat === undefined) notFound();

	const Proto = PROTO_COMPONENTS.get(slug);
	if (Proto === undefined) notFound();

	return (
		<>
			<h1 className="font-semibold text-2xl">{muc.ten}</h1>
			<StateSwitcher dangBat={dangBat.id} slug={slug} states={muc.states} />
			<Proto state={dangBat.id} />
		</>
	);
}
