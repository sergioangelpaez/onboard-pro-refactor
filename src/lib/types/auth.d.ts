interface LocalUserResponse {
	user: User;
	token: string;
	/** La contraseña es temporal: hay que cambiarla antes de seguir. */
	debeCambiarPassword?: boolean;
}

interface GetMeResponse {
	message: string;
	userData: User;
}
