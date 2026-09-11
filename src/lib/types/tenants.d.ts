interface Tenant {
	id: number;
	name: string;
	domain: string;
	active: boolean;
	createdAt: string;
}

interface CreateTenantPayload {
	name: string;
	domain: string;
}
