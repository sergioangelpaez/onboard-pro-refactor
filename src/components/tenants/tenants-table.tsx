import type { ReactNode } from "react";

export interface Column<T> {
	key: string;
	header: string;
	render?: (item: T) => ReactNode;
	className?: string;
}

interface GenericTableProps<T> {
	columns: Column<T>[];
	data: T[];
	rowKey: (item: T) => string | number;
	emptyMessage?: string;
	isLoading?: boolean;
}

export function GenericTable<T>({
	columns,
	data,
	rowKey,
	emptyMessage = "No hay datos para mostrar.",
	isLoading = false,
}: GenericTableProps<T>) {
	if (isLoading) {
		return (
			<div className="w-full rounded-md border border-gray-200 p-8 text-center text-sm text-gray-500">
				Cargando...
			</div>
		);
	}

	if (data.length === 0) {
		return (
			<div className="w-full rounded-md border border-gray-200 p-8 text-center text-sm text-gray-500">
				{emptyMessage}
			</div>
		);
	}

	return (
		<div className="w-full overflow-x-auto rounded-md border border-gray-200">
			<table className="w-full border-collapse text-sm">
				<thead>
					<tr className="border-b border-gray-200 bg-gray-50">
						{columns.map((column) => (
							<th
								key={column.key}
								className={`px-4 py-3 text-left font-medium text-gray-600 ${column.className ?? ""}`}
							>
								{column.header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{data.map((item) => (
						<tr
							key={rowKey(item)}
							className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
						>
							{columns.map((column) => (
								<td
									key={column.key}
									className={`px-4 py-3 text-gray-800 ${column.className ?? ""}`}
								>
									{column.render
										? column.render(item)
										: String(
												(item as Record<string, unknown>)[column.key] ?? "",
											)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
