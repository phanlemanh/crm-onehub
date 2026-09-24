import { Spinner } from "@crm/ui/components/spinner";

export function PageShellLoading() {
	return (
		<div
			data-slot="page-shell-loading"
			aria-busy="true"
			className="flex justify-center py-12"
		>
			<Spinner size="lg" />
		</div>
	);
}
