import { useSyncExternalStore } from "react";

/**
 * La organización en la que está parado el superadmin.
 *
 * El superadmin ve todas las empresas a la vez; elegir una en el selector del
 * menú le permite trabajar como si estuviera dentro de ella: las listas se
 * filtran y lo que crea queda en esa empresa. `null` es "todas".
 *
 * Para cualquier otro rol esto no aplica: su organización es siempre la de su
 * sesión, y el backend la impone desde el token.
 */
const CLAVE = "onboardpro.tenantActivo";
const oyentes = new Set<() => void>();

function leer(): string | null {
	try {
		return localStorage.getItem(CLAVE);
	} catch {
		// Modo privado o almacenamiento bloqueado: se arranca en "todas".
		return null;
	}
}

export function setTenantActivo(tenantId: string | null) {
	try {
		if (tenantId) localStorage.setItem(CLAVE, tenantId);
		else localStorage.removeItem(CLAVE);
	} catch {
		// Sin almacenamiento se pierde al recargar, pero el cambio igual aplica.
	}
	for (const avisar of oyentes) avisar();
}

function suscribir(avisar: () => void) {
	oyentes.add(avisar);
	return () => oyentes.delete(avisar);
}

export function useTenantActivo() {
	return useSyncExternalStore(suscribir, leer, () => null);
}

/** Deja solo lo de la organización activa. Sin organización activa, devuelve todo. */
export function deLaOrganizacion<T extends { tenantId?: string | null }>(
	items: T[] | undefined,
	tenantId: string | null,
) {
	if (!items || !tenantId) return items;
	return items.filter((i) => i.tenantId === tenantId);
}
